// Airline name → logo image path (only for airlines that operate own flights to NRT)
const AIRLINE_LOGOS = {
  'ANA':                  'assets/ana-tail.png',
  'Air Canada':           'assets/air-canada.png',
  'EVA Air':              'assets/eva-air.png',
  'ITA Airways':          'assets/ita-airways.png',
  'United':               'assets/united.png',
  'United Airlines':      'assets/united.png',
  'Air China':            'assets/air-china.png',
  'Asiana':               'assets/asiana.png',
  'Swiss':                'assets/swiss.png',
  'Turkish Airlines':     'assets/turkish.png',
  'Austrian Airlines':    'assets/austrian.png',
  'Austrian':             'assets/austrian.png',
  'Air New Zealand':      'assets/air-new-zealand.png',
  'LOT Polish':           'assets/lot-polish.png',
  'LOT Polish Airlines':  'assets/lot-polish.png',
  'Air India':            'assets/air-india.png',
  'Thai Airways':         'assets/thai-airways.webp',
  'Singapore Airlines':   'assets/singapore-airlines.webp',
  'Lufthansa':            'assets/lufthansa.png',
};

function airlineShort(name) {
  const shorts = {
    'ANA':'ANA','JAL':'JL','United':'UA','United Airlines':'UA','Air Canada':'AC',
    'Avianca':'AV','Aeromexico':'AM','Copa Airlines':'CM',
    'Air China':'CA','Asiana':'OZ','Singapore Airlines':'SQ',
    'EVA Air':'BR','Thai Airways':'TG','Air India':'AI',
    'Lufthansa':'LH','Turkish Airlines':'TK','Brussels Airlines':'SN',
    'LOT Polish':'LO','LOT Polish Airlines':'LO',
    'Swiss':'LX','Swiss/TAP':'LX','ITA Airways':'AZ',
    'Austrian':'OS','Austrian Airlines':'OS',
    'EgyptAir':'MS','Ethiopian':'ET','South African':'SA',
    'Air New Zealand':'NZ',
  };
  return shorts[name] || name.substring(0, 3).toUpperCase();
}

function makeLogoBox(name, small = false) {
  const img = AIRLINE_LOGOS[name];
  const cls = small ? 'airline-logo-box-sm' : 'airline-logo-box';
  if (img) {
    return `<div class="${cls}" style="background:transparent;padding:2px;">` +
           `<img src="${img}" alt="${name}" style="width:100%;height:100%;object-fit:contain;border-radius:6px;"></div>`;
  }
  return `<div class="${cls}">${airlineShort(name)}</div>`;
}

function airlineLogoHtml(operator) {
  const parts = operator.split('/').map(s => s.trim());
  if (parts.length > 1) {
    return `<div class="airline-logos-dual">${makeLogoBox(parts[0], true)}${makeLogoBox(parts[1], true)}</div>`;
  }
  return makeLogoBox(parts[0], false);
}

const params     = new URLSearchParams(window.location.search);
const fromCode   = params.get('from')  || '';
const toCode     = params.get('to')    || '';
const travelDate = params.get('date')  || '';
const cabin      = params.get('cabin') || 'Economy';
const paxCount   = parseInt(params.get('pax')) || 1;
const mcParam    = params.get('mc');
let mcLegs = null;
try { if (mcParam) mcLegs = JSON.parse(mcParam); } catch(e) {}
let currentLang  = 'en';

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-en]').forEach(el => {
        el.innerHTML = lang === 'jp' ? el.dataset.jp : el.dataset.en;
    });
    document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');
    document.getElementById('lang-jp')?.classList.toggle('active', lang === 'jp');
}
document.getElementById('langToggle')?.addEventListener('click', () =>
    setLang(currentLang === 'en' ? 'jp' : 'en'));

window.addEventListener('scroll', () =>
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 10));

// ── Route header ──────────────────────────────────────────────────────────────
const fromAp = AIRPORTS[fromCode] || { city: fromCode, name: fromCode };
const toAp   = AIRPORTS[toCode]   || { city: toCode,   name: toCode   };

