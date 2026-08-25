// ── Shared expanded-itinerary renderer ─────────────────────────────────────────
// Consumes the generic `segments` / `layovers` arrays every flight-builder
// function in flights.js now attaches to each card (see mkLeg/mkStop there).
// Renders any itinerary length (1 leg direct, 2 legs, 3 legs) from the same
// code path — no more hardcoded "Segment 1 / Segment 2 / optional Segment 3"
// markup, and every real stop gets its own honestly-labeled layover block.
// Loaded by both results.html and booking.html.

function codeshareRow(seg) {
  // ANA-marketed segments sometimes have a Star Alliance partner also selling
  // the same flight under their own number — surface that where it applies.
  if (seg.operator !== 'ANA' || typeof SCHEDULE === 'undefined') return '';
  const schedCode = seg.from === 'NRT' ? seg.to : seg.to === 'NRT' ? seg.from : null;
  const s = schedCode ? SCHEDULE[schedCode] : null;
  if (!s?.partner) return '';
  return `<div class="exp-row exp-row-cs"><span class="exp-label">Codeshare</span>` +
         `<span class="exp-val"><span class="cs-badge">${s.partnerNo}</span> also marketed by ${s.partner}</span></div>`;
}

function legCardHtml(seg, index, total) {
  const badge = total > 1 ? `Flight ${index + 1} of ${total}` : 'Direct Flight';
  return `
    <div class="exp-segment">
      <div class="exp-seg-header">
        <span class="exp-seg-badge">${badge}</span>
        <span class="exp-seg-route">${seg.from} → ${seg.to}</span>
        <span class="exp-seg-time">${seg.duration}</span>
      </div>
      <div class="exp-seg-body">
        <div class="exp-row"><span class="exp-label">Flight</span><span class="exp-val">${seg.flightNo} <span class="exp-operator">· ${seg.operator}</span></span></div>
        ${codeshareRow(seg)}
        <div class="exp-row"><span class="exp-label">Aircraft</span><span class="exp-val">${seg.aircraft}</span></div>
        <div class="exp-row"><span class="exp-label">Departs</span><span class="exp-val">${seg.depTime} local · ${seg.depTerm}</span></div>
        <div class="exp-row"><span class="exp-label">Arrives</span><span class="exp-val">${seg.arrTime === '—' ? '—' : seg.arrTime + ' local'} · ${seg.arrTerm}</span></div>
        <div class="exp-row"><span class="exp-label">Cabins</span><span class="exp-val">${seg.cabin}</span></div>
      </div>
    </div>`;
}

function layoverHtml(stop) {
  const overnightTag = stop.overnight ? `<span class="exp-overnight-badge">Overnight</span>` : '';
  return `
    <div class="exp-transit">
      <div class="exp-transit-icon">✈ ${stop.hubLabel}</div>
      <div class="exp-transit-detail">
        <div class="exp-layover-head">
          <span class="exp-val-gold">${stop.wait === '—' ? 'Connection' : stop.wait + ' layover'} at ${stop.label}</span>
          ${overnightTag}
        </div>
        <div class="exp-row"><span class="exp-label">Transfer</span><span class="exp-val">${stop.detail}</span></div>
        ${stop.note ? `<div class="exp-row"><span class="exp-label">Note</span><span class="exp-val">${stop.note}</span></div>` : ''}
      </div>
    </div>`;
}

function renderItinerarySegments(f) {
  if (!f.segments || f.segments.length === 0) return '<div class="flight-expanded-content"><p>Flight details unavailable.</p></div>';
  const n = f.segments.length;
  const parts = [];
  f.segments.forEach((seg, i) => {
    parts.push(legCardHtml(seg, i, n));
    if (f.layovers[i]) parts.push(layoverHtml(f.layovers[i]));
  });
  return `<div class="flight-expanded-content"><div class="exp-segments">${parts.join('')}</div></div>`;
}
