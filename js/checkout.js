// ── URL params ──────────────────────────────────────────────────────────────
const params      = new URLSearchParams(window.location.search);
const fromCode     = params.get('from')     || '';
const toCode       = params.get('to')       || '';
const travelDate   = params.get('date')     || '';
const cabin        = params.get('cabin')    || 'Economy';
const paxCount     = Math.max(1, Math.min(6, parseInt(params.get('pax')) || 1));
const fi           = parseInt(params.get('fi') || '0');
const outFlightNum = params.get('outFlight')|| '';
const outDep       = params.get('outDep')   || '';
const outArr       = params.get('outArr')   || '';
const outDur       = params.get('outDur')   || '';
const outOp        = params.get('outOp')    || 'ANA';
const ri           = parseInt(params.get('ri') || '0');
const retFrom      = params.get('retFrom')  || toCode;
const retTo        = params.get('retTo')    || fromCode;
const retFlightNum = params.get('retFlight')|| '';
const retDep       = params.get('retDep')   || '';
const retArr       = params.get('retArr')   || '';
const retDur       = params.get('retDur')   || '';
const retOp        = params.get('retOp')    || 'ANA';

const CABIN_KEY_MAP = { 'Economy':'e', 'Premium Economy':'pe', 'Business':'bc', 'First Class':'fc' };
const cabinKey = CABIN_KEY_MAP[cabin] || 'e';

const outFlightsList = (typeof buildFlights === 'function' && buildFlights(fromCode, toCode)) || [];
const outFlightObj   = outFlightsList[fi] || outFlightsList[0] || null;
const retFlightsList = (typeof buildFlights === 'function' && buildFlights(retFrom, retTo)) || [];
const retFlightObj   = retFlightsList[ri] || retFlightsList[0] || null;

const outPrice = outFlightObj ? (outFlightObj.prices[cabinKey] || 0) : 0;
const retPrice = retFlightObj ? (retFlightObj.prices[cabinKey] || 0) : 0;
const havePrices   = !!(outFlightObj && retFlightObj);
const perPersonPrice = havePrices ? outPrice + retPrice : null;
const totalPrice     = havePrices ? perPersonPrice * paxCount : null;

function priceOrContact(v) { return v != null ? formatCurrency(v) : 'Contact ANA'; }

// ── Seat map layout by cabin ──────────────────────────────────────────────────
const SEAT_LAYOUTS = {
  'Economy':         { rowStart: 24, rowCount: 16, cols: [['A','B','C'],['D','E','F'],['G','H','J']], exitRows: [24] },
  'Premium Economy': { rowStart: 12, rowCount: 6,  cols: [['A','B'],['D','E','F','G'],['H','J']],      exitRows: [] },
  'Business':        { rowStart: 4,  rowCount: 8,  cols: [['A'],['D','F'],['K']],                      exitRows: [] },
  'First Class':     { rowStart: 1,  rowCount: 3,  cols: [['A'],['D'],['K']],                          exitRows: [] },
};
const layout = SEAT_LAYOUTS[cabin] || SEAT_LAYOUTS['Economy'];

function buildAllSeats(lo) {
  const seats = [];
  for (let r = 0; r < lo.rowCount; r++) {
    const rowNum = lo.rowStart + r;
    lo.cols.flat().forEach(col => seats.push(rowNum + col));
  }
  return seats;
}
// Deterministic shuffle seeded by a string, so "occupied" seats stay stable
// for a given flight number across re-renders within the session.
function seededShuffle(arr, seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (Math.imul(31, h) + seedStr.charCodeAt(i)) | 0;
  function rand() { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }
  return arr.map(v => ({ v, k: rand() })).sort((a, b) => a.k - b.k).map(x => x.v);
}
function buildUnavailable(lo, seedStr) {
  const all = buildAllSeats(lo);
  const shuffled = seededShuffle(all, seedStr);
  const n = Math.round(all.length * 0.3);
  return new Set(shuffled.slice(0, n));
}

