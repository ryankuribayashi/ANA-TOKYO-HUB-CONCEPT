// Pre-select destination if coming from destinations page
const preselect = sessionStorage.getItem('preselect-to');
if (preselect) {
  try {
    const { code, city } = JSON.parse(preselect);
    sessionStorage.removeItem('preselect-to');
    window.addEventListener('DOMContentLoaded', () => {
      const toInput = document.getElementById('input-to');
      if (toInput) {
        toInput.value = `${city} (${code})`;
        selectedTo = code;
      }
    });
  } catch(e) {}
}

// Language
let currentLang = 'en';

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-en]').forEach(el => {
        el.innerHTML = lang === 'jp' ? el.dataset.jp : el.dataset.en;
    });
    document.querySelectorAll('input[data-placeholder-en]').forEach(el => {
        el.placeholder = lang === 'jp' ? el.dataset.placeholderJp : el.dataset.placeholderEn;
    });
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-jp').classList.toggle('active', lang === 'jp');
}

document.getElementById('langToggle')?.addEventListener('click', () => {
    setLang(currentLang === 'en' ? 'jp' : 'en');
});

// Navbar scroll
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Search tabs
document.querySelectorAll('.search-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const returnField = document.querySelector('.search-field:has(#input-return)');
        if (returnField) returnField.style.display = tab.dataset.en === 'One Way' || tab.innerHTML.includes('片') ? 'none' : '';
    });
});

// Airport autocomplete
let selectedFrom = null;
let selectedTo = null;

