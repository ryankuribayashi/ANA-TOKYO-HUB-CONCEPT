// ── URL params ────────────────────────────────────────────────────────────────
const params    = new URLSearchParams(window.location.search);
const fromCode  = params.get('from')      || '';
const toCode    = params.get('to')        || '';
const travelDate= params.get('date')      || '';
const cabin     = params.get('cabin')     || 'Economy';
const outFlight = params.get('outFlight') || '';
const outDep    = params.get('outDep')    || '';
const outArr    = params.get('outArr')    || '';
const outDur    = params.get('outDur')    || '';
const outOp     = params.get('outOp')     || 'ANA';
const paxCount  = parseInt(params.get('pax')) || 1;
const carrierFilter = params.get('carrier') || null;

// Multi-city: use leg 2's from/to if present, otherwise reverse leg 1
let mcAllLegs = null;
try { const mc = params.get('mc'); if (mc) mcAllLegs = JSON.parse(mc); } catch(e) {}
const isMultiCity = mcAllLegs && mcAllLegs.length > 1;
const retFrom = (isMultiCity && mcAllLegs[1]?.from) ? mcAllLegs[1].from : toCode;
const retTo   = (isMultiCity && mcAllLegs[1]?.to)   ? mcAllLegs[1].to   : fromCode;

// ── Airline short/logo helpers (duplicated from results.js for this page) ─────
const AIRLINE_LOGOS_BK = {
  'ANA':'assets/ana-tail.png','Air Canada':'assets/air-canada.png',
  'EVA Air':'assets/eva-air.png','ITA Airways':'assets/ita-airways.png',
  'United':'assets/united.png','United Airlines':'assets/united.png',
  'Air China':'assets/air-china.png','Asiana':'assets/asiana.png',
  'Swiss':'assets/swiss.png','Turkish Airlines':'assets/turkish.png',
  'Austrian Airlines':'assets/austrian.png','Austrian':'assets/austrian.png',
  'Air New Zealand':'assets/air-new-zealand.png',
  'LOT Polish':'assets/lot-polish.png','LOT Polish Airlines':'assets/lot-polish.png',
  'Air India':'assets/air-india.png','Thai Airways':'assets/thai-airways.webp',
  'Singapore Airlines':'assets/singapore-airlines.webp','Lufthansa':'assets/lufthansa.png',
};
const AIRLINE_SHORT_BK = {
  'ANA':'ANA','JAL':'JL','United':'UA','United Airlines':'UA','Air Canada':'AC',
  'Avianca':'AV','Aeromexico':'AM','Copa Airlines':'CM','Air China':'CA',
  'Asiana':'OZ','Singapore Airlines':'SQ','EVA Air':'BR','Thai Airways':'TG',
  'Air India':'AI','Lufthansa':'LH','Turkish Airlines':'TK','Brussels Airlines':'SN',
  'LOT Polish':'LO','LOT Polish Airlines':'LO','Swiss':'LX','Swiss/TAP':'LX',
  'ITA Airways':'AZ','Austrian':'OS','Austrian Airlines':'OS',
  'EgyptAir':'MS','Ethiopian':'ET','South African':'SA','Air New Zealand':'NZ',
};
function airlineShortBk(name) {
  return AIRLINE_SHORT_BK[name] || name.substring(0,3).toUpperCase();
}
function makeLogoBoxBk(name, small=false) {
  const img = AIRLINE_LOGOS_BK[name];
  const cls = small ? 'airline-logo-box-sm' : 'airline-logo-box';
  if (img) return `<div class="${cls}" style="background:transparent;padding:2px;"><img src="${img}" alt="${name}" style="width:100%;height:100%;object-fit:contain;border-radius:6px;"></div>`;
  return `<div class="${cls}">${airlineShortBk(name)}</div>`;
}
function airlineLogoHtmlBk(operator) {
  const parts = operator.split('/').map(s => s.trim());
  if (parts.length > 1)
    return `<div class="airline-logos-dual">${makeLogoBoxBk(parts[0],true)}${makeLogoBoxBk(parts[1],true)}</div>`;
  return makeLogoBoxBk(parts[0], false);
}

// ── Populate outbound banner ───────────────────────────────────────────────────
const fromAp = AIRPORTS[fromCode] || { city: fromCode };
const toAp   = AIRPORTS[toCode]   || { city: toCode   };
document.getElementById('obFrom').textContent    = fromCode;
document.getElementById('obTo').textContent      = toCode;
document.getElementById('obFlights').textContent = outFlight.replace('+', ' + ');
document.getElementById('obDep').textContent     = outDep ? outDep + ' local' : '—';
document.getElementById('obArr').textContent     = outArr ? outArr + ' local' : '—';
document.getElementById('obDur').textContent     = outDur || '—';
document.getElementById('obCabin').textContent   = cabin;

// ── Populate return route header ───────────────────────────────────────────────
const retFromAp = AIRPORTS[retFrom] || { city: retFrom };
const retToAp   = AIRPORTS[retTo]   || { city: retTo   };
document.getElementById('retFrom').textContent     = retFrom;
document.getElementById('retFromCity').textContent = retFromAp.city || retFrom;
document.getElementById('retTo').textContent       = retTo;
document.getElementById('retToCity').textContent   = retToAp.city || retTo;
// Update step labels for multi-city
if (isMultiCity) {
  const rtl = document.querySelector('.return-title');
  if (rtl) rtl.textContent = `Step 2 — Select Leg 2 Flight`;
  const stl = document.querySelectorAll('.bstep')[1];
  if (stl) stl.querySelector('span:last-child').textContent = 'Leg 2 Flight';
}

