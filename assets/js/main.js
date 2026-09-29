/* Pacific Linq Group — main.js (no dependencies besides Bootstrap bundle) */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  /* Sticky header shadow + back-to-top ------------------------------------ */
  var header = document.querySelector('.site-header');
  var toTop = document.querySelector('.back-to-top');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* Active nav link based on current page -------------------------------- */
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var alias = { 'product-details.html': 'products.html' };
  var current = alias[page] || page;
  document.querySelectorAll('[data-nav] a.nav-link').forEach(function (a) {
    if ((a.getAttribute('href') || '').toLowerCase() === current) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* Reveal on scroll ------------------------------------------------------ */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var d = e.target.getAttribute('data-delay');
          if (d) e.target.style.transitionDelay = d + 'ms';
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Counters -------------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (String(target).split('.')[1] || '').length;
    var start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute('data-count') + (c.getAttribute('data-suffix') || ''); });
  }

  /* Product filter (products.html) --------------------------------------- */
  var grid = document.getElementById('productGrid');
  if (grid) {
    var items = Array.prototype.slice.call(grid.querySelectorAll('[data-category]'));
    var chips = document.querySelectorAll('.filter-chip');
    var search = document.getElementById('productSearch');
    var countEl = document.getElementById('resultCount');
    var empty = document.getElementById('emptyState');
    var activeCat = 'all';

    var params = new URLSearchParams(location.search);
    if (params.get('category')) activeCat = params.get('category');

    function apply() {
      var q = (search && search.value || '').trim().toLowerCase();
      var shown = 0;
      items.forEach(function (it) {
        var okCat = activeCat === 'all' || it.getAttribute('data-category') === activeCat;
        var okQ = !q || it.textContent.toLowerCase().indexOf(q) > -1;
        var show = okCat && okQ;
        it.classList.toggle('d-none', !show);
        if (show) shown++;
      });
      chips.forEach(function (c) {
        var on = c.getAttribute('data-filter') === activeCat;
        c.classList.toggle('active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (countEl) countEl.textContent = 'Showing ' + shown + ' of ' + items.length + ' materials';
      if (empty) empty.classList.toggle('show', shown === 0);
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () { activeCat = c.getAttribute('data-filter'); apply(); });
    });
    if (search) search.addEventListener('input', apply);
    var reset = document.getElementById('resetFilters');
    if (reset) reset.addEventListener('click', function () { activeCat = 'all'; if (search) search.value = ''; apply(); });
    apply();
  }

  /* Product gallery thumbs (product-details.html) ------------------------ */
  var mainImg = document.getElementById('pdMainImg');
  if (mainImg) {
    document.querySelectorAll('.pd-thumbs button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.pd-thumbs button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        mainImg.src = b.getAttribute('data-src');
      });
    });
  }

  /* File input labels ----------------------------------------------------- */
  document.querySelectorAll('.file-drop input[type="file"]').forEach(function (inp) {
    var label = inp.closest('.file-drop');
    var out = label.querySelector('.file-name');
    inp.addEventListener('change', function () {
      var names = Array.prototype.map.call(inp.files, function (f) { return f.name; });
      if (out) out.textContent = names.length ? names.join(', ') : '';
    });
    ['dragenter', 'dragover'].forEach(function (ev) { label.addEventListener(ev, function (e) { e.preventDefault(); label.classList.add('dragover'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { label.addEventListener(ev, function () { label.classList.remove('dragover'); }); });
    label.addEventListener('drop', function (e) {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files.length) { inp.files = e.dataTransfer.files; inp.dispatchEvent(new Event('change')); }
    });
  });

  /* Forms: client-side validation + demo success state ------------------- */
  document.querySelectorAll('form.js-validate').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var ok = f.type === 'checkbox' ? f.checked : f.value.trim() !== '' && (!f.checkValidity || f.checkValidity());
        f.classList.toggle('is-invalid', !ok);
        if (!ok && valid) { f.focus(); valid = false; }
      });
      if (!valid) return;
      var btn = form.querySelector('[type="submit"]');
      var msg = form.querySelector('.form-success');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Sending…'; }
      // Replace this timeout with your real submission (fetch to backend / form service).
      setTimeout(function () {
        form.reset();
        form.querySelectorAll('.file-name').forEach(function (n) { n.textContent = ''; });
        if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.label; }
        if (msg) { msg.classList.add('show'); msg.focus && msg.focus(); setTimeout(function () { msg.classList.remove('show'); }, 7000); }
      }, 900);
    });
    form.querySelectorAll('[required]').forEach(function (f) {
      f.addEventListener('input', function () { f.classList.remove('is-invalid'); });
      f.addEventListener('change', function () { f.classList.remove('is-invalid'); });
    });
  });

  /* Prefill product on RFQ from ?product= -------------------------------- */
  var productField = document.getElementById('rfqProduct');
  if (productField) {
    var p = new URLSearchParams(location.search).get('product');
    if (p) productField.value = p;
  }

  /* Footer year ----------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Close offcanvas when a link inside it is clicked (same-page anchors) -- */
  var oc = document.getElementById('mobileMenu');
  if (oc && window.bootstrap) {
    oc.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { var inst = bootstrap.Offcanvas.getInstance(oc); if (inst) inst.hide(); });
    });
  }
})();
