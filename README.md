[Uploading README_ana.md…]()
# ANA Tokyo Mega Hub

**A fully researched aviation strategy proposal — built as a live, interactive airline website**

Built by Rayan Kuribayashi · [Live Site](https://ryankuribayashi.github.io/ANA-TOKYO-HUB-CONCEPT) · [Portfolio](https://ryankuribayashi.github.io)

---

## What It Is

The ANA Tokyo Mega Hub is a fully functional, publicly live airline website presenting a complete strategic proposal for transforming Narita International Airport into Asia's premier long-haul transfer hub — comparable in ambition to what Emirates did for Dubai or Singapore Airlines did for Changi.

This project started not as a coding exercise, but as a genuine aviation question: **why isn't Tokyo one of the world's great transfer hubs?** Tokyo is the world's most visited city, Japan is one of the largest aviation markets on earth, and ANA is a five-star carrier with one of the youngest widebody fleets in Asia — yet international passengers routing between Southeast Asia and North America fly through Dubai, Singapore, and Doha instead. The gap is real, documented, and addressable.

This site is the answer to that question, built as a product.

---

## The Strategy

### 1. Dual-Hub Architecture
Rather than concentrating everything at Narita (NRT), the proposal adds **Osaka Kansai (KIX)** as a second international gateway — mirroring what Gulf carriers do with secondary hubs. KIX becomes a dedicated gateway for Southeast Asian routes, geographically closer to the region.

### 2. Three-Wave Bank System
Real hub operations are built around "banks" — waves of aircraft arriving and departing in tight windows so every arrival can connect to every departure. The hub is designed with **three daily wave banks** timed to optimize connections between North America, Europe, the Middle East, and Asia across 115+ routes.

### 3. Freedom Flights Program
The most original invention in the project. ANA doesn't fly directly to Dublin, Oslo, Budapest, or Madrid. But Lufthansa flies Frankfurt to those cities. Turkish Airlines flies Istanbul to Athens and Budapest.

**Freedom Flights** creates single-ticket, fully connected itineraries from Tokyo to **31 European cities** by routing through Star Alliance partner hubs — with one booking, one baggage check-in, and ANA Mileage Club earning on every segment. Modeled on real fifth-freedom and codeshare mechanics used in the industry.

---

## Pages & Features

**Homepage (index.html)**
Full flight search form with city autocomplete, Flatpickr date picker, passenger counts, cabin class selector, live currency switching across 12 currencies (JPY, USD, EUR, GBP, AUD and more), EN/日本語 language toggle, animated hero with real aircraft photography.

**Flight Results (results.html)**
Processes search parameters and renders matching itineraries from the data layer. Each result shows flight number, aircraft type, departure/arrival times converted from JST, duration, and tiered pricing across Economy, Premium Economy, Business, and First Class. Embedded Leaflet.js map draws the route arc in real time.

**Destinations (destinations.html)**
Interactive Leaflet.js world map with 115+ animated route arcs, plus a full scrollable route table organized into nine geographic categories with sticky filter bar navigation. Every row shows aircraft type, flight number, duration, times, frequency, pricing, and codeshare information.

**Fleet (fleet.html)**
Five aircraft types as clickable photo widgets. Each opens a modal overlay revealing full cabin configurations, seat counts by class, regional routes, range, and cruise speed.

**Newsroom (news.html)**
Editorially designed press page with featured story, article grid, and a 10-item press release archive — all written in real ANA press release style referencing actual route data from the site.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5 / CSS3 / JavaScript — no frameworks |
| Maps | Leaflet.js |
| Date picker | Flatpickr |
| Typography | Inter (Latin) + Noto Sans JP (Japanese) via Google Fonts |
| Data | Modular JS files: airports.js, flights.js, map.js, results.js, currencies.js, nav.js |
| Deployment | GitHub Pages |

Built entirely in vanilla HTML, CSS, and JavaScript — no React, no frameworks, no build pipeline. Every layout, animation, modal, map interaction, and language toggle was coded from scratch.

---

## Data Architecture

All flight schedules, pricing, aircraft assignments, and connection logic live in structured JavaScript files:

- **airports.js** — coordinates, city names, timezone offsets
- **flights.js** — full schedule: NRT routes, KIX routes, partner operations, Freedom Flights connections. Departure/arrival times stored as JST minute-offsets and converted dynamically. Pricing in JPY across four cabin tiers.
- **map.js** — Leaflet layer management and great-circle arc drawing
- **results.js** — query parsing, flight matching, DOM generation
- **currencies.js** — live conversion rates and symbol formatting
- **nav.js** — scroll-aware navbar and hamburger menu

Every number is internally consistent: flight durations are realistic, pricing reflects distance and aircraft type, KIX routes are priced lower than NRT for Southeast Asian destinations because KIX is geographically closer.

---

## Live Site

**[ryankuribayashi.github.io/ANA-TOKYO-HUB-CONCEPT](https://ryankuribayashi.github.io/ANA-TOKYO-HUB-CONCEPT)**

---

*Built by Rayan Kuribayashi · ryankuribayashi3@gmail.com · [ryankuribayashi.github.io](https://ryankuribayashi.github.io)*
