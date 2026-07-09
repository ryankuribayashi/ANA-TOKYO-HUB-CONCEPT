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
  'ANA':'ANA','United':'UA','United Airlines':'UA','Air Canada':'AC',
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
const returnFlights = buildFlights(retFrom, retTo);

const cabinKey = { 'Economy':'e','Premium Economy':'pe','Business':'bc','First Class':'fc' };
const selectedKey = cabinKey[cabin] || 'e';

// ── Codeshare row helper ──────────────────────────────────────────────────────
function csRowBk(schedCode) {
  if (!schedCode) return '';
  const s = typeof SCHEDULE !== 'undefined' ? SCHEDULE[schedCode] : null;
  if (!s?.partner) return '';
  return `<div class="exp-row exp-row-cs"><span class="exp-label">Codeshare</span>` +
         `<span class="exp-val"><span class="cs-badge">${s.partnerNo}</span> also marketed by ${s.partner}</span></div>`;
}

// ── Expanded flight details (return legs) ─────────────────────────────────────
function expandedHtmlRet(f) {
  let cs1 = '', cs2 = '';
  if (f.direct) {
    const cityCode = (retFrom === 'NRT') ? retTo : retFrom;
    if (f.operator === 'ANA') cs1 = csRowBk(cityCode);
  } else if (f._viaCode) {
    if (f.flightOut.startsWith('NH')) cs1 = csRowBk(f._viaCode);
  } else {
    if (f.flightOut.startsWith('NH')) cs1 = csRowBk(retFrom);
    if (f.flightIn.startsWith('NH') && !(typeof VIA_CONNECTIONS !== 'undefined' && VIA_CONNECTIONS[retTo]))
      cs2 = csRowBk(retTo);
  }

  if (f.direct) {
    return `
  <div class="flight-expanded-content">
    <div class="exp-segments">
      <div class="exp-segment">
        <div class="exp-seg-header">
          <span class="exp-seg-badge">Direct Flight</span>
          <span class="exp-seg-route">${retFrom} → ${retTo}</span>
          <span class="exp-seg-time">${f.totalTime}</span>
        </div>
        <div class="exp-seg-body">
          <div class="exp-row"><span class="exp-label">Flight</span><span class="exp-val">${f.flightOut}</span></div>
          ${cs1}
          <div class="exp-row"><span class="exp-label">Aircraft</span><span class="exp-val">${f.aircraft1}</span></div>
          <div class="exp-row"><span class="exp-label">Departs</span><span class="exp-val">${f.depLocal} local · ${f.termOut}</span></div>
          <div class="exp-row"><span class="exp-label">Arrives</span><span class="exp-val">${f.arrDest} local${f.note?' ('+f.note+')':''} · ${f.termDest}</span></div>
          <div class="exp-row"><span class="exp-label">Cabins</span><span class="exp-val">${f.cabinOut}</span></div>
        </div>
      </div>
    </div>
  </div>`;
  }

  return `
  <div class="flight-expanded-content">
    <div class="exp-segments">
      <div class="exp-segment">
        <div class="exp-seg-header">
          <span class="exp-seg-badge">Segment 1</span>
          <span class="exp-seg-route">${f._seg1Label || (retFrom + ' → NRT')}</span>
          <span class="exp-seg-time">${f.seg1Time}</span>
        </div>
        <div class="exp-seg-body">
          <div class="exp-row"><span class="exp-label">Flight</span><span class="exp-val">${f.flightOut}</span></div>
          ${cs1}
          <div class="exp-row"><span class="exp-label">Aircraft</span><span class="exp-val">${f.aircraft1}</span></div>
          <div class="exp-row"><span class="exp-label">Departs</span><span class="exp-val">${f.depLocal} local · ${f.termOut}</span></div>
          <div class="exp-row"><span class="exp-label">Arrives</span><span class="exp-val">${f.arrHub} JST · ${f.termHub1}</span></div>
          <div class="exp-row"><span class="exp-label">Cabins</span><span class="exp-val">${f.cabinOut}</span></div>
        </div>
      </div>
      <div class="exp-transit">
        <div class="exp-transit-icon">✈ ${f._hubLabel || 'TOKYO HUB'}</div>
        <div class="exp-transit-detail">
          <div class="exp-row">
            <span class="exp-label">Transit</span>
            <span class="exp-val exp-val-gold">${f.transitTime}${f.note?' · <em>'+f.note+'</em>':''}</span>
          </div>
          <div class="exp-row"><span class="exp-label">Connection</span><span class="exp-val">${f.transfer}</span></div>
          <div class="exp-row"><span class="exp-label">Note</span><span class="exp-val">${f.mct}</span></div>
        </div>
      </div>
      <div class="exp-segment">
        <div class="exp-seg-header">
          <span class="exp-seg-badge">Segment 2</span>
          <span class="exp-seg-route">${f._seg2Label || ('NRT → ' + retTo)}</span>
          <span class="exp-seg-time">${f.seg2Time}</span>
        </div>
        <div class="exp-seg-body">
          <div class="exp-row"><span class="exp-label">Flight</span><span class="exp-val">${f.flightIn}</span></div>
          ${cs2}
          <div class="exp-row"><span class="exp-label">Aircraft</span><span class="exp-val">${f.aircraft2}</span></div>
          <div class="exp-row"><span class="exp-label">Departs</span><span class="exp-val">${f.hubDep} JST · ${f.termHub2}</span></div>
          <div class="exp-row"><span class="exp-label">Arrives</span><span class="exp-val">${f.arrDest} local · ${f.termDest}</span></div>
          <div class="exp-row"><span class="exp-label">Cabins</span><span class="exp-val">${f.cabinIn}</span></div>
        </div>
      </div>
      ${f._seg3Label ? `
      <div class="exp-transit">
        <div class="exp-transit-icon">✈ ${f._seg3Label.split(' → ')[0].toUpperCase()}</div>
        <div class="exp-transit-detail">
          <div class="exp-row"><span class="exp-label">Connection</span><span class="exp-val exp-val-gold">${f._seg3Note}</span></div>
        </div>
      </div>
      <div class="exp-segment">
        <div class="exp-seg-header">
          <span class="exp-seg-badge">Segment 3</span>
          <span class="exp-seg-route">${f._seg3Label}</span>
          <span class="exp-seg-time">${f._seg3Duration}</span>
        </div>
        <div class="exp-seg-body">
          <div class="exp-row"><span class="exp-label">Flight</span><span class="exp-val">${f._seg3Flight}</span></div>
          <div class="exp-row"><span class="exp-label">Operator</span><span class="exp-val">${f._seg3Operator}</span></div>
          <div class="exp-row"><span class="exp-label">Aircraft</span><span class="exp-val">${f._seg3Aircraft}</span></div>
          <div class="exp-row"><span class="exp-label">Arrives</span><span class="exp-val">${f._seg3Term}</span></div>
        </div>
      </div>` : ''}
    </div>
  </div>`;
}

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
    const stopsLabel = f.direct ? 'Nonstop' : '1 stop · via Tokyo Hub';
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
          ${f.direct ? '' : `<div class="duration-hub"><span>NRT</span><span class="transit-time">${f.transitTime}</span></div><div class="duration-line"></div>`}
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
  ${expandedHtmlRet(f)}
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

  // Select return → open confirm modal
  container.querySelectorAll('.ret-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      openConfirmModal(returnFlights[idx]);
    });
  });
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function openConfirmModal(retFlight) {
  const outPrice = (() => {
    // Re-build outbound to get price — use index from URL
    const fi = parseInt(params.get('fi') || '0');
    const ob = buildFlights(fromCode, toCode);
    return ob && ob[fi] ? ob[fi].prices[selectedKey] : null;
  })();
  const retPrice   = retFlight.prices[selectedKey];
  const totalPrice = (outPrice && retPrice) ? outPrice + retPrice : null;

  const body = document.getElementById('confirmBody');
  body.innerHTML = `
<div class="confirm-leg">
  <div class="confirm-leg-icon">↗</div>
  <div>
    <div class="confirm-leg-route">${fromCode} → ${toCode}</div>
    <div class="confirm-leg-detail">
      <strong>${outFlight.replace('+',' + ')}</strong> &nbsp;·&nbsp;
      ${outDep} → ${outArr} &nbsp;·&nbsp; ${outDur} &nbsp;·&nbsp; ${cabin}
    </div>
    <div class="confirm-leg-detail">Operated by <strong>${outOp}</strong></div>
  </div>
</div>
<div class="confirm-leg">
  <div class="confirm-leg-icon">↙</div>
  <div>
    <div class="confirm-leg-route">${retFrom} → ${retTo}</div>
    <div class="confirm-leg-detail">
      <strong>${retFlight.flightOut}${retFlight.direct ? '' : ' + ' + retFlight.flightIn}</strong> &nbsp;·&nbsp;
      ${retFlight.depLocal} → ${retFlight.arrDest} &nbsp;·&nbsp; ${retFlight.totalTime} &nbsp;·&nbsp; ${cabin}
    </div>
    <div class="confirm-leg-detail">Operated by <strong>${retFlight.operator}</strong></div>
  </div>
</div>
<div class="confirm-total">
  <div>
    <div class="confirm-total-label">Total per person (${cabin})</div>
    <div class="confirm-total-note">Taxes &amp; fees included · prices indicative</div>
  </div>
  <div class="confirm-total-price">${totalPrice ? formatCurrency(totalPrice) : 'Contact ANA'}</div>
</div>
<button class="confirm-book-btn" id="bookNowBtn">Book Now →</button>`;

  document.getElementById('bookNowBtn').addEventListener('click', () => {
    const ref = 'NH' + Math.random().toString(36).substring(2,8).toUpperCase();
    document.getElementById('bookingRef').textContent = ref;
    body.style.display = 'none';
    document.getElementById('bookedState').style.display = 'block';
  });

  document.getElementById('confirmOverlay').classList.add('open');
}

document.getElementById('confirmClose').addEventListener('click', () => {
  document.getElementById('confirmOverlay').classList.remove('open');
  document.getElementById('confirmBody').style.display = '';
  document.getElementById('bookedState').style.display = 'none';
});
document.getElementById('confirmOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('confirmOverlay')) {
    document.getElementById('confirmClose').click();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderReturnFlights();
buildCurrencySelector('currencyMount');
window.addEventListener('load', () => initAnimatedMap(retFrom, retTo));
window.addEventListener('scroll', () =>
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 10));
