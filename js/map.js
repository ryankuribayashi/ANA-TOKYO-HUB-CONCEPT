// ── Constants ──────────────────────────────────────────────────────────────
const HUB = { lat: 35.7647, lng: 140.3865, code: 'NRT' };

let miniMap = null, hubMap = null, resultsMap = null;
let routeLayers = [], hubMapLayers = [], resultsLayers = [];

// ── Coordinate math ────────────────────────────────────────────────────────
// Returns the shortest-path longitude difference from `a` to `b`
function shortestLngDiff(fromLng, toLng) {
    let d = toLng - fromLng;
    while (d > 180)  d -= 360;
    while (d < -180) d += 360;
    return d;
}

// Raw hub longitude in the same coordinate space as `from`
// (may be outside ±180 — that's intentional)
function rawHubLng(fromLng) {
    return fromLng + shortestLngDiff(fromLng, HUB.lng);
}

// Raw destination longitude in the same coordinate space as hubLng
function rawDestLng(hubLng, destLng) {
    return hubLng + shortestLngDiff(HUB.lng, destLng);
}

// Generate arc points — height proportional to span so multi-leg routes curve consistently
function arcPoints(fromLat, fromLng, toLat, toLng, n = 80) {
    const lngSpan = Math.abs(toLng - fromLng);
    const arcH    = lngSpan * 0.11;          // proportional: same curvature ratio on every leg
    const pts = [];
    for (let i = 0; i <= n; i++) {
        const t   = i / n;
        const lat = fromLat + (toLat - fromLat) * t;
        const arc = Math.sin(Math.PI * t) * arcH;
        const lng = fromLng + (toLng - fromLng) * t;
        pts.push([lat + arc, lng]);
    }
    return pts;
}

// Zoom level heuristic from bounding-box span
function zoomForSpan(lngSpan, latSpan) {
    if (lngSpan < 30  && latSpan < 20) return 4;
    if (lngSpan < 65  && latSpan < 35) return 3;
    return 2;
}

// ── Markers ────────────────────────────────────────────────────────────────
function markerIcon(color, isHub) {
    const sz = isHub ? 14 : 9;
    return L.divIcon({
        className: '',
        html: `<div style="
            width:${sz}px;height:${sz}px;border-radius:50%;
            background:${color};border:2px solid #fff;
            box-shadow:0 0 ${isHub ? 10 : 5}px ${color};"></div>`,
        iconSize: [sz, sz], iconAnchor: [sz/2, sz/2],
    });
}

// ── Layer management ───────────────────────────────────────────────────────
function clearRoutes(map, layers) {
    layers.forEach(l => { try { map.removeLayer(l); } catch(e){} });
    layers.length = 0;
}

