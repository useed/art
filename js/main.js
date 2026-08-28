/* ============================================================
   USEED Portfolio — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById("preloader");
  let tcStart = performance.now();
  const tcEl = document.querySelector(".preloader-timecode");
  function tickTC(t) {
    if (!preloader.classList.contains("done")) {
      const s = ((t - tcStart) / 1000).toFixed(2).padStart(5, "0");
      if (tcEl) tcEl.textContent = "00:00:" + s.replace(".", ":") + ":0";
      requestAnimationFrame(tickTC);
    }
  }
  requestAnimationFrame(tickTC);
  window.addEventListener("load", function () {
    setTimeout(() => preloader.classList.add("done"), 500);
  });
  // Safety: hide after 4s max
  setTimeout(() => preloader.classList.add("done"), 4000);

  /* ---------- Nav ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 40);

    const bar = document.getElementById("scrollProgress");
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = pct + "%";
  }, { passive: true });

  burger.addEventListener("click", function () {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
    document.body.style.overflow = navLinks.classList.contains("open") ? "hidden" : "";
  });

  document.querySelectorAll("[data-nav]").forEach(a => {
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      navLinks.classList.remove("open");
      document.body.style.overflow = "";
    });
  });

  /* Active section highlight */
  const sections = [...document.querySelectorAll("section[id]")];
  const linkMap = {};
  document.querySelectorAll(".nav-links a[data-nav]").forEach(a => {
    linkMap[a.getAttribute("href").slice(1)] = a;
  });
  const secObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && linkMap[e.target.id]) {
        Object.values(linkMap).forEach(l => l.classList.remove("active"));
        linkMap[e.target.id].classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(s => { if (linkMap[s.id]) secObserver.observe(s); });

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  /* ---------- Counters ---------- */
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      counterObserver.unobserve(el);
      const target = parseInt(el.dataset.count, 10);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const dur = 1600;
      const t0 = performance.now();
      function step(t) {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(el => counterObserver.observe(el));

  /* ---------- Language proficiency bars ---------- */
  const langObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const fill = e.target;
      langObserver.unobserve(fill);
      const pct = parseInt(fill.dataset.lang, 10) || 0;
      requestAnimationFrame(() => { fill.style.width = pct + "%"; });
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".lang-fill").forEach(el => langObserver.observe(el));

  /* ---------- YouTube facade + modal ---------- */
  const vmodal = document.getElementById("vmodal");
  const vmodalFrame = document.getElementById("vmodalFrame");
  const vmodalClose = document.getElementById("vmodalClose");
  const vmodalBackdrop = document.getElementById("vmodalBackdrop");
  let currentVideoId = null;

  function openVideo(id) {
    currentVideoId = id;
    vmodalFrame.innerHTML =
      '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    vmodal.classList.add("open");
    vmodal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeVideo() {
    vmodal.classList.remove("open");
    vmodal.setAttribute("aria-hidden", "true");
    vmodalFrame.innerHTML = "";
    currentVideoId = null;
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-video]").forEach(el => {
    el.addEventListener("click", () => {
      // Videos with embedding disabled open directly on YouTube
      if (el.dataset.href) {
        window.open(el.dataset.href, "_blank", "noopener");
        return;
      }
      openVideo(el.dataset.video);
    });
  });
  vmodalClose.addEventListener("click", closeVideo);
  vmodalBackdrop.addEventListener("click", closeVideo);

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");

  let lbList = [];
  let lbIndex = 0;

  function openLightbox(group, src) {
    lbList = [...document.querySelectorAll('[data-lightbox="' + group + '"]')].map(a => a.getAttribute("href"));
    lbIndex = Math.max(0, lbList.indexOf(src));
    lbImg.src = src;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function showLb(i) {
    lbIndex = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIndex];
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-lightbox]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      openLightbox(a.dataset.lightbox, a.getAttribute("href"));
    });
  });
  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", e => { e.stopPropagation(); showLb(lbIndex - 1); });
  lbNext.addEventListener("click", e => { e.stopPropagation(); showLb(lbIndex + 1); });
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });

  /* ---------- Language toggle (EN / AR) ---------- */
  const langBtn = document.getElementById("langToggle");
  const langLabel = document.getElementById("langLabel");

  function setLang(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", lang === "ar");
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const entry = window.I18N[el.dataset.i18n];
      if (entry && entry[lang] !== undefined) el.innerHTML = entry[lang];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const entry = window.I18N[el.dataset.i18nHtml];
      if (entry && entry[lang] !== undefined) el.innerHTML = entry[lang];
    });
    if (langLabel) langLabel.textContent = (lang === "ar") ? "English" : "العربية";
    try { localStorage.setItem("useed-lang", lang); } catch (e) {}
  }

  if (langBtn) {
    langBtn.addEventListener("click", function () {
      setLang(document.documentElement.dir === "rtl" ? "en" : "ar");
    });
    // Restore saved preference
    let saved = null;
    try { saved = localStorage.getItem("useed-lang"); } catch (e) {}
    if (saved === "ar") setLang("ar");
  }

  /* ---------- Gallery toggle ---------- */
  const gBtn = document.getElementById("galleryToggle");
  const gWrap = document.getElementById("masonry");
  if (gBtn && gWrap) {
    gBtn.addEventListener("click", function () {
      const isOpen = !gWrap.hasAttribute("hidden");
      if (isOpen) {
        gWrap.setAttribute("hidden", "");
        gBtn.querySelector("span").textContent = "Show Gallery";
      } else {
        gWrap.removeAttribute("hidden");
        gBtn.querySelector("span").textContent = "Hide Gallery";
        gWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  /* ---------- Shorts local video (optional) ---------- */
  const sVids = document.querySelectorAll(".s-video");
  sVids.forEach(v => {
    v.addEventListener("click", () => {
      sVids.forEach(o => { if (o !== v) o.pause(); });
      if (v.paused) v.play(); else v.pause();
    });
  });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeLightbox(); closeVideo(); }
    if (lightbox.classList.contains("open")) {
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
    }
  });

})();