// ── Build return flights ───────────────────────────────────────────────────────
let returnFlights = buildFlights(retFrom, retTo);
if (returnFlights && carrierFilter) {
  const scoped = returnFlights.filter(f => f.operator === carrierFilter);
  if (scoped.length > 0) returnFlights = scoped; // fall back to all carriers if JAL doesn't fly the return leg
}

const cabinKey = { 'Economy':'e','Premium Economy':'pe','Business':'bc','First Class':'fc' };
const selectedKey = cabinKey[cabin] || 'e';

// Expanded flight-details rendering now lives in js/itinerary-view.js
// (shared with results.js) — see renderItinerarySegments(f).

function priceHtmlBk(yen) {
  if (!yen) return '<span class="no-avail">N/A</span>';
  return `<span class="price-yen" data-yen="${yen}">${formatCurrency(yen)}</span>`;
}

// ── Render return flight list ─────────────────────────────────────────────────
function renderReturnFlights() {
  const container = document.getElementById('flightList');
  if (!container) return;

  if (!returnFlights || returnFlights.length === 0) {
    container.innerHTML = `
    <div style="padding:40px 24px;text-align:center;color:#6B7280;">
      <div style="font-size:48px;margin-bottom:16px;">✈</div>
      <h3 style="color:#1A1A2E;margin-bottom:8px;">No return service found</h3>
      <p>No flights available for the return journey.</p>
      <a href="index.html" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#0B3D91;color:#fff;border-radius:8px;text-decoration:none;">New Search</a>
    </div>`;
    return;
  }

  container.innerHTML = returnFlights.map((f, i) => {
    const tagLabel = f.tag === 'recommended' ? '⭐ Recommended' :
                     f.tag === 'best value'   ? '💰 Best Value' :
                     f.tag === 'partner'      ? `✈ ${f._partner || 'Star Alliance Partner'}` : '';
    const price      = f.prices[selectedKey];
    const stops = f.layovers || [];
    const hubName = code => code === 'NRT' ? 'Tokyo Hub' : code === 'KIX' ? 'Osaka Hub' : (AIRPORTS[code]?.city || code);
    const stopsLabel = f.direct ? 'Nonstop' :
      `${stops.length} stop${stops.length > 1 ? 's' : ''} · via ${stops.map(s => hubName(s.code)).join(' & ')}`;
    const plusMark   = f.note && !f.note.startsWith('Overnight')
                       ? ` <span class="plus-day">${f.note}</span>` : '';

    return `
<div class="flight-card ${f.tag === 'partner' ? 'flight-card-partner' : f.tag ? 'flight-card-featured' : ''}" data-index="${i}">
  ${f.tag ? `<div class="flight-tag">${tagLabel}</div>` : ''}
  <div class="flight-main">
    <div class="flight-airline">
      ${airlineLogoHtmlBk(f.operator)}
      <span class="flight-nums">${f.flightOut}<br>${f.direct ? '' : f.flightIn}</span>
    </div>
    <div class="flight-times">
      <div class="flight-time-point">
        <span class="time-big">${f.depLocal}</span>
        <span class="time-code">${retFrom}</span>
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
        <span class="time-code">${retTo}${plusMark}</span>
      </div>
    </div>
    <div class="flight-price-col">
      <div class="price-from">from</div>
      <div class="price-main">${priceHtmlBk(price)}</div>
      <div class="price-cabin">${cabin}</div>
      <button class="select-btn ret-select-btn" data-index="${i}">Select Return</button>
    </div>
  </div>
  <div class="flight-details">
    <span class="flight-aircraft-hint">${f.aircraft1}${f.direct ? '' : ' · ' + f.aircraft2}</span>
    <button class="details-toggle" data-index="${i}">Flight details ▾</button>
  </div>
  ${renderItinerarySegments(f)}
</div>`;
  }).join('');

  // Details toggle
  container.querySelectorAll('.details-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.flight-card');
      const open = card.classList.toggle('expanded');
      btn.textContent = open ? 'Hide details ▴' : 'Flight details ▾';
    });
  });

  // Select return → go to checkout with both legs identified by index
  container.querySelectorAll('.ret-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const retFlight = returnFlights[idx];
      const p = new URLSearchParams({
        from: fromCode, to: toCode, date: travelDate, cabin, pax: paxCount,
        fi: params.get('fi') || '0',
        outFlight, outDep, outArr, outDur, outOp,
        ri: idx,
        retFrom, retTo,
        retFlight: retFlight.flightOut + (retFlight.direct ? '' : '+' + retFlight.flightIn),
        retDep: retFlight.depLocal, retArr: retFlight.arrDest,
        retDur: retFlight.totalTime, retOp: retFlight.operator,
      });
      if (mcAllLegs) p.set('mc', JSON.stringify(mcAllLegs));
      if (carrierFilter) p.set('carrier', carrierFilter);
      window.location.href = 'checkout.html?' + p.toString();
    });
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
renderReturnFlights();
buildCurrencySelector('currencyMount');
window.addEventListener('load', () => initAnimatedMap(retFrom, retTo));
window.addEventListener('scroll', () =>
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 10));