const routeHeader = document.getElementById('routeHeader');
if (routeHeader) {
    // Multi-city banner
    const mcBanner = mcLegs && mcLegs.length > 1 ? `
    <div class="mc-results-banner">
      <span class="mc-results-label">✈ MULTI-CITY JOURNEY</span>
      <div class="mc-results-legs">
        ${mcLegs.map((l,i) => {
          const fa = AIRPORTS[l.from], ta = AIRPORTS[l.to];
          return `<div class="mc-results-leg">
            <span class="mc-results-num">${i+1}</span>
            <span>${fa?.city||l.from} (${l.from}) → ${ta?.city||l.to} (${l.to})</span>
            ${l.date ? `<span class="mc-results-date">${l.date}</span>` : ''}
          </div>`;
        }).join('')}
      </div>
      <span class="mc-results-note">Showing results for Leg 1 · Select each flight to continue your journey</span>
    </div>` : '';

    routeHeader.innerHTML = mcBanner + `
    <div class="route-display">
      <div class="route-point">
        <span class="route-code">${fromCode}</span>
        <span class="route-city-name">${fromAp.city}</span>
      </div>
      <div class="route-connector">
        <div class="route-line"></div>
        ${(() => {
          const isKixDirect = (fromCode === 'KIX' && (KIX_SCHEDULE[toCode] || KIX_PARTNER_OPS[toCode]))
                           || (toCode   === 'KIX' && (KIX_SCHEDULE[fromCode] || KIX_PARTNER_OPS[fromCode]))
                           || fromCode === 'KIX' && toCode === 'NRT'
                           || fromCode === 'NRT' && toCode === 'KIX';
          return isKixDirect
            ? `<div class="route-hub-badge"><span>direct</span><strong>Osaka Hub</strong><span>KIX</span></div>`
            : `<div class="route-hub-badge"><span>via</span><strong>Tokyo Hub</strong><span>NRT</span></div>`;
        })()}
        <div class="route-line"></div>
      </div>
      <div class="route-point">
        <span class="route-code">${toCode}</span>
        <span class="route-city-name">${toAp.city}</span>
      </div>
    </div>
    <div class="route-meta">
      <span>${travelDate || 'Select date'}</span>
      <span class="dot">·</span>
      <span>${cabin}</span>
      ${(() => {
        const _ks = typeof KIX_SCHEDULE !== 'undefined' ? KIX_SCHEDULE : {};
        const days = (typeof SCHEDULE !== 'undefined') ? (SCHEDULE[toCode]?.days || SCHEDULE[fromCode]?.days || _ks[toCode]?.days || _ks[fromCode]?.days) : null;
        if (!days) return '';
        const DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        return `<span class="ops-days-badge">Operates: ${days.map(d=>DN[d]).join(' · ')}</span>`;
      })()}
      <a href="index.html" class="modify-link" data-en="Modify search" data-jp="検索を変更">Modify search</a>
    </div>`;
}

// ── Day-of-week operating check ───────────────────────────────────────────────
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getRouteDays(code) {
  const kxDays = typeof KIX_SCHEDULE !== 'undefined' ? KIX_SCHEDULE[code]?.days : null;
  return SCHEDULE[code]?.days || kxDays || null;
}

function routeOperatesOn(dateStr, fromC, toC) {
  if (!dateStr) return { operates: true };
  // Check both ends — the restrictive leg determines if route operates
  const days = getRouteDays(toC) || getRouteDays(fromC);
  if (!days) return { operates: true };
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay();
  if (days.includes(dow)) return { operates: true };
  // Find next 3 available dates
  const next = [];
  const probe = new Date(d);
  for (let i = 1; next.length < 3; i++) {
    probe.setDate(probe.getDate() + 1);
    if (days.includes(probe.getDay())) next.push(probe.toISOString().split('T')[0]);
  }
  const prev = [];
  const probe2 = new Date(d);
  for (let i = 1; prev.length < 2; i++) {
    probe2.setDate(probe2.getDate() - 1);
    if (days.includes(probe2.getDay())) prev.push(probe2.toISOString().split('T')[0]);
  }
  return { operates: false, days, dow, next, prev: prev.reverse() };
}

