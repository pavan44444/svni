/* ------------------------------------------------------------
   IMAGES
   Every <img data-img="name.jpg"> loads from /images/name.jpg.
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

/* Mobile menu */
const nav = document.getElementById("nav");
const toggle = document.querySelector(".nav-toggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});

/* Dropdowns (click for touch, hover handled in CSS) */
document.querySelectorAll(".dd-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const dd = btn.parentElement;
    const open = dd.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
    e.stopPropagation();
  });
});
document.addEventListener("click", () => {
  document.querySelectorAll(".dd.open").forEach((d) => {
    d.classList.remove("open");
    d.querySelector(".dd-btn").setAttribute("aria-expanded", false);
  });
});

/* Testimonials */
const quotes = [...document.querySelectorAll(".q")];
let current = 0;
function showQuote(i) {
  current = (i + quotes.length) % quotes.length;
  quotes.forEach((q, n) => q.classList.toggle("active", n === current));
}
document.querySelector(".q-prev").addEventListener("click", () => showQuote(current - 1));
document.querySelector(".q-next").addEventListener("click", () => showQuote(current + 1));

/* Stat counters: the one animated moment, runs once when scrolled into view */
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const stats = document.querySelector(".stats");
if (stats && !reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    stats.querySelectorAll("[data-count]").forEach((el) => {
      const end = +el.dataset.count;
      const start = performance.now();
      const dur = 1400;
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))).toLocaleString("en-IN");
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.4 });
  io.observe(stats);
}

document.getElementById("year").textContent = new Date().getFullYear();
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const slides = [...hero.querySelectorAll('.hero__slide')];
  const dotsWrap = hero.querySelector('.hero__dots');
  const INTERVAL = 5000;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0, timer = null;

  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hero__dot';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => { goTo(i); restart(); });
    dotsWrap.appendChild(b);
    return b;
  });

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === current);
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      const img = s.querySelector('img');
      if (img && i === current) img.loading = 'eager';
    });
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === current));
  }

  const start = () => { if (!reduceMotion) timer = setInterval(() => goTo(current + 1), INTERVAL); };
  const stop = () => clearInterval(timer);
  const restart = () => { stop(); start(); };

  hero.querySelector('.hero__arrow--prev').addEventListener('click', () => { goTo(current - 1); restart(); });
  hero.querySelector('.hero__arrow--next').addEventListener('click', () => { goTo(current + 1); restart(); });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', start);

  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { goTo(current - 1); restart(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); restart(); }
  });

  // Swipe on touch screens
  let startX = 0;
  hero.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); restart(); }
  }, { passive: true });

  goTo(0);
  start();
})();