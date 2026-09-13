function getBookings() {
  try { return JSON.parse(localStorage.getItem('anaBookings') || '[]'); } catch (e) { return []; }
}
function saveBookings(list) {
  try { localStorage.setItem('anaBookings', JSON.stringify(list)); } catch (e) {}
}

// Seed one demo booking on first-ever visit so the lookup has something to
// find before the visitor has completed a real checkout.
(function seedDemoBooking() {
  const list = getBookings();
  if (list.length) return;
  const demo = {
    ref: 'NH7K2M9P',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    cabin: 'Business', pax: 2,
    outbound: { from: 'NRT', to: 'LHR', flightNum: 'NH 201', dep: '11:40', arr: '16:10', dur: '14h 30m', operator: 'ANA', date: '', seats: ['6A', '6D'] },
    return:   { from: 'LHR', to: 'NRT', flightNum: 'NH 202', dep: '19:50', arr: '16:20+1', dur: '12h 30m', operator: 'ANA', seats: ['6A', '6D'] },
    passengers: [
      { title: 'Mr', first: 'Kenji', last: 'Tanaka', dob: '1985-04-12', nationality: 'Japan', passport: 'TZ4471820' },
      { title: 'Ms', first: 'Yuki',  last: 'Tanaka', dob: '1987-09-03', nationality: 'Japan', passport: 'TZ4471821' },
    ],
    contactEmail: 'kenji.tanaka@example.com', contactPhone: '+81 90 1234 5678',
    perPersonPriceYen: 798000, totalPriceYen: 1596000,
  };
  saveBookings([demo]);
})();

document.getElementById('mtTryDemo').addEventListener('click', () => {
  document.getElementById('mtRef').value = 'NH7K2M9P';
  document.getElementById('mtLast').value = 'Tanaka';
  document.getElementById('mtForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
});

document.getElementById('mtForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const ref = document.getElementById('mtRef').value.trim().toUpperCase();
  const last = document.getElementById('mtLast').value.trim().toLowerCase();
  if (!ref || !last) return;

  const bookings = getBookings();
  const found = bookings.find(b =>
    b.ref.toUpperCase() === ref &&
    b.passengers.some(p => (p.last || '').toLowerCase() === last)
  );

  const body = document.getElementById('mtBody');
  if (!found) {
    body.innerHTML = `<div class="mt-error">No booking found matching that reference and last name. Double-check both fields, or try the demo booking above.</div>`;
    return;
  }
  renderTrip(found);
});

function renderTrip(booking) {
  const body = document.getElementById('mtBody');
  const priceStr = booking.totalPriceYen != null ? formatCurrency(booking.totalPriceYen) : 'Contact ANA';

  body.innerHTML = `
    <div class="mt-trip-card" id="mtTripCard">
      <div class="mt-trip-head">
        <div class="mt-trip-ref">Booking Reference <strong>${booking.ref}</strong></div>
        <div class="mt-trip-cabin">${booking.cabin}</div>
      </div>
      <div class="mt-leg">
        <div class="mt-leg-icon">↗</div>
        <div>
          <div class="mt-leg-route">${booking.outbound.from} → ${booking.outbound.to}</div>
          <div class="mt-leg-detail"><strong>${booking.outbound.flightNum.replace('+', ' + ')}</strong> &nbsp;·&nbsp; ${booking.outbound.dep} → ${booking.outbound.arr} &nbsp;·&nbsp; ${booking.outbound.dur}</div>
          <div class="mt-leg-detail">Operated by <strong>${booking.outbound.operator}</strong> &nbsp;·&nbsp; Seats: <strong>${(booking.outbound.seats || []).filter(Boolean).join(', ') || 'TBD at check-in'}</strong></div>
        </div>
      </div>
      <div class="mt-leg">
        <div class="mt-leg-icon">↙</div>
        <div>
          <div class="mt-leg-route">${booking.return.from} → ${booking.return.to}</div>
          <div class="mt-leg-detail"><strong>${booking.return.flightNum.replace('+', ' + ')}</strong> &nbsp;·&nbsp; ${booking.return.dep} → ${booking.return.arr} &nbsp;·&nbsp; ${booking.return.dur}</div>
          <div class="mt-leg-detail">Operated by <strong>${booking.return.operator}</strong> &nbsp;·&nbsp; Seats: <strong>${(booking.return.seats || []).filter(Boolean).join(', ') || 'TBD at check-in'}</strong></div>
        </div>
      </div>
      <div class="mt-section">
        <div class="mt-section-title">Passengers</div>
        ${booking.passengers.map(p => `
          <div class="mt-pax-row">
            <span>${p.title} ${p.first} ${p.last}</span>
            <span>${p.passport || '—'}</span>
          </div>
        `).join('')}
      </div>
      <div class="mt-section">
        <div class="mt-section-title">Contact</div>
        <div class="mt-pax-row"><span>Email</span><span>${booking.contactEmail || '—'}</span></div>
        <div class="mt-pax-row"><span>Phone</span><span>${booking.contactPhone || '—'}</span></div>
      </div>
      <div class="mt-trip-foot">
        <div class="mt-total">Total Paid <strong>${priceStr}</strong></div>
        <div id="mtCancelZone">
          <button class="mt-cancel-btn" id="mtCancelBtn">Cancel Booking</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('mtCancelBtn').addEventListener('click', () => {
    document.getElementById('mtCancelZone').innerHTML = `
      <div class="mt-cancel-confirm">
        Cancel this booking?
        <button class="mt-cancel-yes" id="mtCancelYes">Yes, cancel</button>
        <button class="mt-cancel-no" id="mtCancelNo">Keep it</button>
      </div>
    `;
    document.getElementById('mtCancelYes').addEventListener('click', () => {
      const list = getBookings().filter(b => b.ref !== booking.ref);
      saveBookings(list);
      document.getElementById('mtTripCard').innerHTML = `<div class="mt-cancelled-note">✓ Booking ${booking.ref} has been cancelled.</div>`;
    });
    document.getElementById('mtCancelNo').addEventListener('click', () => renderTrip(booking));
  });
}