const dayCheck = routeOperatesOn(travelDate, fromCode, toCode);

// ── Flight data ───────────────────────────────────────────────────────────────
const flights = dayCheck.operates ? buildFlights(fromCode, toCode) : null;

const cabinKey = {
    'Economy':'e','Premium Economy':'pe',
    'Business':'bc','First Class':'fc'
};
const selectedKey = cabinKey[cabin] || 'e';

function priceHtml(yen) {
    if (!yen) return '<span class="no-avail">N/A</span>';
    return `<span class="price-yen" data-yen="${yen}">${formatCurrency(yen)}</span>`;
}

// Expanded flight-details rendering now lives in js/itinerary-view.js
// (shared with booking.js) — see renderItinerarySegments(f).

function renderFlights() {
    const container = document.getElementById('flightList');
    if (!container) return;

    if (!flights || flights.length === 0) {
        const fromCity = fromAp.city || fromCode;
        const toCity   = toAp.city   || toCode;

        // Day-of-week restriction message
        if (!dayCheck.operates && dayCheck.days) {
          const opDays = dayCheck.days.map(d => DAY_NAMES[d]).join(' · ');
          const nextLinks = dayCheck.next.map(d =>
            `<a href="results.html?from=${fromCode}&to=${toCode}&date=${d}&cabin=${cabin}"
               style="display:inline-block;margin:4px;padding:8px 16px;background:#0B3D91;color:#fff;border-radius:4px;text-decoration:none;font-size:13px;font-weight:700;">
              ${new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
            </a>`
          ).join('');
          container.innerHTML = `
          <div style="padding:40px 24px;text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">📅</div>
            <h3 style="color:#1A1A2E;margin-bottom:8px;">No flights on ${new Date(travelDate+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</h3>
            <p style="color:#6B7280;margin-bottom:8px;">
              <strong>${fromCity} → ${toCity}</strong> operates on:<br>
              <strong style="color:#0B3D91;">${opDays}</strong>
            </p>
            <p style="color:#6B7280;font-size:13px;margin-bottom:16px;">Next available flights:</p>
            <div>${nextLinks}</div>
            <a href="index.html" style="display:inline-block;margin-top:20px;padding:10px 24px;border:1px solid #E5E7EB;color:#6B7280;border-radius:4px;text-decoration:none;font-size:13px;">New Search</a>
          </div>`;
          return;
        }

        // Both endpoints are codeshare-only cities (reachable from ANA's hub
        // network individually, but not to each other) — explain why, rather
        // than showing the generic message as if it were a data gap.
        const bothCodeshareOnly = typeof VIA_CONNECTIONS !== 'undefined'
            && VIA_CONNECTIONS[fromCode] && VIA_CONNECTIONS[toCode]
            && !SCHEDULE[fromCode] && !SCHEDULE[toCode];

        container.innerHTML = bothCodeshareOnly ? `
        <div style="padding:40px 24px;text-align:center;color:#6B7280;">
          <div style="font-size:48px;margin-bottom:16px;">🌐</div>
          <h3 style="color:#1A1A2E;margin-bottom:8px;">Not bookable via ANA</h3>
          <p><strong>${fromCity}</strong> and <strong>${toCity}</strong> are both reachable through ANA's partner network individually, but not to each other — connecting them would mean routing through Tokyo, which isn't a realistic itinerary for this city pair.</p>
          <p style="margin-top:8px;font-size:13px;">Try searching each one against Tokyo (NRT) or another ANA destination instead.</p>
          <a href="index.html" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#0B3D91;color:#fff;border-radius:8px;text-decoration:none;">New Search</a>
        </div>` : `
        <div style="padding:40px 24px;text-align:center;color:#6B7280;">
          <div style="font-size:48px;margin-bottom:16px;">✈</div>
          <h3 style="color:#1A1A2E;margin-bottom:8px;">No service found</h3>
          <p>ANA does not currently offer service between <strong>${fromCity}</strong> and <strong>${toCity}</strong> via the Tokyo Hub.</p>
          <a href="index.html" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#0B3D91;color:#fff;border-radius:8px;text-decoration:none;">New Search</a>
        </div>`;
        return;
    }

    container.innerHTML = flights.map((f, i) => {
        const tagLabel = f.tag === 'recommended' ? '⭐ Recommended' :
                         f.tag === 'best value'   ? '💰 Best Value' :
                         f.tag === 'kix'          ? '✦ Via Osaka Hub' :
                         f.tag === 'partner'      ? `✈ ${f._partner || 'Star Alliance Partner'}` : '';
        const price = f.prices[selectedKey];
        // Derive stop count/labels straight from the real layovers list —
        // works for 0, 1 or 2 stops without special-casing each combination.
        const stops = f.layovers || [];
        const hubName = code => code === 'NRT' ? 'Tokyo Hub' : code === 'KIX' ? 'Osaka Hub' : (AIRPORTS[code]?.city || code);
        const stopsLabel = f.direct ? 'Nonstop' :
          `${stops.length} stop${stops.length > 1 ? 's' : ''} · via ${stops.map(s => hubName(s.code)).join(' & ')}`;
        const plusMark = f.note && !f.note.startsWith('Overnight')
            ? ` <span class="plus-day">${f.note}</span>` : '';

        return `
    <div class="flight-card ${f.tag === 'partner' ? 'flight-card-partner' : f.tag ? 'flight-card-featured' : ''}" data-index="${i}">
      ${f.tag ? `<div class="flight-tag">${tagLabel}</div>` : ''}
      <div class="flight-main">
        <div class="flight-airline">
          ${airlineLogoHtml(f.operator)}
          <span class="flight-nums">${f.flightOut}<br>${f.direct ? '' : f.flightIn}</span>
        </div>
        <div class="flight-times">
          <div class="flight-time-point">
            <span class="time-big">${f.depLocal}</span>
            <span class="time-code">${fromCode}</span>
          </div>
          <div class="flight-duration">
            <span class="duration-time">${f.totalTime}</span>
            <div class="duration-bar">
              <div class="duration-dot"></div>
              <div class="duration-line"></div>
              ${stops.map(s => `<div class="duration-hub"><span>${s.code}</span><span class="transit-time">${s.wait}</span></div><div class="duration-line"></div>`).join('')}
              <div class="duration-dot"></div>
            </div>
            <span class="stops-label">${stopsLabel}</span>
          </div>
          <div class="flight-time-point">
            <span class="time-big">${f.arrDest}</span>
            <span class="time-code">${toCode}${plusMark}</span>
          </div>
        </div>
        <div class="flight-price-col">
          <div class="price-from">from</div>
          <div class="price-main">${priceHtml(price)}</div>
          <div class="price-cabin">${cabin}</div>
          <button class="select-btn">Select</button>
        </div>
      </div>
      <div class="flight-details">
        <span class="flight-aircraft-hint">${f.aircraft1}${f.direct ? '' : ' · ' + f.aircraft2}</span>
        <button class="details-toggle" data-index="${i}">Flight details ▾</button>
      </div>
      ${renderItinerarySegments(f)}
    </div>`;
    }).join('');

    container.querySelectorAll('.details-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.flight-card');
            const open = card.classList.toggle('expanded');
            btn.textContent = open ? 'Hide details ▴' : 'Flight details ▾';
        });
    });

    container.querySelectorAll('.select-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => {
            const f = flights[i];
            const p = new URLSearchParams({
                from: fromCode,
                to:   toCode,
                date: travelDate || '',
                cabin,
                pax:  paxCount,
                fi:   i,
                outFlight: f.flightOut + (f.direct ? '' : '+' + f.flightIn),
                outDep:  f.depLocal,
                outArr:  f.arrDest,
                outDur:  f.totalTime,
                outOp:   f.operator,
            });
            // Pass multi-city legs so booking.html uses leg 2 as the next flight
            if (mcParam) p.set('mc', mcParam);
            window.location.href = 'booking.html?' + p.toString();
        });
    });
}

renderFlights();
buildCurrencySelector('currencyMount');
window.addEventListener('load', () => initAnimatedMap(fromCode, toCode));