const seatState = {
  outbound: { unavailable: buildUnavailable(layout, 'OUT-' + (outFlightNum || fromCode + toCode)), assigned: Array(paxCount).fill(null), active: 0 },
  return:   { unavailable: buildUnavailable(layout, 'RET-' + (retFlightNum || retFrom + retTo)),    assigned: Array(paxCount).fill(null), active: 0 },
};

// ── Step bar ────────────────────────────────────────────────────────────────
const STEPS = ['Outbound Flight', 'Return Flight', 'Seats', 'Passengers', 'Payment'];
let currentStep = 2; // 0-based index into STEPS; items before this render as done

function renderStepBar() {
  const bar = document.getElementById('stepBar');
  bar.innerHTML = STEPS.map((label, i) => {
    const cls = i < currentStep ? 'done' : i === currentStep ? 'active' : '';
    const num = i < currentStep ? '✓' : (i + 1);
    return `<div class="bstep ${cls}"><div class="bstep-num">${num}</div><span>${label}</span></div>`;
  }).join('');
}

function renderTripSummary() {
  const el = document.getElementById('tripSummary');
  el.innerHTML = `
    <div class="co-summary-legs">
      <div>
        <div class="co-leg-label">Outbound</div>
        <div class="co-leg-route">${fromCode} → ${toCode}</div>
        <div class="co-leg-meta">${outFlightNum.replace('+',' + ')} · ${outDep} → ${outArr} · ${outDur}</div>
      </div>
      <div>
        <div class="co-leg-label">Return</div>
        <div class="co-leg-route">${retFrom} → ${retTo}</div>
        <div class="co-leg-meta">${retFlightNum.replace('+',' + ')} · ${retDep} → ${retArr} · ${retDur}</div>
      </div>
    </div>
    <div class="co-summary-total">
      <div class="co-summary-total-lbl">${paxCount} Passenger${paxCount > 1 ? 's' : ''} · ${cabin}</div>
      <div class="co-summary-total-val">${priceOrContact(totalPrice)}</div>
    </div>
  `;
}

// ── Step 1: Seats ──────────────────────────────────────────────────────────
function renderSeatMapHtml(legKey, legLabel, routeLabel) {
  const state = seatState[legKey];
  const rows = [];
  for (let r = 0; r < layout.rowCount; r++) {
    const rowNum = layout.rowStart + r;
    const isExit = layout.exitRows.includes(rowNum);
    const groups = layout.cols.map(group => group.map(col => {
      const seatId = rowNum + col;
      const unavail = state.unavailable.has(seatId);
      const assignedIdx = state.assigned.findIndex(s => s === seatId);
      const taken = assignedIdx !== -1;
      const cls = ['seat-btn'];
      if (unavail) cls.push('seat-unavail');
      if (isExit && !unavail && !taken) cls.push('seat-exit');
      if (taken) cls.push('seat-taken');
      const label = taken ? String(assignedIdx + 1) : col;
      return `<button type="button" class="${cls.join(' ')}" data-leg="${legKey}" data-seat="${seatId}" ${unavail ? 'disabled' : ''} title="${seatId}">${label}</button>`;
    }).join(''));
    rows.push(`<div class="seat-row"><span class="seat-row-num">${rowNum}</span>${groups.map(g => `<div class="seat-group">${g}</div>`).join('<div class="seat-aisle"></div>')}</div>`);
  }

  const chips = Array.from({ length: paxCount }).map((_, i) => {
    const filled = !!state.assigned[i];
    const cls = ['seat-pax-chip'];
    if (state.active === i) cls.push('active');
    if (filled) cls.push('filled');
    return `<button type="button" class="${cls.join(' ')}" data-leg="${legKey}" data-pax="${i}">P${i + 1}${filled ? ' · ' + state.assigned[i] : ''}</button>`;
  }).join('');

  return `
  <div class="seat-map-wrap">
    <div class="seat-map-head">
      <div class="seat-leg-title">${legLabel} <span>${routeLabel} · ${cabin}</span></div>
      <div class="seat-pax-chips">${chips}</div>
    </div>
    <div class="seat-grid">${rows.join('')}</div>
    <div class="seat-legend">
      <div class="seat-legend-item"><div class="seat-legend-swatch"></div> Available</div>
      <div class="seat-legend-item"><div class="seat-legend-swatch taken"></div> Your selection</div>
      <div class="seat-legend-item"><div class="seat-legend-swatch unavail"></div> Occupied</div>
      ${layout.exitRows.length ? '<div class="seat-legend-item"><div class="seat-legend-swatch exit"></div> Extra legroom</div>' : ''}
    </div>
  </div>`;
}

