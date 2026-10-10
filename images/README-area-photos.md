# Research area photographs — what to drop in

The three research areas on `research.html` currently show **research figures**
(`palisades-wind-map.jpg`, `responsibility-concept.jpg`, `lcz-city-maps.jpg`).

Those are data figures. The reference site (adam-nayak.stanford.edu/research)
uses **subject photography** for its areas instead — its own alt text reads
"A hurricane seen from orbit", "A flood barrier running along a river",
"An aerial view of a flooded residential neighbourhood", "A supercell
thunderstorm over farmland". The research figures live in the detail, and the
photographs set the subject. That split is why the page reads as polished.

## What's needed

| Area | Filename | Subject |
|---|---|---|
| Computational Environmental Modeling | `area-modeling.jpg` | A wildfire: flame front at night, a smoke column from the air, or a pyrocumulonimbus |
| Disaster Resilience | `area-resilience.jpg` | Homes at the wildland edge: an aerial of a WUI neighborhood against unburned chaparral, or a burned street |
| Geospatial Data Science | `area-geospatial.jpg` | Earth observation: satellite view of terrain, or a city from orbit |

## Specs

- Landscape, roughly **3:2**, at least **1200 x 800 px**
- JPG, ideally under **400 KB** each
- The frame is 420 x 260 px, so with `cover` the **centre** of the image shows —
  keep the subject centred
- Dark-on-light or light-on-dark both work; the backdrop is a pale tint

## Where to get them

1. **Your own Catalan Fire Service fieldwork photos would be best** for the
   first two. They are authentically yours and they substantiate the
   "field-tested on active wildfires" claim that the text makes. No stock image
   can do that.
2. NASA Earth Observatory / USGS Landsat — public domain, ideal for the third.
3. Unsplash or Pexels — free, no attribution required, strong wildfire and
   aerial libraries.
4. AI-generated is fine for mood, but note it cannot honestly be captioned as a
   real event, so avoid implying it depicts a specific fire.

## After dropping them in

1. Point the three `<img src>` values in `research.html` at the new files.
2. In `styles.css`, find the `PHOTO SWITCH` comment in `.ra-figure img` and
   change `object-fit: contain; padding: 0.5rem;` to
   `object-fit: cover; padding: 0;` so the photos fill the frame.