// ── Core draw ──────────────────────────────────────────────────────────────
// All coordinates kept in a consistent raw number space (no ±180 clamping).
// Leaflet tiles wrap naturally, so lng=-220 shows the same tile as lng=140.
function drawRouteOnMap(map, layers, fromCode, toCode) {
    clearRoutes(map, layers);
    const from = AIRPORTS[fromCode];
    const to   = AIRPORTS[toCode];
    if (!from) return;

    // Single airport — just mark it
    if (!to) {
        const m = L.marker([from.lat, from.lng], { icon: markerIcon('#4A9EFF', false) }).addTo(map);
        map.setView([from.lat, from.lng], 3);
        layers.push(m);
        return;
    }

    // Consistent raw coordinate system anchored to `from`
    const hubLng = rawHubLng(from.lng);           // e.g. –219 for IAH→NRT
    const toLng  = rawDestLng(hubLng, to.lng);    // e.g. –259 for …→BKK

    const arc1 = arcPoints(from.lat, from.lng, HUB.lat, hubLng);
    const arc2 = arcPoints(HUB.lat, hubLng,   to.lat,  toLng);

    const l1 = L.polyline(arc1, { color:'#C9A84C', weight:2.5, opacity:0.9, dashArray:'8,5' }).addTo(map);
    const l2 = L.polyline(arc2, { color:'#C9A84C', weight:2.5, opacity:0.9, dashArray:'8,5' }).addTo(map);

    // Markers at their raw coordinate positions (Leaflet wraps tiles automatically)
    const mFrom = L.marker([from.lat, from.lng], { icon: markerIcon('#4A9EFF', false) }).addTo(map);
    const mHub  = L.marker([HUB.lat,  hubLng],   { icon: markerIcon('#C9A84C', true)  }).addTo(map);
    const mTo   = L.marker([to.lat,   toLng],     { icon: markerIcon('#4A9EFF', false) }).addTo(map);

    mFrom.bindTooltip(from.city,   { permanent:true, className:'map-label',         direction:'top', offset:[0,-8]  }).openTooltip();
    mHub.bindTooltip('Tokyo Hub',  { permanent:true, className:'map-label map-label-hub', direction:'top', offset:[0,-10] }).openTooltip();
    mTo.bindTooltip(to.city,       { permanent:true, className:'map-label',         direction:'top', offset:[0,-8]  }).openTooltip();

    layers.push(l1, l2, mFrom, mHub, mTo);

    // Fit map — tighter padding so route fills the frame
    const allPts = [...arc1, ...arc2];
    const isMini = map._container && map._container.id === 'mini-map';
    map.fitBounds(L.latLngBounds(allPts), {
        padding: isMini ? [14, 14] : [40, 40],
        maxZoom: isMini ? 5 : 4,
    });
}