function setupAutocomplete(inputId, dropdownId, onSelect) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
        const q = input.value.trim();
        const results = searchAirports(q);
        dropdown.innerHTML = '';
        if (results.length === 0 || q.length === 0) {
            dropdown.classList.remove('open');
            return;
        }
        results.forEach(ap => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerHTML = `
                <span class="dropdown-code">${ap.code}</span>
                <span class="dropdown-info">
                    <span class="dropdown-city">${ap.city}</span>
                    <span class="dropdown-name">${ap.name}</span>
                </span>
                <span class="dropdown-country">${ap.country}</span>
            `;
            item.addEventListener('click', () => {
                input.value = `${ap.city} (${ap.code})`;
                dropdown.classList.remove('open');
                onSelect(ap.code);
            });
            dropdown.appendChild(item);
        });
        dropdown.classList.add('open');
    });

    document.addEventListener('click', e => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

setupAutocomplete('input-from', 'dropdown-from', code => {
    selectedFrom = code;
    document.querySelectorAll('.hub-depart-chip').forEach(c => c.classList.remove('active'));
    updateMiniMap(selectedFrom, selectedTo);
});

function setDepartHub(code, label, chipId) {
    selectedFrom = code;
    const input = document.getElementById('input-from');
    if (input) input.value = label;
    document.querySelectorAll('.hub-depart-chip').forEach(c => c.classList.remove('active'));
    document.getElementById(chipId)?.classList.add('active');
    updateMiniMap(selectedFrom, selectedTo);
}

setupAutocomplete('input-to', 'dropdown-to', code => {
    selectedTo = code;
    updateMiniMap(selectedFrom, selectedTo);
});

// Swap button
document.getElementById('swapBtn')?.addEventListener('click', () => {
    const fromInput = document.getElementById('input-from');
    const toInput = document.getElementById('input-to');
    const tmp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = tmp;
    const tmpCode = selectedFrom;
    selectedFrom = selectedTo;
    selectedTo = tmpCode;
    updateMiniMap(selectedFrom, selectedTo);
});

// Set default date
const today = new Date();
const fmt = d => d.toISOString().split('T')[0];
const depart = document.getElementById('input-depart');
const ret = document.getElementById('input-return');
if (depart) depart.value = fmt(new Date(today.getTime() + 7 * 86400000));
if (ret) ret.value = fmt(new Date(today.getTime() + 14 * 86400000));

// Search button
function extractCode(val) { const m = (val||'').match(/\(([A-Z]{3})\)$/); return m?m[1]:''; }

document.getElementById('searchBtn')?.addEventListener('click', () => {
    // Fall back to parsing "City (XXX)" out of the raw input if the user
    // typed a city but never clicked the dropdown suggestion — previously
    // this silently sent the display text instead of the airport code.
    const fromCode = selectedFrom || extractCode(document.getElementById('input-from')?.value);
    const toCode   = selectedTo   || extractCode(document.getElementById('input-to')?.value);
    const date = document.getElementById('input-depart')?.value;
    const cabin = document.getElementById('input-class')?.value || 'Economy';
    const pax = parseInt(document.getElementById('input-pax')?.value) || 1;
    if (!fromCode || !toCode) {
        alert(currentLang === 'jp' ? '出発地と目的地を入力してください（候補から選択してください）' : 'Please select an origin and destination from the dropdown suggestions');
        return;
    }
    const url = `results.html?from=${fromCode}&to=${toCode}&date=${date}&cabin=${cabin}&pax=${pax}`;
    const overlay = document.getElementById('loadingOverlay');
    const bar = document.getElementById('loadingBar');
    if (!overlay) { window.location.href = url; return; }
    overlay.classList.add('open');
    let pct = 0;
    const iv = setInterval(() => {
        pct += (pct < 70 ? 1.4 : pct < 90 ? 0.6 : 0.3);
        bar.style.width = Math.min(pct, 98) + '%';
        if (pct >= 100) { clearInterval(iv); window.location.href = url; }
    }, 50);
    setTimeout(() => { clearInterval(iv); window.location.href = url; }, 5000);
});

// Destination cards
document.querySelectorAll('.dest-card').forEach(card => {
    card.addEventListener('click', () => {
        const code = card.dataset.code;
        const toInput = document.getElementById('input-to');
        if (toInput && AIRPORTS[code]) {
            toInput.value = `${AIRPORTS[code].city} (${code})`;
            selectedTo = code;
            updateMiniMap(selectedFrom, selectedTo);
            document.querySelector('.search-widget').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Currency selector
buildCurrencySelector('currencyMount');

// Hub map
window.addEventListener('load', () => {
    initHubMap();
});

// ── Announcement bar ──────────────────────────────────────────────────────────
(function() {
  const msgs = [
    '✈  New route: Tokyo → Austin, Texas launching Summer 2026 · Book from ¥138,000',
    '⭐  Star Alliance Gold members: earn double miles on all ANA flights this summer',
    '🛫  3× daily service to New York · London · Paris from Tokyo Mega Hub',
    '🌏  ANA Business Class — full flat-bed on all Boeing 777-9 routes from ¥798,000',
    '🔔  Tokyo Mega Hub: 100+ destinations · 3 daily connection banks · 5 runways',
    '🎌  ANA Named Best Airline in Japan — Skytrax World Airline Awards 2026',
  ];
  let idx = 0;
  const el = document.getElementById('announceText');
  const bar = document.getElementById('announceBar');
  const nav = document.getElementById('navbar');
  if (!el || !bar) return;
  el.textContent = msgs[0];
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      idx = (idx + 1) % msgs.length;
      el.textContent = msgs[idx];
      el.style.opacity = '1';
    }, 350);
  }, 4500);
  document.getElementById('announceClose')?.addEventListener('click', () => {
    bar.style.display = 'none';
    if (nav) nav.style.top = '0';
  });
})();

// ── Hero background slideshow ─────────────────────────────────────────────────
(function() {
  const images = [
    'assets/hero-777.webp',
    'assets/hero-tarmac-sunset.jpg',
    'assets/hero-787.jpg',
    'assets/hero-sa-night.jpg',
    'assets/hero-tarmac-day.jpg',
    'assets/hero-bb8.webp',
  ];
  const bgA = document.getElementById('heroBgA');
  const bgB = document.getElementById('heroBgB');
  if (!bgA || !bgB) return;

  let current = 0;
  let useA = true;

  // Set first image immediately
  bgA.style.backgroundImage = `url('${images[0]}')`;

  // Preload all images
  images.forEach(src => { const img = new Image(); img.src = src; });

  setInterval(() => {
    current = (current + 1) % images.length;
    const active  = useA ? bgA : bgB;
    const standby = useA ? bgB : bgA;

    standby.style.backgroundImage = `url('${images[current]}')`;
    standby.style.opacity = '1';
    active.style.opacity  = '0';
    useA = !useA;
  }, 7000);
})();

// ── Flatpickr date pickers ────────────────────────────────────────────────────
(function() {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const defaultDepart = fmt(new Date(today.getTime() + 7*86400000));
  const defaultReturn = fmt(new Date(today.getTime() + 14*86400000));

  const returnPicker = flatpickr('#input-return', {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    defaultDate: defaultReturn,
    disableMobile: false,
  });

  flatpickr('#input-depart', {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    defaultDate: defaultDepart,
    disableMobile: false,
    onChange: function(selectedDates, dateStr) {
      if (returnPicker && selectedDates.length > 0) {
        const nextDay = new Date(selectedDates[0].getTime() + 86400000);
        returnPicker.set('minDate', nextDay);
        if (returnPicker.selectedDates[0] && returnPicker.selectedDates[0] <= selectedDates[0]) {
          returnPicker.setDate(nextDay);
        }
      }
    },
  });
})();

// ── Multi-City Search ─────────────────────────────────────────────────────────
(function() {
  const mcForm   = document.getElementById('mcForm');
  const normalForm = document.getElementById('normalForm');
  if (!mcForm) return;

  let mcLegs = []; // [{from, to, date, fromCode, toCode}]
  let mcDates = [];

  function createLegRow(idx) {
    const legDiv = document.createElement('div');
    legDiv.className = 'mc-leg';
    legDiv.dataset.idx = idx;
    legDiv.innerHTML = `
      <div class="mc-leg-num">${idx + 1}</div>
      <div class="search-field" style="position:relative;">
        <label>FROM</label>
        <input type="text" class="mc-from" placeholder="City or airport" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">
        <div class="airport-dropdown mc-dd-from"></div>
      </div>
      <button class="mc-swap" title="Swap">⇄</button>
      <div class="search-field" style="position:relative;">
        <label>TO</label>
        <input type="text" class="mc-to" placeholder="City or airport" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">
        <div class="airport-dropdown mc-dd-to"></div>
      </div>
      <div class="search-field">
        <label>DATE</label>
        <input type="text" class="mc-date date-input" placeholder="Select date" readonly>
      </div>
      ${idx > 1 ? '<button class="mc-remove" title="Remove">✕</button>' : '<div></div>'}
    `;
    document.getElementById('mcLegs').appendChild(legDiv);

    const fromInput = legDiv.querySelector('.mc-from');
    const toInput   = legDiv.querySelector('.mc-to');
    const fromDd    = legDiv.querySelector('.mc-dd-from');
    const toDd      = legDiv.querySelector('.mc-dd-to');
    const dateInput = legDiv.querySelector('.mc-date');

    // Autocomplete for FROM
    setupMcAC(fromInput, fromDd, (code, city) => {
      mcLegs[idx] = mcLegs[idx] || {};
      mcLegs[idx].fromCode = code; mcLegs[idx].from = city;
    });
    // Autocomplete for TO
    setupMcAC(toInput, toDd, (code, city) => {
      mcLegs[idx] = mcLegs[idx] || {};
      mcLegs[idx].toCode = code; mcLegs[idx].to = city;
      // Auto-fill next leg's FROM
      const nextLeg = document.querySelectorAll('.mc-leg')[idx + 1];
      if (nextLeg) {
        const nextFrom = nextLeg.querySelector('.mc-from');
        if (nextFrom && !nextFrom.value) {
          nextFrom.value = `${city} (${code})`;
          mcLegs[idx + 1] = mcLegs[idx + 1] || {};
          mcLegs[idx + 1].fromCode = code;
          mcLegs[idx + 1].from = city;
        }
      }
    });
    // Flatpickr for date
    const fp = flatpickr(dateInput, {
      dateFormat: 'Y-m-d',
      minDate: idx === 0 ? 'today' : undefined,
      onChange: (sel, str) => { mcLegs[idx] = mcLegs[idx] || {}; mcLegs[idx].date = str; },
    });
    mcDates[idx] = fp;
    if (idx > 0 && mcDates[idx-1]?.selectedDates[0]) {
      fp.set('minDate', mcDates[idx-1].selectedDates[0]);
    }

    // Swap button
    legDiv.querySelector('.mc-swap').addEventListener('click', () => {
      const tv = fromInput.value; fromInput.value = toInput.value; toInput.value = tv;
      const tc = mcLegs[idx]?.fromCode;
      if (mcLegs[idx]) { mcLegs[idx].fromCode = mcLegs[idx].toCode; mcLegs[idx].toCode = tc; }
    });

    // Remove button
    const rmBtn = legDiv.querySelector('.mc-remove');
    if (rmBtn) rmBtn.addEventListener('click', () => {
      legDiv.remove();
      mcLegs.splice(idx, 1);
      mcDates.splice(idx, 1);
      // Renumber remaining legs
      document.querySelectorAll('.mc-leg').forEach((el, i) => {
        el.dataset.idx = i;
        const num = el.querySelector('.mc-leg-num');
        if (num) num.textContent = i + 1;
      });
    });
  }

  function setupMcAC(input, dropdown, onSelect) {
    input.addEventListener('input', () => {
      const q = input.value.trim();
      const results = typeof searchAirports !== 'undefined' ? searchAirports(q) : [];
      dropdown.innerHTML = '';
      if (!results.length || !q.length) { dropdown.classList.remove('open'); return; }
      results.forEach(ap => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerHTML = `<span class="dropdown-code">${ap.code}</span>
          <span class="dropdown-info"><span class="dropdown-city">${ap.city}</span>
          <span class="dropdown-name">${ap.name}</span></span>
          <span class="dropdown-country">${ap.country}</span>`;
        item.addEventListener('click', () => {
          input.value = `${ap.city} (${ap.code})`;
          dropdown.classList.remove('open');
          onSelect(ap.code, ap.city);
        });
        dropdown.appendChild(item);
      });
      dropdown.classList.add('open');
    });
    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
  }

  // Init 2 legs by default
  createLegRow(0);
  createLegRow(1);

  // Add flight button (max 5 legs)
  document.getElementById('mcAddBtn')?.addEventListener('click', () => {
    const count = document.querySelectorAll('.mc-leg').length;
    if (count < 5) createLegRow(count);
    if (count >= 4) document.getElementById('mcAddBtn').style.opacity = '0.4';
  });

  // Search multi-city
  document.getElementById('mcSearchBtn')?.addEventListener('click', () => {
    const legs = document.querySelectorAll('.mc-leg');
    if (!legs.length) return;
    const first = legs[0];
    const from = first.querySelector('.mc-from')?.value;
    const to   = first.querySelector('.mc-to')?.value;
    const date = first.querySelector('.mc-date')?.value;
    const cabin = document.getElementById('input-class')?.value || 'Economy';
    const pax = parseInt(document.getElementById('input-pax')?.value) || 1;
    if (!mcLegs[0]?.fromCode || !mcLegs[0]?.toCode) {
      alert('Please enter origin and destination for at least the first flight');
      return;
    }
    // Build multi-city params — also extract code from typed text as fallback
    function extractCode(val) { const m = (val||'').match(/\(([A-Z]{3})\)$/); return m?m[1]:''; }
    const allLegs = [...document.querySelectorAll('.mc-leg')].map((el, i) => ({
      from: mcLegs[i]?.fromCode || extractCode(el.querySelector('.mc-from')?.value) || '',
      to:   mcLegs[i]?.toCode   || extractCode(el.querySelector('.mc-to')?.value)   || '',
      date: mcLegs[i]?.date     || el.querySelector('.mc-date')?.value || '',
    })).filter(l => l.from && l.to);

    const url = new URLSearchParams({
      from: allLegs[0].from,
      to:   allLegs[0].to,
      date: allLegs[0].date || '',
      cabin,
      pax,
      mc: JSON.stringify(allLegs),
    });
    const overlay = document.getElementById('loadingOverlay');
    const bar = document.getElementById('loadingBar');
    if (overlay) {
      overlay.classList.add('open');
      let pct = 0;
      const iv = setInterval(() => {
        pct += (pct < 70 ? 1.4 : pct < 90 ? 0.6 : 0.3);
        bar.style.width = Math.min(pct, 98) + '%';
        if (pct >= 100) { clearInterval(iv); window.location.href = 'results.html?' + url; }
      }, 50);
      setTimeout(() => { clearInterval(iv); window.location.href = 'results.html?' + url; }, 5000);
    } else {
      window.location.href = 'results.html?' + url;
    }
  });

  // Switch between normal and multi-city forms
  document.querySelectorAll('.search-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const isMulti = tab.textContent.includes('Multi') || tab.dataset.en === 'Multi-City';
      mcForm.style.display    = isMulti ? 'block' : 'none';
      normalForm.style.display = isMulti ? 'none'  : 'flex';
    });
  });
})();
