var CACHE_NAME = "ironman-v25";

var SHELL_FILES = [
  "./index.html",
  "./plan.html",
  "./lifting.html",
  "./log.html",
  "./plan-5k.html",
  "./app.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.svg",
  "./icon-512.svg"
];

var NETWORK_FIRST = [
  "index.html",
  "plan.html",
  "lifting.html",
  "log.html",
  "plan-5k.html",
  "app.css",
  "app.js",
  "plan-him.json",
  "lifting.json",
  "database.json"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_FILES);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(e) {
  var url = new URL(e.request.url);
  var path = url.pathname.split("/").pop();

  var isData = url.pathname.indexOf("plan-him.json") !== -1 ||
               url.pathname.indexOf("database.json") !== -1 ||
               url.pathname.indexOf("context.md") !== -1 ||
               url.pathname.indexOf("worklog.md") !== -1 ||
               url.pathname.indexOf("nutrition-log.md") !== -1;

  if (isData || NETWORK_FIRST.indexOf(path) !== -1) {
    e.respondWith(networkFirst(e.request));
  } else {
    e.respondWith(staleWhileRevalidate(e.request));
  }
});

function networkFirst(request) {
  return fetch(request).then(function(response) {
    if (response.ok) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(request, clone);
      });
    }
    return response;
  }).catch(function() {
    return caches.match(request);
  });
}

function staleWhileRevalidate(request) {
  return caches.match(request).then(function(cached) {
    var fetched = fetch(request).then(function(response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, clone);
        });
      }
      return response;
    }).catch(function() {
      return cached;
    });
    return cached || fetched;
  });
}