// ── Mini-map (homepage) ────────────────────────────────────────────────────
function initMiniMap() {
    if (miniMap) return;
    miniMap = L.map('mini-map', {
        zoomControl: false, scrollWheelZoom: false,
        dragging: false, doubleClickZoom: false, attributionControl: false,
        preferCanvas: true,
    }).setView([25, 140], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(miniMap);
}

function updateMiniMap(fromCode, toCode) {
    initMiniMap();
    const preview = document.getElementById('mapPreview');
    if (!fromCode && !toCode) { preview.classList.remove('visible'); return; }
    preview.classList.add('visible');
    setTimeout(() => {
        miniMap.invalidateSize();
        drawRouteOnMap(miniMap, routeLayers, fromCode, toCode);
        updateRouteInfo(fromCode, toCode);
    }, 50);
}

function updateRouteInfo(fromCode, toCode) {
    const el = document.getElementById('mapRouteInfo');
    if (!el) return;
    const from = AIRPORTS[fromCode], to = AIRPORTS[toCode];
    if (from && to) {
        el.innerHTML = `<span class="route-city">${from.city}</span>
            <span class="route-arrow"> → <span class="route-hub">Tokyo Hub</span> → </span>
            <span class="route-city">${to.city}</span>`;
    } else if (from) {
        el.innerHTML = `<span class="route-city">${from.city} (${fromCode})</span>
            <span class="route-arrow"> → Enter destination</span>`;
    }
}

// ── Hub map (homepage section) ─────────────────────────────────────────────
function initHubMap() {
    if (hubMap) return;
    const el = document.getElementById('hubMap');
    if (!el) return;
    hubMap = L.map('hubMap', {
        zoomControl: false, scrollWheelZoom: false,
        dragging: false, doubleClickZoom: false, attributionControl: false,
        preferCanvas: true,
    }).setView([30, 140], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(hubMap);

    L.marker([HUB.lat, HUB.lng], { icon: markerIcon('#C9A84C', true) }).addTo(hubMap);

    // Sample outbound routes from hub — kept in hub-anchored coordinate space
    const samples = ['JFK','LAX','LHR','SIN','SYD','CDG','BKK','DEL','IAH'];
    samples.forEach(code => {
        const ap = AIRPORTS[code];
        if (!ap) return;
        const destLng = rawDestLng(HUB.lng, ap.lng); // consistent with hub at 140
        const pts = arcPoints(HUB.lat, HUB.lng, ap.lat, destLng, 50);
        L.polyline(pts, { color:'#C9A84C', weight:1, opacity:0.28, dashArray:'4,8' }).addTo(hubMap);
    });
}

// ── Results map ────────────────────────────────────────────────────────────
function initResultsMap(fromCode, toCode) {
    if (resultsMap) {
        drawRouteOnMap(resultsMap, resultsLayers, fromCode, toCode);
        return;
    }
    resultsMap = L.map('results-map', {
        zoomControl: false, scrollWheelZoom: false, dragging: false,
        doubleClickZoom: false, touchZoom: false, keyboard: false,
        attributionControl: false, preferCanvas: true,
    }).setView([30, 160], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(resultsMap);
    drawRouteOnMap(resultsMap, resultsLayers, fromCode, toCode);
}

// ── Animated Flight Map ───────────────────────────────────────────────────────
let animMap = null;
let animFrameId = null;

function stopAnimLoop() {
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
}

// Ease in-out cubic
function easeInOut(t) { return t < 0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; }

// Interpolate position along arc array
function interpArc(pts, t) {
    const n = pts.length - 1;
    const fi = Math.max(0, Math.min(t, 1)) * n;
    const i  = Math.min(Math.floor(fi), n - 1);
    const f  = fi - i;
    return [pts[i][0] + (pts[i+1][0]-pts[i][0])*f, pts[i][1] + (pts[i+1][1]-pts[i][1])*f];
}

// Bearing from north, clockwise, for SVG rotation
function pathBearing(p1, p2) {
    return Math.atan2(p2[1]-p1[1], p2[0]-p1[0]) * 180 / Math.PI;
}

function planeSVG() {
    // Top-down plane pointing right (east). CSS rotation: bearing-90 converts to north-up.
    return `<svg viewBox="0 0 60 60" width="38" height="38" style="overflow:visible;">
        <defs>
            <filter id="gp" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        <g filter="url(#gp)">
            <ellipse cx="30" cy="30" rx="21" ry="6" fill="#C9A84C"/>
            <path d="M16 30 L32 9  L40 13 L29 30 Z"  fill="#C9A84C" opacity="0.95"/>
            <path d="M16 30 L32 51 L40 47 L29 30 Z"  fill="#C9A84C" opacity="0.95"/>
            <path d="M9 30  L17 23 L21 25 Z"          fill="#C9A84C" opacity="0.80"/>
            <path d="M9 30  L17 37 L21 35 Z"          fill="#C9A84C" opacity="0.80"/>
            <circle cx="49" cy="30" r="3.5" fill="rgba(255,245,160,0.95)"/>
        </g>
    </svg>`;
}

function cityDotHtml(isHub) {
    if (isHub) {
        return `<div class="hub-dot-wrap">
            <div class="hub-ring"></div>
            <div class="hub-ring-2"></div>
            <div style="width:14px;height:14px;border-radius:50%;background:#C9A84C;border:2.5px solid #fff;box-shadow:0 0 12px rgba(201,168,76,0.9);position:relative;z-index:2;"></div>
        </div>`;
    }
    return `<div style="width:10px;height:10px;border-radius:50%;background:#60A5FA;border:2px solid #fff;box-shadow:0 0 10px rgba(96,165,250,0.8);"></div>`;
}

function initAnimatedMap(fromCode, toCode) {
    stopAnimLoop();
    const el = document.getElementById('results-map');
    if (!el) return;

    // Destroy previous animated map
    if (animMap) { animMap.remove(); animMap = null; }

    // Remove old vignette/badge if any
    el.querySelectorAll('.map-vignette,.map-live-badge').forEach(e => e.remove());

    animMap = L.map('results-map', {
        zoomControl:false, scrollWheelZoom:false, dragging:false,
        doubleClickZoom:false, touchZoom:false, keyboard:false,
        attributionControl:false, preferCanvas:false,
    });

    // Satellite tiles (Esri World Imagery — free, no API key)
    L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom:19 }
    ).addTo(animMap);

    // Vignette overlay
    const vig = document.createElement('div');
    vig.className = 'map-vignette';
    el.appendChild(vig);

    // Live badge
    const badge = document.createElement('div');
    badge.className = 'map-live-badge';
    badge.innerHTML = '<div class="map-live-dot"></div><span class="map-live-text">LIVE ROUTE</span>';
    el.appendChild(badge);

    const from = AIRPORTS[fromCode];
    const to   = AIRPORTS[toCode];

    // Build arcs (handle NRT as from or to for direct flights)
    let arc1, arc2, fromPt, toPt, hubLng;

    const isKixFrom = fromCode === 'KIX';
    const isKixTo   = toCode   === 'KIX';
    const isKixDirect = isKixFrom || isKixTo;

    if (fromCode === 'NRT' && to) {
        hubLng = HUB.lng;
        const destLng = rawDestLng(HUB.lng, to.lng);
        arc1 = arcPoints(HUB.lat, HUB.lng, to.lat, destLng);
        arc2 = null;
        fromPt = { lat: HUB.lat, lng: HUB.lng, city: 'Tokyo Hub', isHub: true };
        toPt   = { lat: to.lat,  lng: destLng,   city: to.city || toCode };
    } else if (toCode === 'NRT' && from) {
        hubLng = rawHubLng(from.lng);
        arc1 = arcPoints(from.lat, from.lng, HUB.lat, hubLng);
        arc2 = null;
        fromPt = { lat: from.lat, lng: from.lng, city: from.city || fromCode };
        toPt   = { lat: HUB.lat,  lng: hubLng,   city: 'Tokyo Hub', isHub: true };
    } else if (isKixFrom && to) {
        const kix = AIRPORTS['KIX'];
        const destLng = rawDestLng(kix.lng, to.lng);
        arc1 = arcPoints(kix.lat, kix.lng, to.lat, destLng);
        arc2 = null;
        hubLng = kix.lng;
        fromPt = { lat: kix.lat, lng: kix.lng, city: 'Osaka Hub', isHub: true };
        toPt   = { lat: to.lat,  lng: destLng,  city: to.city || toCode };
    } else if (isKixTo && from) {
        const kix = AIRPORTS['KIX'];
        hubLng = kix.lng + shortestLngDiff(from.lng, kix.lng);
        arc1 = arcPoints(from.lat, from.lng, kix.lat, hubLng);
        arc2 = null;
        fromPt = { lat: from.lat, lng: from.lng, city: from.city || fromCode };
        toPt   = { lat: kix.lat,  lng: hubLng,   city: 'Osaka Hub', isHub: true };
    } else if (from && to) {
        hubLng = rawHubLng(from.lng);
        const destLng = rawDestLng(hubLng, to.lng);
        arc1 = arcPoints(from.lat, from.lng, HUB.lat, hubLng);
        arc2 = arcPoints(HUB.lat, hubLng, to.lat, destLng);
        fromPt = { lat: from.lat, lng: from.lng,  city: from.city || fromCode };
        toPt   = { lat: to.lat,   lng: destLng,    city: to.city  || toCode };
    } else {
        return;
    }

    const allPts = arc2 ? [...arc1, ...arc2] : arc1;
    animMap.fitBounds(L.latLngBounds(allPts), { padding:[60,60], maxZoom:4 });

    // Add city/hub markers
    function addMarker(lat, lng, label, isHub) {
        const m = L.marker([lat, lng], {
            icon: L.divIcon({
                className:'', html: cityDotHtml(isHub),
                iconSize: isHub ? [30,30] : [14,14],
                iconAnchor: isHub ? [15,15] : [7,7],
            })
        }).addTo(animMap);
        m.bindTooltip(label, {
            permanent:true,
            className: isHub ? 'map-label map-label-hub' : 'map-label',
            direction:'top', offset:[0, isHub ? -14 : -9],
        }).openTooltip();
        return m;
    }

    if (isKixDirect) {
        // KIX direct: mark origin/destination only (hub marker drawn via fromPt/toPt isHub flag)
        if (fromPt.isHub) {
            addMarker(fromPt.lat, fromPt.lng, fromPt.city, true);
        } else {
            addMarker(fromPt.lat, fromPt.lng, fromPt.city, false);
        }
        if (toPt && toPt.isHub) {
            addMarker(toPt.lat, toPt.lng, toPt.city, true);
        } else if (toPt) {
            addMarker(toPt.lat, toPt.lng, toPt.city, false);
        }
    } else {
        const hubLngForMarker = (arc2 ? arc1[arc1.length-1][1] : (fromCode==='NRT' ? HUB.lng : arc1[arc1.length-1][1]));
        if (fromCode !== 'NRT') addMarker(fromPt.lat, fromPt.lng, fromPt.city, false);
        addMarker(HUB.lat, hubLngForMarker, 'Tokyo Hub', true);
        if (toCode !== 'NRT' && toPt && !toPt.isHub) addMarker(toPt.lat, toPt.lng, toPt.city, false);
    }

    // Plane marker
    const planeMkr = L.marker(arc1[0], {
        icon: L.divIcon({
            className:'',
            html:`<div class="anim-plane-wrap">${planeSVG()}</div>`,
            iconSize:[38,38], iconAnchor:[19,19],
        }),
        zIndexOffset:2000,
    }).addTo(animMap);

    // Empty route lines
    const line1 = L.polyline([], { color:'#C9A84C', weight:2.5, opacity:0.9, dashArray:'9 5' }).addTo(animMap);
    const line2 = arc2 ? L.polyline([], { color:'#60A5FA', weight:2.5, opacity:0.9, dashArray:'9 5' }).addTo(animMap) : null;

    // Animation state machine
    // draw1 → fly1 → pause → draw2 → fly2 → rest → loop
    const D = { draw1:1600, fly1:5800, pause:1800, draw2:1300, fly2:5800, rest:2600 };
    let state = 'draw1', t0 = performance.now();

    function setPlane(pts, t, ease) {
        const te = ease ? easeInOut(t) : t;
        const pos  = interpArc(pts, te);
        const next = interpArc(pts, Math.min(te+0.006, 1));
        planeMkr.setLatLng(pos);
        const angle = pathBearing(pos, next) - 90;
        const wrap = planeMkr.getElement()?.querySelector('.anim-plane-wrap');
        if (wrap) wrap.style.transform = `rotate(${angle}deg)`;
    }

    function tick(now) {
        const elapsed = now - t0;
        const t = Math.min(elapsed / D[state], 1);

        if (state === 'draw1') {
            const n = Math.max(2, Math.floor(easeInOut(t) * arc1.length));
            line1.setLatLngs(arc1.slice(0, n));
            setPlane(arc1, 0, false);
            if (t >= 1) { state = 'fly1'; t0 = now; }

        } else if (state === 'fly1') {
            setPlane(arc1, t, true);
            if (t >= 1) {
                setPlane(arc1, 1, false);
                line1.setLatLngs(arc1);
                state = 'pause'; t0 = now;
            }

        } else if (state === 'pause') {
            if (t >= 1) { state = arc2 ? 'draw2' : 'rest'; t0 = now; }

        } else if (state === 'draw2') {
            if (arc2) {
                const n = Math.max(2, Math.floor(easeInOut(t) * arc2.length));
                line2.setLatLngs(arc2.slice(0, n));
                setPlane(arc2, 0, false);
            }
            if (t >= 1) { state = 'fly2'; t0 = now; }

        } else if (state === 'fly2') {
            if (arc2) setPlane(arc2, t, true);
            if (t >= 1) { state = 'rest'; t0 = now; }

        } else if (state === 'rest') {
            if (t >= 1) {
                state = 'draw1'; t0 = now;
                line1.setLatLngs([]);
                if (line2) line2.setLatLngs([]);
                planeMkr.setLatLng(arc1[0]);
            }
        }

        animFrameId = requestAnimationFrame(tick);
    }

    animFrameId = requestAnimationFrame(tick);
}
