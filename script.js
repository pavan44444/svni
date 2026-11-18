/* ------------------------------------------------------------
   IMAGES
   Every <img data-img="name.jpg"> loads from images/name.jpg.
   Put your own photo in the images folder with the same name and
   it replaces the placeholder. Until then, the image is loaded
   from the current svet.ac.in site (or data-fallback if set).
   ------------------------------------------------------------ */
const LOCAL_DIR = "images/";
const LIVE_DIR = "https://svet.ac.in/images/";

document.querySelectorAll("img[data-img]").forEach((img) => {
  const name = img.dataset.img;
  const fallback = LIVE_DIR + (img.dataset.fallback || name);
  img.addEventListener("error", function onErr() {
    if (img.src !== fallback) {
      img.src = fallback;
    } else {
      img.removeEventListener("error", onErr);
    }
  });
  img.src = LOCAL_DIR + name;
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------
   HEADER: scrolled state, mobile menu, dropdowns
   ------------------------------------------------------------ */
const header = document.querySelector(".site-header");
const nav = document.getElementById("nav");
const toggle = document.querySelector(".nav-toggle");

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 40);
}
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

function closeMenu() {
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}
toggle.addEventListener("click", (e) => {
  e.stopPropagation();
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

function closeDropdowns(except) {
  document.querySelectorAll(".dd.open").forEach((d) => {
    if (d === except) return;
    d.classList.remove("open");
    d.querySelector(".dd-btn").setAttribute("aria-expanded", "false");
  });
}
document.querySelectorAll(".dd-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const dd = btn.parentElement;
    closeDropdowns(dd);
    const open = dd.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
});
document.addEventListener("click", (e) => {
  closeDropdowns();
  if (!nav.contains(e.target)) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDropdowns();
    closeMenu();
  }
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

/* ------------------------------------------------------------
   HERO BANNER SLIDER
   Changes slide every 6.5 seconds. Hover (mouse) or keyboard focus
   pauses it. Dots, arrows, swipe and left/right keys all work.
   ------------------------------------------------------------ */
(function () {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const slides = [...hero.querySelectorAll(".hero__slide")];
  const tabs = [...hero.querySelectorAll(".hero__tab")];
  const INTERVAL = 6500;
  let current = 0;
  let timer = null;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => {
      s.classList.toggle("is-active", i === current);
      s.setAttribute("aria-hidden", i === current ? "false" : "true");
    });
    tabs.forEach((t, i) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", String(i === current));
    });
    void hero.offsetWidth; // restarts the dot's progress animation
    tabs[current].classList.add("is-active");

    // load this slide and the next one before they are needed
    [current, (current + 1) % slides.length].forEach((n) => {
      const img = slides[n].querySelector("img");
      if (img) img.loading = "eager";
    });
  }

  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { stop(); timer = setInterval(() => goTo(current + 1), INTERVAL); };
  const go = (i) => { goTo(i); start(); };
  const pause = () => { hero.classList.add("is-paused"); stop(); };
  const resume = () => { hero.classList.remove("is-paused"); go(current); };

  tabs.forEach((t, i) => t.addEventListener("click", () => go(i)));
  hero.querySelector(".hero__arrow--prev").addEventListener("click", () => go(current - 1));
  hero.querySelector(".hero__arrow--next").addEventListener("click", () => go(current + 1));

  // Pause on mouse hover (not on touch screens) and on keyboard focus
  if (window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("mouseenter", pause);
    hero.addEventListener("mouseleave", resume);
  }
  hero.addEventListener("focusin", (e) => { if (e.target.matches(":focus-visible")) pause(); });
  hero.addEventListener("focusout", () => { if (hero.classList.contains("is-paused")) resume(); });

  hero.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(current - 1);
    if (e.key === "ArrowRight") go(current + 1);
  });

  // Swipe on touch screens
  let startX = 0;
  hero.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // Stop while the browser tab is in the background
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (!hero.classList.contains("is-paused")) start();
  });

  goTo(0);
  start();
})();

/* ------------------------------------------------------------
   MARQUEES: duplicate the group once so the loop is seamless
   ------------------------------------------------------------ */
document.querySelectorAll(".marquee__track").forEach((track) => {
  const group = track.querySelector(".marquee__group");
  if (!group) return;
  const clone = group.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  clone.querySelectorAll("img").forEach((img) => { img.alt = ""; });
  track.appendChild(clone);
});

/* ------------------------------------------------------------
   SCROLL REVEAL (content is visible by default without JS)
   ------------------------------------------------------------ */
(function () {
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    group.querySelectorAll(":scope > .reveal, :scope > * > .reveal").forEach((el, i) => {
      el.style.setProperty("--d", Math.min(i, 6) * 0.08 + "s");
    });
  });

  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  items.forEach((el) => io.observe(el));
})();

/* ------------------------------------------------------------
   STAT COUNTERS: run once when scrolled into view
   ------------------------------------------------------------ */
(function () {
  const stats = document.querySelector(".stats");
  if (!stats || reduceMotion || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    stats.querySelectorAll("[data-count]").forEach((el) => {
      const end = +el.dataset.count;
      const start = performance.now();
      const dur = 1500;
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))).toLocaleString("en-IN");
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.4 });
  io.observe(stats);
})();

document.getElementById("year").textContent = new Date().getFullYear();