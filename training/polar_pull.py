#!/usr/bin/env python3
"""
Pull Polar Flow exercises (Verity Sense recordings, e.g. swim HR) via the
official Polar AccessLink v3 API into training/polar/.

One-time setup:
  1. Create a client at https://admin.polaraccesslink.com
     (redirect URL: http://localhost:8080/callback).
  2. Save its credentials (never commit them):
       ~/.config/polar-accesslink/credentials.json
       {"client_id": "...", "client_secret": "..."}
  3. python3 training/polar_pull.py --auth
     (opens the Polar consent page, stores the token next to the credentials)

Then after each Polar recording has synced to Flow:
  python3 training/polar_pull.py

Saves <date>_<sport>_<id>.json (summary + parsed samples) and .fit per
exercise, skipping ones already pulled. AccessLink only serves exercises
recorded after --auth, uploaded to Flow in the last 30 days.
"""
import base64, json, os, secrets, sys, urllib.error, urllib.parse, urllib.request, webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer

CONF_DIR = os.path.expanduser("~/.config/polar-accesslink")
CREDS = os.path.join(CONF_DIR, "credentials.json")
TOKEN = os.path.join(CONF_DIR, "token.json")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "polar")

AUTH_URL = "https://flow.polar.com/oauth2/authorization"
TOKEN_URL = "https://polarremote.com/v2/oauth2/token"
API = "https://www.polaraccesslink.com/v3"
REDIRECT = "http://localhost:8080/callback"

# AccessLink sample-type codes
SAMPLE_TYPES = {"0": "hr", "1": "speed_kmh", "2": "cadence", "3": "altitude_m",
                "4": "power_w", "9": "temperature_c", "10": "distance_m", "11": "rr_ms"}


def load(path):
    if not os.path.exists(path):
        hint = "create it (see setup in this file's docstring)" if path == CREDS else "run with --auth first"
        sys.exit(f"Missing {path}: {hint}.")
    with open(path) as f:
        return json.load(f)


def save_private(path, data):
    os.makedirs(CONF_DIR, mode=0o700, exist_ok=True)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump(data, f, indent=1)


def request(url, token=None, basic=None, data=None, accept="application/json", ctype=None):
    headers = {"Accept": accept}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if basic:
        headers["Authorization"] = "Basic " + base64.b64encode(basic.encode()).decode()
    if ctype:
        headers["Content-Type"] = ctype
    req = urllib.request.Request(url, data=data, headers=headers,
                                 method="POST" if data is not None else "GET")
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.status, r.read()


def auth():
    creds = load(CREDS)
    state = secrets.token_urlsafe(16)
    result = {}

    class Callback(BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            ok = q.get("state", [""])[0] == state and "code" in q
            if ok:
                result["code"] = q["code"][0]
            self.send_response(200 if ok else 400)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Done, return to the terminal." if ok else b"Authorization failed.")

        def log_message(self, *a):
            pass

    url = AUTH_URL + "?" + urllib.parse.urlencode({
        "response_type": "code", "client_id": creds["client_id"],
        "redirect_uri": REDIRECT, "state": state})
    print("Opening the Polar consent page:\n " + url)
    webbrowser.open(url)
    server = HTTPServer(("127.0.0.1", 8080), Callback)
    while "code" not in result:
        server.handle_request()

    _, body = request(TOKEN_URL, basic=f"{creds['client_id']}:{creds['client_secret']}",
                      data=urllib.parse.urlencode({"grant_type": "authorization_code",
                                                   "code": result["code"],
                                                   "redirect_uri": REDIRECT}).encode(),
                      ctype="application/x-www-form-urlencoded")
    tok = json.loads(body)
    save_private(TOKEN, {"access_token": tok["access_token"], "user_id": tok["x_user_id"],
                         "expires_in": tok.get("expires_in")})

    try:
        request(API + "/users", token=tok["access_token"],
                data=json.dumps({"member-id": f"polar-pull-{tok['x_user_id']}"}).encode(),
                ctype="application/json")
        print("Registered with AccessLink.")
    except urllib.error.HTTPError as e:
        if e.code != 409:   # 409 = already registered
            raise
        print("Already registered with AccessLink.")
    print(f"Token saved to {TOKEN} (mode 600).")


def g(d, key, default=None):
    """AccessLink returns snake_case keys; the docs show hyphenated ones."""
    return d.get(key, d.get(key.replace("-", "_"), default))


def parse_samples(ex):
    out = {}
    for s in ex.get("samples") or []:
        st = str(g(s, "sample-type"))
        key = SAMPLE_TYPES.get(st, "type_" + st)
        vals = [float(v) if v not in ("", "NaN") else None for v in (s.get("data") or "").split(",")]
        out[key] = {"rate_s": g(s, "recording-rate"), "values": vals}
    return out


def pull():
    tok = load(TOKEN)["access_token"]
    os.makedirs(OUT, exist_ok=True)
    _, body = request(API + "/exercises?samples=true&zones=true", token=tok)
    exercises = json.loads(body) if body else []
    new = 0
    for ex in exercises:
        sport = (g(ex, "detailed-sport-info") or ex.get("sport") or "exercise").lower()
        stem = f"{g(ex, 'start-time')[:16].replace(':', '')}_{sport}_{ex['id']}"
        path = os.path.join(OUT, stem + ".json")
        if os.path.exists(path):
            continue
        record = {k: v for k, v in ex.items() if k != "samples"}
        record["samples_parsed"] = parse_samples(ex)
        with open(path, "w") as f:
            json.dump(record, f, indent=1)
        _, fit = request(f"{API}/exercises/{ex['id']}/fit", token=tok, accept="*/*")
        with open(os.path.join(OUT, stem + ".fit"), "wb") as f:
            f.write(fit)
        hr = record["samples_parsed"].get("hr", {}).get("values") or []
        hr = [v for v in hr if v]
        print(f"Saved {stem}: {ex.get('duration')}, HR samples {len(hr)}"
              + (f", avg {sum(hr) / len(hr):.0f} max {max(hr):.0f}" if hr else ""))
        new += 1
    print(f"{new} new exercise(s); {len(exercises)} available in the 30-day window.")


if __name__ == "__main__":
    if "--auth" in sys.argv:
        auth()
    else:
        pull()
