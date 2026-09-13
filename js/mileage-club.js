// ── Data helpers ────────────────────────────────────────────────────────────
function getBookings() {
  try { return JSON.parse(localStorage.getItem('anaBookings') || '[]'); } catch (e) { return []; }
}

function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const CABIN_MULTIPLIER = { 'Economy': 1.0, 'Premium Economy': 1.25, 'Business': 1.5, 'First Class': 2.0 };

function legMiles(fromCode, toCode, cabin) {
  const a = AIRPORTS[fromCode], b = AIRPORTS[toCode];
  if (!a || !b) return 0;
  const dist = haversineMiles(a.lat, a.lng, b.lat, b.lng);
  const mult = CABIN_MULTIPLIER[cabin] || 1.0;
  return Math.round(dist * mult);
}

function bookingMiles(booking) {
  const out = legMiles(booking.outbound.from, booking.outbound.to, booking.cabin);
  const ret = booking.return ? legMiles(booking.return.from, booking.return.to, booking.cabin) : 0;
  return out + ret;
}

// ── Tiers ───────────────────────────────────────────────────────────────────
const TIERS = [
  { name: 'Bronze',   min: 0,      color: '#9CA3AF', benefits: ['Standard seat selection', 'Miles earning on every ANA & partner flight', 'Access to Mileage Club award booking'] },
  { name: 'Silver',   min: 25000,  color: '#94A3B8', benefits: ['Priority check-in', '+25% bonus miles', '2 extra checked bags', 'Priority standby'] },
  { name: 'Gold',     min: 60000,  color: '#C9A84C', benefits: ['Star Alliance Gold status', 'Lounge access worldwide', '+50% bonus miles', 'Priority boarding & baggage'] },
  { name: 'Diamond',  min: 120000, color: '#7C3AED', benefits: ['Flagship Lounge access', '+100% bonus miles', 'Guaranteed upgrade on request', 'Dedicated concierge line'] },
];

function currentTier(miles) {
  let t = TIERS[0];
  for (const tier of TIERS) if (miles >= tier.min) t = tier;
  return t;
}
function nextTier(miles) {
  return TIERS.find(t => t.min > miles) || null;
}

// ── Render member card ─────────────────────────────────────────────────────
function renderMemberCard() {
  const bookings = getBookings();
  const totalMiles = bookings.reduce((sum, b) => sum + bookingMiles(b), 0);
  const tier = currentTier(totalMiles);
  const next = nextTier(totalMiles);
  const pct = next ? Math.min(100, Math.round(((totalMiles - tier.min) / (next.min - tier.min)) * 100)) : 100;

  // Derive a demo member name from the most recent booking's primary passenger, if any
  const latest = bookings[bookings.length - 1];
  const primary = latest?.passengers?.[0];
  const memberName = primary ? `${primary.first || ''} ${primary.last || ''}`.trim() : 'Guest Member';
  const memberNum = 'ANA-' + (primary?.passport ? primary.passport.replace(/\D/g, '').slice(-8).padStart(8, '0') : '00000000');

  document.getElementById('mcCard').innerHTML = `
    <div>
      <div class="mc-card-id">Member</div>
      <div class="mc-card-name">${memberName}</div>
      <div class="mc-card-num">${memberNum}</div>
      <div class="mc-tier-badge" style="background:${tier.color}22;color:${tier.color};border:1.5px solid ${tier.color}55;">★ ${tier.name} Member</div>
    </div>
    <div style="flex:1;min-width:220px;max-width:320px;">
      <div class="mc-progress-wrap">
        <div class="mc-progress-track"><div class="mc-progress-fill" style="width:${pct}%;"></div></div>
        <div class="mc-progress-note">${next ? `${(next.min - totalMiles).toLocaleString()} miles to ${next.name}` : 'Highest tier reached'}</div>
      </div>
    </div>
    <div class="mc-card-miles">
      <div class="mc-card-miles-val">${totalMiles.toLocaleString()}</div>
      <div class="mc-card-miles-lbl">Total Miles</div>
    </div>
  `;

  return { totalMiles, tier };
}

// ── Render tier grid ────────────────────────────────────────────────────────
function renderTierGrid(currentTierName) {
  document.getElementById('mcTierGrid').innerHTML = TIERS.map(t => `
    <div class="mc-tier-card ${t.name === currentTierName ? 'current' : ''}">
      <div class="mc-tier-card-name" style="color:${t.color};">${t.name}</div>
      <div class="mc-tier-card-req">${t.min.toLocaleString()}+ miles/year</div>
      <ul>${t.benefits.map(b => `<li>${b}</li>`).join('')}</ul>
    </div>
  `).join('');
}

// ── Render activity list ───────────────────────────────────────────────────
function renderActivity() {
  const bookings = getBookings();
  const list = document.getElementById('mcActivityList');
  if (!bookings.length) {
    list.innerHTML = `<div class="mc-activity-empty">No activity yet — book a flight to start earning miles.</div>`;
    return;
  }
  list.innerHTML = bookings.slice().reverse().map(b => {
    const miles = bookingMiles(b);
    const date = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
    return `
    <div class="mc-activity-row">
      <div>
        <div class="mc-activity-route">${b.outbound.from} → ${b.outbound.to} → ${b.outbound.from}</div>
        <div class="mc-activity-meta">${date} · ${b.cabin} · ${b.ref}</div>
      </div>
      <div class="mc-activity-miles">+${miles.toLocaleString()} mi</div>
    </div>`;
  }).join('');
}

// ── Calculator ──────────────────────────────────────────────────────────────
const mcDatalist = document.getElementById('mcAirportList');
mcDatalist.innerHTML = Object.entries(AIRPORTS).map(([code, a]) => `<option value="${a.city} (${code})">`).join('');
function mcExtractCode(val) { const m = (val || '').match(/\(([A-Z]{3})\)$/); return m ? m[1] : ''; }

document.getElementById('mcCalcBtn').addEventListener('click', () => {
  const from = mcExtractCode(document.getElementById('mcCalcFrom').value);
  const to = mcExtractCode(document.getElementById('mcCalcTo').value);
  const cabin = document.getElementById('mcCalcCabin').value;
  const roundTrip = document.getElementById('mcCalcRT').value === '1';
  const resultEl = document.getElementById('mcCalcResult');

  if (!from || !to || !AIRPORTS[from] || !AIRPORTS[to]) {
    resultEl.className = 'mc-calc-result show';
    resultEl.innerHTML = `<div class="mc-calc-result-note">Please select both airports from the suggestions.</div>`;
    return;
  }
  const oneWay = legMiles(from, to, cabin);
  const total = roundTrip ? oneWay * 2 : oneWay;
  resultEl.className = 'mc-calc-result show';
  resultEl.innerHTML = `
    <div>
      <div class="mc-calc-result-miles">${total.toLocaleString()} miles</div>
      <div class="mc-calc-result-note">${from} → ${to}${roundTrip ? ' round trip' : ' one way'} · ${cabin}</div>
    </div>
    <div class="mc-calc-result-note">Based on flight distance × cabin multiplier — actual miles may vary by fare class.</div>
  `;
});

// ── Init ────────────────────────────────────────────────────────────────────
const { tier } = renderMemberCard();
renderTierGrid(tier.name);
renderActivity();

window.addEventListener('scroll', () =>
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 10));
