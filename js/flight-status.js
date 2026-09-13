// ── Airport datalist ────────────────────────────────────────────────────────
const fsDatalist = document.getElementById('fsAirportList');
fsDatalist.innerHTML = Object.entries(AIRPORTS).map(([code, a]) => `<option value="${a.city} (${code})">`).join('');

function fsExtractCode(val) { const m = (val || '').match(/\(([A-Z]{3})\)$/); return m ? m[1] : ''; }

document.getElementById('fsSwap').addEventListener('click', () => {
  const f = document.getElementById('fsFrom'), t = document.getElementById('fsTo');
  const tmp = f.value; f.value = t.value; t.value = tmp;
});

let fsFlights = [];
let fsFrom = '', fsTo = '';
let fsActiveIndex = 0;

document.getElementById('fsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const fromCode = fsExtractCode(document.getElementById('fsFrom').value) || 'NRT';
  const toCode = fsExtractCode(document.getElementById('fsTo').value);
  if (!toCode) { alert('Please select a destination from the suggestions'); return; }
  fsFrom = fromCode; fsTo = toCode;
  fsFlights = (typeof buildFlights === 'function' && buildFlights(fromCode, toCode)) || [];
  fsActiveIndex = 0;
  renderFsBody();
});

// ── Status simulation ─────────────────────────────────────────────────────
// Not a live feed — derives a plausible phase from time-of-day vs. the
// flight's fixed daily local departure time. Clearly labeled as simulated.
function fsComputeStatus(depLocalStr, durStr) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const depMatch = (depLocalStr || '').match(/(\d{1,2}):(\d{2})/);
  const depMin = depMatch ? parseInt(depMatch[1]) * 60 + parseInt(depMatch[2]) : 0;
  const durMatch = (durStr || '').match(/(\d+)h\s*(\d+)?/);
  const durMin = durMatch ? parseInt(durMatch[1]) * 60 + (parseInt(durMatch[2]) || 0) : 600;

  const cycle = ((nowMin - depMin) % 1440 + 1440) % 1440; // minutes since most recent scheduled departure
  if (cycle < durMin) {
    return { phase: 'inflight', pct: Math.round((cycle / durMin) * 100), minsRemaining: durMin - cycle, durMin };
  }
  if (cycle < durMin + 60) {
    return { phase: 'landed', minsAgo: cycle - durMin, durMin };
  }
  if (cycle >= 1440 - 45) {
    return { phase: 'boarding', minsToDep: 1440 - cycle, durMin };
  }
  return { phase: 'scheduled', minsToDep: 1440 - cycle, durMin };
}

function fsSeededDelay(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (Math.imul(31, h) + seedStr.charCodeAt(i)) | 0;
  const r = (h >>> 0) % 100;
  if (r < 65) return { label: 'On Time', delayMin: 0 };
  if (r < 85) return { label: 'Delayed 15 min', delayMin: 15 };
  if (r < 97) return { label: 'Delayed 40 min', delayMin: 40 };
  return { label: 'Delayed 1h 10m', delayMin: 70 };
}

const PHASE_BADGE = { inflight: 'fs-badge-inflight', boarding: 'fs-badge-boarding', landed: 'fs-badge-landed', scheduled: 'fs-badge-scheduled' };
const PHASE_LABEL = { inflight: 'In Flight', boarding: 'Boarding', landed: 'Landed', scheduled: 'Scheduled' };
const PHASE_LABEL_ICON = { inflight: '✈ In Flight', boarding: '🛫 Boarding', landed: '✅ Landed', scheduled: '🕐 Scheduled' };

function fsGateInfo(f) {
  if (fsFrom === 'NRT' && typeof nrtGateOut === 'function') return nrtGateOut(fsTo);
  if (fsTo === 'NRT' && typeof nrtGateIn === 'function') return nrtGateIn(fsFrom, f.tag === 'partner');
  return 'See airport display';
}

