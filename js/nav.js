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
