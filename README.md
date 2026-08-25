# ANA Tokyo Mega Hub

**A fully researched aviation strategy proposal — built as a live, interactive airline website**

Built by Rayan Kuribayashi · [Live Site](https://ryankuribayashi.github.io/ANA-TOKYO-HUB-CONCEPT/) · [Portfolio](https://ryankuribayashi.github.io/)

## What It Is

The ANA Tokyo Mega Hub is a fully functional, publicly live airline website presenting a complete strategic proposal for transforming Narita International Airport into Asia's premier long-haul transfer hub — comparable in ambition to what Emirates did for Dubai or Singapore Airlines did for Changi.

This project started not as a coding exercise, but as a genuine aviation question: why isn't Tokyo one of the world's great transfer hubs? Tokyo is the world's most visited city, Japan is one of the largest aviation markets on earth, and ANA is a five-star carrier with one of the youngest widebody fleets in Asia — yet international passengers routing between Southeast Asia and North America fly through Dubai, Singapore, and Doha instead. The gap is real, documented, and addressable.

This site is the answer to that question, built as a product.

## Built With AI

Every part of this project — the strategic modeling, the ~120-route flight-data architecture, the timezone and connection-time math, the UI, and the ongoing feature work — was built through sustained, iterative collaboration with Claude (Anthropic's AI), used as a full development partner rather than a one-off code generator.

That workflow looked less like "prompt in, code out" and more like running an actual engineering process: I'd bring the aviation domain knowledge and the design decisions (route networks, fleet deployment strategy, cabin configurations, hub connection logic), and Claude would translate that into working code, then verify its own work by actually running the search logic against dozens of route combinations before calling anything done — not just writing code and hoping it worked. Several real bugs got caught and fixed this way over the course of the project: a data model that silently mislabeled which hub a connection actually routed through, a stale aircraft-pricing flag that had never been checked anywhere in the codebase, gate assignments falling into the wrong terminal because a new destination was missing from a lookup table.

The most recent example: I designed a two-tier seat configuration strategy for three widebody aircraft types — a smaller flagship "Premium" cabin mix for the highest-yield routes, and a higher-density "Main Trunk" config for the rest of the network — specified the exact seat counts, and worked through the routing logic (which bank on which route gets which aircraft, reasoning about crew/ground-handling efficiency) collaboratively with Claude. It then implemented the split across the full route network, updated every affected fare and terminal assignment, and rebuilt the Fleet page to document it — the same back-and-forth process used throughout the project, treating AI as a technical collaborator for turning aviation-strategy thinking into a real, working product rather than as a shortcut around learning either domain.

## The Strategy

### 1. Dual-Hub Architecture

Rather than concentrating everything at Narita (NRT), the proposal adds Osaka Kansai (KIX) as a second international gateway — mirroring what Gulf carriers do with secondary hubs. KIX becomes a dedicated gateway for Southeast Asian routes, geographically closer to the region.

### 2. Three-Wave Bank System

Real hub operations are built around "banks" — waves of aircraft arriving and departing in tight windows so every arrival can connect to every departure. The hub is designed with three daily wave banks timed to optimize connections between North America, Europe, the Middle East, and Asia across 120+ routes.

### 3. Freedom Flights Program

The most original invention in the project. ANA doesn't fly directly to Dublin, Oslo, Budapest, or Madrid. But Lufthansa flies Frankfurt to those cities. Turkish Airlines flies Istanbul to Athens and Budapest.

Freedom Flights creates single-ticket, fully connected itineraries from Tokyo to dozens of cities ANA doesn't serve directly by routing through Star Alliance partner hubs — with one booking, one baggage check-in, and ANA Mileage Club earning on every segment. Modeled on real fifth-freedom and codeshare mechanics used in the industry, and extended to standalone codeshare-only cities (Casablanca, Lagos, Nairobi, São Paulo, Santiago, Buenos Aires, Rio, Bogotá, Lima, Nadi, Papeete) that connect through the network without being counted as ANA destinations themselves.

## Pages & Features

**Homepage** (`index.html`) — Full flight search form with city autocomplete, Flatpickr date picker, passenger counts, cabin class selector, live currency switching across 12 currencies, EN/日本語 language toggle, animated hero with real aircraft photography.

**Flight Results** (`results.html`) — Processes search parameters and renders matching itineraries from the data layer. Every itinerary — direct, 2-leg, or 3-leg — renders through a single generic segment/layover data model, so a connection is never mislabeled regardless of how many real stops it involves. Each result shows flight number, aircraft type, departure/arrival times converted from JST, duration, and tiered pricing across Economy, Premium Economy, Business, and First Class. Embedded Leaflet.js map draws the route arc in real time.

**Destinations** (`destinations.html`) — Interactive Leaflet.js world map with 120+ animated route arcs, plus a full scrollable route table organized into geographic categories with sticky filter bar navigation. Every row shows aircraft type, flight number, duration, times, frequency, pricing, and codeshare information.

**Fleet** (`fleet.html`) — Every aircraft type as a clickable photo widget, including split "Premium" vs "Main Trunk" seat-configuration variants for the 777-9, A350-1000, and A350-900, plus dedicated domestic configurations for the A350-900 and 787-8. Each opens a modal overlay revealing full cabin configurations, seat counts by class, regional routes, range, and cruise speed.

**Newsroom** (`news.html`) — Editorially designed press page with featured story, article grid, and press release archive — written in real ANA press release style referencing actual route data from the site.

**Terminal Map** (`terminal.html`) — Interactive, zoomable/pannable SVG diagram of the full airport layout (T1 Asia, T1/JAL Domestic, T2 Main Concourse, and the T2A/T2B isolated satellites), with each zone clickable for its gate range, remote stands, region served, peak-bank demand, and a capacity read (comfortable / near capacity / over capacity) driven by the actual route data. Every zone's carrier list is broken out by alliance — Star Alliance, Oneworld, SkyTeam, and unaligned independents — each with its own numbered gate range, reflecting every international airline actually operating in and out of Haneda/Narita today, not just ANA's own Star Alliance partners.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5 / CSS3 / JavaScript — no frameworks |
| Maps | Leaflet.js |
| Date picker | Flatpickr |
| Typography | Inter (Latin) + Noto Sans JP (Japanese) via Google Fonts |
| Data | Modular JS files: `airports.js`, `flights.js`, `map.js`, `results.js`, `booking.js`, `itinerary-view.js`, `currencies.js`, `nav.js` |
| Deployment | GitHub Pages |

Built entirely in vanilla HTML, CSS, and JavaScript — no React, no frameworks, no build pipeline. Every layout, animation, modal, map interaction, and language toggle was coded from scratch.

## Data Architecture

All flight schedules, pricing, aircraft assignments, and connection logic live in structured JavaScript files:

- `airports.js` — coordinates, city names, timezone offsets
- `flights.js` — full schedule: NRT routes, KIX routes, partner operations, codeshare connections, aircraft variant assignments. Departure/arrival times stored as JST minute-offsets and converted dynamically. Pricing across four cabin tiers.
- `itinerary-view.js` — shared renderer that turns any itinerary's segment/layover data into the expanded flight-details view, used by both the search results and booking pages
- `map.js` — Leaflet layer management and great-circle arc drawing
- `results.js` / `booking.js` — query parsing, flight matching, DOM generation
- `currencies.js` — live conversion rates and symbol formatting
- `nav.js` — scroll-aware navbar and hamburger menu

Every number is internally consistent: flight durations are realistic, pricing reflects distance and aircraft type, KIX routes are priced lower than NRT for Southeast Asian destinations because KIX is geographically closer.

## Live Site

[ryankuribayashi.github.io/ANA-TOKYO-HUB-CONCEPT](https://ryankuribayashi.github.io/ANA-TOKYO-HUB-CONCEPT)

Built by Rayan Kuribayashi · ryankuribayashi3@gmail.com · [ryankuribayashi.github.io](https://ryankuribayashi.github.io/)