function renderFsBody() {
  const body = document.getElementById('fsBody');
  if (!fsFlights.length) {
    body.innerHTML = `<div class="fs-empty"><div class="fs-empty-icon">✈️</div><div>No scheduled service found for ${fsFrom} → ${fsTo}.</div></div>`;
    return;
  }

  const listHtml = fsFlights.map((f, i) => {
    const st = fsComputeStatus(f.depLocal, f.totalTime);
    return `
    <div class="fs-flight-card ${i === fsActiveIndex ? 'active' : ''}" data-index="${i}">
      <div class="fs-flight-card-top">
        <span>${f.flightOut}${f.direct ? '' : ' + ' + f.flightIn}</span>
        <span class="fs-flight-card-badge ${PHASE_BADGE[st.phase]}">${PHASE_LABEL[st.phase]}</span>
      </div>
      <div class="fs-flight-card-meta">${f.depLocal} → ${f.arrDest} · ${f.totalTime} · ${f.operator}</div>
    </div>`;
  }).join('');

  const f = fsFlights[fsActiveIndex];
  const status = fsComputeStatus(f.depLocal, f.totalTime);
  const delay = fsSeededDelay((f.flightOut || '') + fsFrom + fsTo);
  const gateInfo = fsGateInfo(f);

  let statusExtra = '';
  if (status.phase === 'inflight') statusExtra = `${status.minsRemaining} min remaining`;
  else if (status.phase === 'boarding') statusExtra = `Boarding now — departs in ${status.minsToDep} min`;
  else if (status.phase === 'landed') statusExtra = `Landed ${status.minsAgo} min ago`;
  else statusExtra = `Departs in ${Math.floor(status.minsToDep / 60)}h ${status.minsToDep % 60}m`;

  body.innerHTML = `
    <div>
      <div class="fs-list-title">${fsFrom} → ${fsTo} · ${fsFlights.length} flight${fsFlights.length > 1 ? 's' : ''} today</div>
      <div class="fs-list">${listHtml}</div>
    </div>
    <div class="fs-panel">
      <div class="fs-panel-head">
        <div class="fs-panel-route">${fsFrom} <span class="fs-panel-route-arrow">→</span> ${fsTo}</div>
        <div class="fs-panel-flightno">${f.flightOut}${f.direct ? '' : ' + ' + f.flightIn} · ${f.operator} · ${f.aircraft1}${f.direct ? '' : ' / ' + f.aircraft2}</div>
        <div class="fs-panel-status-row">
          <span class="fs-status-badge ${PHASE_BADGE[status.phase]}">${PHASE_LABEL_ICON[status.phase]}</span>
          <span style="font-size:12px;color:#6B7280;">${statusExtra}</span>
          <span class="${delay.delayMin ? 'fs-delay' : 'fs-ontime'}">${delay.label}</span>
        </div>
      </div>
      ${status.phase === 'inflight' ? `
      <div class="fs-progress-wrap">
        <div class="fs-progress-track"><div class="fs-progress-fill" style="width:${status.pct}%;"></div></div>
        <div class="fs-progress-labels"><span>${fsFrom}</span><span>${fsTo}</span></div>
        <div class="fs-progress-pct">${status.pct}% complete</div>
      </div>` : ''}
      <div class="fs-detail-grid">
        <div><div class="fs-detail-label">Scheduled Departure</div><div class="fs-detail-val">${f.depLocal} local</div></div>
        <div><div class="fs-detail-label">Scheduled Arrival</div><div class="fs-detail-val">${f.arrDest} local</div></div>
        <div><div class="fs-detail-label">Flight Time</div><div class="fs-detail-val">${f.totalTime}</div></div>
        <div><div class="fs-detail-label">Gate</div><div class="fs-detail-val">${gateInfo}</div></div>
        <div><div class="fs-detail-label">Aircraft</div><div class="fs-detail-val">${f.aircraft1}${f.direct ? '' : ' + ' + f.aircraft2}</div></div>
      </div>
      <div class="fs-sim-note">📡 Status is simulated for demo purposes, based on time of day — not a live feed.</div>
      <div class="fs-map-wrap"><div id="results-map"></div></div>
    </div>
  `;

  document.querySelectorAll('.fs-flight-card').forEach(card => {
    card.addEventListener('click', () => {
      fsActiveIndex = parseInt(card.dataset.index);
      renderFsBody();
    });
  });

  setTimeout(() => { if (typeof initAnimatedMap === 'function') initAnimatedMap(fsFrom, fsTo); }, 60);
}

// Run an initial demo search on load
document.getElementById('fsForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

window.addEventListener('scroll', () =>
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 10));
