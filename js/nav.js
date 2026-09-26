(function () {
    var btn = document.getElementById('navHamburger');
    var nav = document.getElementById('mobileNav');
    var closeBtn = document.getElementById('mobileNavClose');
    if (!btn || !nav) return;

    function openMenu() {
        nav.classList.add('open');
        btn.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        nav.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
    }

    btn.addEventListener('click', function () {
        nav.classList.contains('open') ? closeMenu() : openMenu();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    nav.querySelectorAll('.mobile-nav-link, .mobile-nav-book').forEach(function (a) {
        a.addEventListener('click', closeMenu);
    });

    // Close on outside tap
    nav.addEventListener('click', function (e) {
        if (e.target === nav) closeMenu();
    });
})();

// ── Cross-link into the JAL section ─────────────────────────────────────────
// Injected here (rather than hand-added to every ANA page) so the whole site
// gets the link from a single shared file. JAL's own pages (jal.html,
// jal-destinations.html, jal-fleet.html) carry their own bespoke red-branded
// nav instead of this badge, so this only fires where a "fleet.html" nav link
// actually exists — i.e. never on the JAL pages themselves.
(function () {
    var deskFleet = document.querySelector('.nav-links a[href="fleet.html"]');
    if (deskFleet) deskFleet.insertAdjacentHTML('afterend',
        '<a href="jal.html" class="nav-link nav-link-jal">JAL <span class="jal-pill">JL</span></a>');
    var mobFleet = document.querySelector('.mobile-nav a[href="fleet.html"]');
    if (mobFleet) mobFleet.insertAdjacentHTML('afterend',
        '<a href="jal.html" class="mobile-nav-link nav-link-jal">Fly JAL <span class="jal-pill">JL</span></a>');
})();
