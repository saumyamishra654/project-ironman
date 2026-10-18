# Swim Progression: What 10 Years Could Look Like

*Research brief for Saumya, 12 October 2026. Covers how former competitive swimmers lose and regain fitness, how swimmers improve near their ceiling, age effects, wetsuit and open-water effects, and a lower-confidence 10-year CSS projection (age 22 → 32). Every number has a link. Lines marked "my arithmetic" or "estimate" are calculations or judgement, not cited facts.*

---

## Executive summary

1. **Long detraining wipes recent gains but leaves a floor.** In athletes, VO₂max drops markedly but stays above untrained levels; recently acquired gains are lost completely. Lactate threshold drops but stays above untrained values in the highly trained ([Mujika & Padilla 2000](https://pubmed.ncbi.nlm.nih.gov/10999420/)). Even 5 weeks off cut collegiate swimmers' VO₂peak by about 8% (46.7 → 43.1) ([Ormsbee 2012](https://pubmed.ncbi.nlm.nih.gov/22027854/)).
2. **His technique is the retained asset.** As a former state-level swimmer, what he lost is mostly engine, which comes back faster than skill. That points to quick early CSS gains. This is an estimate; no study tracks returning competitive swimmers over years.
3. **Near the ceiling, swimmers improve slowly.** World-ranked swimmers improved about **0.6–1% per season** and **3–4% over 5 seasons** ([Costa 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC3761712/)).
4. **No age decline before 32.** Masters 1500 m performance peaks at **35–40** and then declines roughly linearly ([Tanaka & Seals 1997](https://pubmed.ncbi.nlm.nih.gov/9074973/)), at about **0.6% per year** up to 70 ([Rubin 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC3781853/)).
5. **A wetsuit is a big free gain.** Wetsuits cut swim time by **4.96% (400 m)** and **3.23% (1500 m)**, more for leaner swimmers ([Cordain & Kopriva 1991](https://pmc.ncbi.nlm.nih.gov/articles/PMC1478803/)). The gain comes from technique and propulsion efficiency, not VO₂max ([Tomikawa 2009](https://pubmed.ncbi.nlm.nih.gov/18083064/)). Norseman (cold fjord) is a wetsuit swim. A warm-sea Goa race may not be.
6. **The swim matters least in a 70.3.** Cycling is the best predictor of total time and takes up 50–60% of the race. Swim time correlates with total time at r = 0.63 for men, against 0.85 for cycling ([70.3 systematic review 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC13379040/)).
7. **CSS is a valid threshold marker.** Critical speed from a distance–time regression tracks the 4 mM lactate speed and 400 m performance ([Wakayoshi 1992](https://pubmed.ncbi.nlm.nih.gov/1521952/)).

---

## 1. Baseline

- **CSS test, Aug 22 2026:** CSS **2:18/100 m**. 400 m time trial 8:35 (2:08.8/100 m, HR 173); ~192 m time trial 3:47 (1:58/100 m). Recovery between the two was full, so the test is valid.
- **The 11 s/100 m gap between the 192 m and 400 m paces** says top-end speed is intact and fatigue resistance is what's missing. That's the signature of a detrained engine with retained skill.
- **Training:** 2–3 swims a week, about 1.5–2.5 km each, in a 16 m pool.
- **Unknown:** his youth PBs. They would set the realistic ceiling better than anything in the literature.

---

## 2. Evidence

| Study | Finding |
|---|---|
| [Mujika & Padilla 2000](https://pubmed.ncbi.nlm.nih.gov/10999420/) | Long-term detraining: VO₂max declines but stays above control; recent gains are fully lost. Lactate threshold falls but stays above untrained values in the highly trained. Muscle-level oxidative adaptations decline. |
| [Ormsbee 2012](https://pubmed.ncbi.nlm.nih.gov/22027854/) (collegiate swimmers) | About 5 weeks off: VO₂peak 46.7 → 43.1 mL/kg/min; fat mass +1.8 kg. |
| [Costa 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC3761712/) (477 world-ranked men, 5 seasons) | 0.6–1% improvement per season leading up to the Olympics; 3–4% over the whole period. |
| [Tanaka & Seals 1997](https://pubmed.ncbi.nlm.nih.gov/9074973/) (US Masters) | 1500 m freestyle declines linearly from a peak at 35–40 years until about 70. |
| [Rubin 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC3781853/) | National-champion masters decline about 0.6% per year up to age 70. |
| [Cordain & Kopriva 1991](https://pmc.ncbi.nlm.nih.gov/articles/PMC1478803/) (n=14 competitive swimmers) | Wetsuit: 400 m −4.96%, 1500 m −3.23%. Leaner swimmers benefit more (r = −0.54 with density over 1500 m). |
| [Tomikawa 2009](https://pubmed.ncbi.nlm.nih.gov/18083064/) (n=12 triathletes) | Wetsuit improved 400 m speed without changing VO₂max, through technique and propulsion. |
| [Wakayoshi 1992](https://pubmed.ncbi.nlm.nih.gov/1521952/) | Critical speed (pool and flume) is a practical index of endurance, linked to the 4 mM lactate speed and 400 m speed. |
| [70.3 systematic review 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC13379040/) (86 studies) | Swim correlation with total time: 0.46 (women) / 0.63 (men), vs cycling 0.85. Recreational triathletes train 6.5–11.5 h/week, and swimming gets the least volume. |

---

## 3. Conflicts and weak evidence

- **No study follows a returning competitive swimmer over years.** The regain curve here is an estimate built from detraining physiology plus the fact that his technique is retained.
- Costa and Pyne-type progression data come from **world-ranked** swimmers at full training volume (40–80 km/week), not a triathlete on 6–8 km/week.
- Wetsuit data are from **pool trials** with small samples. Open-water sighting, waves and the lack of walls add time in ways the studies don't measure.

## 4. Evidence gaps

- What his youth best times were. With those, the ceiling estimate would be much better.
- Open-water conversion (pool CSS → sea race pace) for age-group triathletes lacks good peer-reviewed numbers.
- No age-group 70.3 swim-split distribution was available in the papers I could read. The large 70.3 datasets report correlations, not split percentiles.

---

## 5. Parameters for modelling (lower confidence, used in the HTML report)

Model: CSS(t) = 138 s × (1 − G·(1 − e^(−t/τ))), τ = 1.5 years (fast regain of a detrained engine with retained skill).

| Parameter | Slow | Median | Fast | Basis |
|---|---|---|---|---|
| Total CSS gain G | −9% (→ ~2:06) | −16.5% (→ ~1:55) | −24% (→ ~1:45) | **estimate**: detrained engine with retained skill; gains well above Costa's elite 3–4% in 5 years because he's far from his ceiling |
| Timing | 63% of the gain by year 1.5 | | | **estimate** (τ = 1.5 y) |
| Age effect to 32 | 0 | 0 | 0 | **cited**: peak 35–40 ([Tanaka & Seals 1997](https://pubmed.ncbi.nlm.nih.gov/9074973/)) |
| Wetsuit (Norseman) | −3% to −5% time | | | **cited** ([Cordain 1991](https://pmc.ncbi.nlm.nih.gov/articles/PMC1478803/)) |
| 1.9 km race pace | CSS + ~6 s/100 m, no wetsuit | | | **estimate** (open water, no walls, pacing for the bike) |

Projected CSS (model output): now 2:18 → year 1: 2:12 / 2:07 / 2:02 → year 3: 2:07 / 1:58 / 1:49 → year 10: 2:06 / 1:55 / 1:45 (slow / median / fast).
That gives 1.9 km split estimates at Goa 2027 of **~44 / 42 / 40 min** (no wetsuit).

---

## 6. What this means for Saumya

- **Swimming is not where the race will be won or lost.** Even the slow curve gives a respectable 70.3 swim, and the bike is worth 3–4× more of the total.
- **The cheap gains are early:** two or three consistent swims a week with a threshold set (CSS reps) should move CSS quickly over 12–18 months. Retest CSS every 6–8 weeks.
- **To sharpen the projection, send me your old PBs** (100/400/1500 free or similar). They anchor the ceiling much better than population data.

---

## Sources

- Mujika I, Padilla S. 2000. Detraining: loss of training-induced physiological and performance adaptations, Part II. *Sports Med*. https://pubmed.ncbi.nlm.nih.gov/10999420/
- Ormsbee MJ, Arciero PJ. 2012. Detraining increases body fat and weight and decreases VO₂peak and metabolic rate. *JSCR*. https://pubmed.ncbi.nlm.nih.gov/22027854/
- Costa MJ et al. 2010. Tracking the performance of world-ranked swimmers. *J Sports Sci Med*. https://pmc.ncbi.nlm.nih.gov/articles/PMC3761712/
- Tanaka H, Seals DR. 1997. Age and gender interactions in physiological functional capacity: swimming performance. *J Appl Physiol*. https://pubmed.ncbi.nlm.nih.gov/9074973/
- Rubin RT, Rahe RH. 2010. Effects of aging in Masters swimmers: 40-year review. *Open Access J Sports Med*. https://pmc.ncbi.nlm.nih.gov/articles/PMC3781853/
- Cordain L, Kopriva R. 1991. Wetsuits, body density and swimming performance. *BJSM*. https://pmc.ncbi.nlm.nih.gov/articles/PMC1478803/
- Tomikawa M, Nomura T. 2009. Swim performance, VO₂max and peak power output when wearing a wetsuit. *JSAMS*. https://pubmed.ncbi.nlm.nih.gov/18083064/
- Wakayoshi K et al. 1992. A simple method for determining critical speed as swimming fatigue threshold. *IJSM*. https://pubmed.ncbi.nlm.nih.gov/1521952/
- von Känel-Cordoba et al. 2026. Performance, physiology, and determinants of success in IRONMAN 70.3: a systematic review. *PLoS One*. https://pmc.ncbi.nlm.nih.gov/articles/PMC13379040/
