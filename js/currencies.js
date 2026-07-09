// Base prices are stored in JPY. All conversions go from JPY.
const CURRENCIES = {
    JPY: { symbol: '¥',   rate: 1,         label: 'JPY', name: 'Japanese Yen'      },
    USD: { symbol: '$',   rate: 0.00667,   label: 'USD', name: 'US Dollar'          },
    CAD: { symbol: 'C$',  rate: 0.00910,   label: 'CAD', name: 'Canadian Dollar'    },
    EUR: { symbol: '€',   rate: 0.00620,   label: 'EUR', name: 'Euro'               },
    GBP: { symbol: '£',   rate: 0.00527,   label: 'GBP', name: 'British Pound'      },
    AUD: { symbol: 'A$',  rate: 0.01031,   label: 'AUD', name: 'Australian Dollar'  },
    HKD: { symbol: 'HK$', rate: 0.0520,    label: 'HKD', name: 'Hong Kong Dollar'   },
    SGD: { symbol: 'S$',  rate: 0.00902,   label: 'SGD', name: 'Singapore Dollar'   },
    KRW: { symbol: '₩',   rate: 8.97,      label: 'KRW', name: 'Korean Won'         },
};

let currentCurrency = localStorage.getItem('ana_currency') || 'JPY';

function convertPrice(yen) {
    const cur = CURRENCIES[currentCurrency];
    if (!cur) return yen;
    const raw = yen * cur.rate;
    // Round to nearest sensible unit
    if (currentCurrency === 'KRW') return Math.round(raw / 100) * 100;
    if (currentCurrency === 'JPY') return Math.round(raw);
    return Math.round(raw);
}

function formatCurrency(yen) {
    if (!yen) return null;
    const cur = CURRENCIES[currentCurrency];
    return `${cur.symbol}${convertPrice(yen).toLocaleString()}`;
}

function setCurrency(code) {
    if (!CURRENCIES[code]) return;
    currentCurrency = code;
    localStorage.setItem('ana_currency', code);
    // Update all price displays on page
    document.querySelectorAll('[data-yen]').forEach(el => {
        const yen = parseInt(el.dataset.yen);
        if (!isNaN(yen)) el.textContent = formatCurrency(yen);
    });
    // Update currency selector display
    document.querySelectorAll('.currency-selected').forEach(el => el.textContent = code);
    document.querySelectorAll('.currency-option').forEach(el => {
        el.classList.toggle('active', el.dataset.currency === code);
    });
}

function buildCurrencySelector(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
        <div class="currency-toggle" id="currencyToggle">
            <span class="currency-selected">${currentCurrency}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        </div>
        <div class="currency-dropdown" id="currencyDropdown">
            ${Object.entries(CURRENCIES).map(([code, c]) => `
                <div class="currency-option ${code === currentCurrency ? 'active' : ''}"
                     data-currency="${code}">
                    <span class="cur-code">${code}</span>
                    <span class="cur-name">${c.name}</span>
                </div>`).join('')}
        </div>`;

    const toggle   = el.querySelector('#currencyToggle');
    const dropdown = el.querySelector('#currencyDropdown');

    toggle.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });
    el.querySelectorAll('.currency-option').forEach(opt => {
        opt.addEventListener('click', () => {
            setCurrency(opt.dataset.currency);
            dropdown.classList.remove('open');
        });
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
}