function autoFillSeats(legKey) {
  const state = seatState[legKey];
  const all = buildAllSeats(layout);
  for (let i = 0; i < paxCount; i++) {
    if (state.assigned[i]) continue;
    const seat = all.find(s => !state.unavailable.has(s) && !state.assigned.includes(s));
    if (seat) state.assigned[i] = seat;
  }
}

function renderStepSeats() {
  currentStep = 2;
  renderStepBar();
  const body = document.getElementById('coBody');
  document.querySelector('.co-summary').style.display = '';
  body.innerHTML = `
    <div class="co-step-title">Choose Your Seats</div>
    <div class="co-step-sub">Pick a passenger chip, then tap a seat on each flight. You can leave some unassigned — we'll fill the rest automatically.</div>
    ${renderSeatMapHtml('outbound', 'Outbound', fromCode + ' → ' + toCode)}
    ${renderSeatMapHtml('return', 'Return', retFrom + ' → ' + retTo)}
    <div class="co-actions">
      <span></span>
      <button class="co-btn co-btn-primary" id="seatsContinue">Continue to Passenger Details →</button>
    </div>
  `;

  ['outbound', 'return'].forEach(legKey => {
    body.querySelectorAll(`.seat-pax-chip[data-leg="${legKey}"]`).forEach(chip => {
      chip.addEventListener('click', () => {
        seatState[legKey].active = parseInt(chip.dataset.pax);
        renderStepSeats();
      });
    });
    body.querySelectorAll(`.seat-btn[data-leg="${legKey}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const seatId = btn.dataset.seat;
        const state = seatState[legKey];
        const activeIdx = state.active;
        if (state.assigned[activeIdx] === seatId) {
          state.assigned[activeIdx] = null;
        } else {
          const holder = state.assigned.findIndex(s => s === seatId);
          if (holder !== -1) state.assigned[holder] = null;
          state.assigned[activeIdx] = seatId;
          const nextEmpty = state.assigned.findIndex(s => s === null);
          state.active = nextEmpty !== -1 ? nextEmpty : activeIdx;
        }
        renderStepSeats();
      });
    });
  });

  document.getElementById('seatsContinue').addEventListener('click', () => {
    autoFillSeats('outbound');
    autoFillSeats('return');
    renderStepPassengers();
  });
}

// ── Step 2: Passenger details ─────────────────────────────────────────────
const passengerData = Array.from({ length: paxCount }, () => ({ title: 'Mr', first: '', last: '', dob: '', nationality: '', passport: '' }));
const contactData = { email: '', phone: '' };

function renderStepPassengers() {
  currentStep = 3;
  renderStepBar();
  const body = document.getElementById('coBody');

  const paxForms = passengerData.map((p, i) => `
    <div class="pax-form-card">
      <div class="pax-form-title">🧑 Passenger ${i + 1}${i === 0 ? ' <span style="font-weight:600;color:#9CA3AF;font-size:11px;">(Primary Contact)</span>' : ''}</div>
      <div class="pax-form-grid">
        <div class="pax-field"><label>Title</label>
          <select data-pax="${i}" data-field="title">
            <option ${p.title === 'Mr' ? 'selected' : ''}>Mr</option>
            <option ${p.title === 'Ms' ? 'selected' : ''}>Ms</option>
            <option ${p.title === 'Mx' ? 'selected' : ''}>Mx</option>
          </select>
        </div>
        <div class="pax-field"><label>First Name</label><input required data-pax="${i}" data-field="first" value="${p.first}" placeholder="As on passport"></div>
        <div class="pax-field"><label>Last Name</label><input required data-pax="${i}" data-field="last" value="${p.last}" placeholder="As on passport"></div>
        <div class="pax-field"><label>Date of Birth</label><input required type="date" data-pax="${i}" data-field="dob" value="${p.dob}"></div>
        <div class="pax-field"><label>Nationality</label><input required data-pax="${i}" data-field="nationality" value="${p.nationality}" placeholder="e.g. Japan"></div>
        <div class="pax-field"><label>Passport Number</label><input required data-pax="${i}" data-field="passport" value="${p.passport}" placeholder="e.g. TZ1234567"></div>
      </div>
    </div>
  `).join('');

  body.innerHTML = `
    <div class="co-step-title">Passenger Details</div>
    <div class="co-step-sub">Enter details exactly as they appear on each traveler's passport.</div>
    <form id="paxForm" novalidate>
      ${paxForms}
      <div class="pax-form-card">
        <div class="pax-form-title">✉️ Contact Details</div>
        <div class="pax-form-grid">
          <div class="pax-field"><label>Email</label><input required type="email" id="contactEmail" value="${contactData.email}" placeholder="you@example.com"></div>
          <div class="pax-field"><label>Phone</label><input required type="tel" id="contactPhone" value="${contactData.phone}" placeholder="+81 90 1234 5678"></div>
        </div>
      </div>
      <div class="co-actions">
        <button type="button" class="co-btn co-btn-secondary" id="paxBack">← Back to Seats</button>
        <button type="submit" class="co-btn co-btn-primary">Continue to Payment →</button>
      </div>
    </form>
  `;

  document.getElementById('paxBack').addEventListener('click', renderStepSeats);
  body.querySelectorAll('[data-pax]').forEach(el => {
    const sync = () => { passengerData[parseInt(el.dataset.pax)][el.dataset.field] = el.value; };
    el.addEventListener('input', sync);
    el.addEventListener('change', sync);
  });

  const form = document.getElementById('paxForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    contactData.email = document.getElementById('contactEmail').value;
    contactData.phone = document.getElementById('contactPhone').value;
    renderStepPayment();
  });
}

// ── Step 3: Payment ───────────────────────────────────────────────────────
function renderStepPayment() {
  currentStep = 4;
  renderStepBar();
  const body = document.getElementById('coBody');

  const orderLines = havePrices ? `
    <div class="order-line"><span>Outbound (${fromCode}→${toCode}) × ${paxCount}</span><span>${formatCurrency(outPrice * paxCount)}</span></div>
    <div class="order-line"><span>Return (${retFrom}→${retTo}) × ${paxCount}</span><span>${formatCurrency(retPrice * paxCount)}</span></div>
  ` : `<div class="order-line"><span>Fare unavailable for this route/cabin</span><span>—</span></div>`;

  body.innerHTML = `
    <div class="co-step-title">Payment</div>
    <div class="co-step-sub">Review your order and complete payment.</div>
    <div class="pay-grid">
      <div class="pay-card">
        <div class="pay-notice">🔒 <div>This is a portfolio demo checkout. No real payment is collected or processed — please don't enter real card details.</div></div>
        <form id="payForm" novalidate>
          <div class="pay-form-grid">
            <div class="pax-field" style="grid-column:1/-1;"><label>Name on Card</label><input required id="payName" autocomplete="off" placeholder="As shown on card"></div>
            <div class="pax-field" style="grid-column:1/-1;"><label>Card Number</label><input required id="payCard" autocomplete="off" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000"></div>
            <div class="pax-field"><label>Expiry</label><input required id="payExpiry" autocomplete="off" inputmode="numeric" maxlength="5" placeholder="MM/YY"></div>
            <div class="pax-field"><label>CVV</label><input required id="payCvv" autocomplete="off" inputmode="numeric" maxlength="4" placeholder="123"></div>
          </div>
          <div class="co-actions">
            <button type="button" class="co-btn co-btn-secondary" id="payBack">← Back to Passengers</button>
            <button type="submit" class="co-btn co-btn-primary">${havePrices ? 'Pay ' + formatCurrency(totalPrice) + ' & Confirm →' : 'Confirm Booking →'}</button>
          </div>
        </form>
      </div>
      <div class="order-summary-card">
        <div class="order-summary-title">Order Summary</div>
        ${orderLines}
        <div class="order-total"><span>Total</span><span>${priceOrContact(totalPrice)}</span></div>
        <div class="order-total-note">${paxCount} passenger${paxCount > 1 ? 's' : ''} · ${cabin} · taxes &amp; fees included</div>
      </div>
    </div>
  `;

  document.getElementById('payBack').addEventListener('click', renderStepPassengers);

  const cardInput = document.getElementById('payCard');
  cardInput.addEventListener('input', () => {
    cardInput.value = cardInput.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
  });
  const expInput = document.getElementById('payExpiry');
  expInput.addEventListener('input', () => {
    let v = expInput.value.replace(/[^\d]/g, '').substring(0, 4);
    if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
    expInput.value = v;
  });

  const form = document.getElementById('payForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    completeBooking();
  });
}

// ── Complete booking → save + confirmation ────────────────────────────────
function saveBooking(booking) {
  let list = [];
  try { list = JSON.parse(localStorage.getItem('anaBookings') || '[]'); } catch (e) {}
  list.push(booking);
  try { localStorage.setItem('anaBookings', JSON.stringify(list)); } catch (e) {}
}

function completeBooking() {
  const ref = 'NH' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const booking = {
    ref, createdAt: new Date().toISOString(),
    cabin, pax: paxCount,
    outbound: { from: fromCode, to: toCode, flightNum: outFlightNum, dep: outDep, arr: outArr, dur: outDur, operator: outOp, date: travelDate, seats: seatState.outbound.assigned.slice() },
    return:   { from: retFrom, to: retTo, flightNum: retFlightNum, dep: retDep, arr: retArr, dur: retDur, operator: retOp, seats: seatState.return.assigned.slice() },
    passengers: passengerData.map(p => ({ ...p })),
    contactEmail: contactData.email, contactPhone: contactData.phone,
    perPersonPriceYen: perPersonPrice, totalPriceYen: totalPrice,
  };
  saveBooking(booking);
  renderConfirmation(booking);
}

function renderConfirmation(booking) {
  currentStep = 5;
  renderStepBar();
  document.querySelector('.co-summary').style.display = 'none';
  const body = document.getElementById('coBody');
  body.innerHTML = `
    <div class="co-confirm">
      <div class="co-confirm-icon">✅</div>
      <div class="co-confirm-title">Booking Confirmed!</div>
      <div class="co-confirm-ref">Booking Reference <strong>${booking.ref}</strong> — a confirmation has been sent to ${booking.contactEmail || 'your email'}.</div>
      <div class="co-confirm-details">
        <div class="co-confirm-row"><span>Outbound</span><span>${booking.outbound.from} → ${booking.outbound.to} · ${booking.outbound.flightNum.replace('+', ' + ')}</span></div>
        <div class="co-confirm-row"><span>Return</span><span>${booking.return.from} → ${booking.return.to} · ${booking.return.flightNum.replace('+', ' + ')}</span></div>
        <div class="co-confirm-row"><span>Passengers</span><span>${booking.passengers.map(p => (p.first + ' ' + p.last).trim() || '—').join(', ')}</span></div>
        <div class="co-confirm-row"><span>Seats (Outbound)</span><span>${booking.outbound.seats.filter(Boolean).join(', ') || '—'}</span></div>
        <div class="co-confirm-row"><span>Seats (Return)</span><span>${booking.return.seats.filter(Boolean).join(', ') || '—'}</span></div>
        <div class="co-confirm-row"><span>Total Paid</span><span>${priceOrContact(booking.totalPriceYen)}</span></div>
      </div>
      <div class="co-confirm-actions">
        <a href="my-trips.html" class="co-btn co-btn-primary" style="text-decoration:none;display:inline-block;">Manage This Booking</a>
        <a href="index.html#search-widget" class="co-btn co-btn-secondary" style="text-decoration:none;display:inline-block;">Search New Flights</a>
      </div>
    </div>
  `;
}

// ── Init ──────────────────────────────────────────────────────────────────
buildCurrencySelector('currencyMount');
renderTripSummary();
renderStepSeats();
window.addEventListener('scroll', () =>
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 10));
