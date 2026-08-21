/* Talon Insights — shared behaviour. No dependencies. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- year ---- */
  var yr = document.getElementById("yr");
  if (yr) { yr.textContent = new Date().getFullYear(); }

  /* ---- header scroll state ---- */
  var head = document.querySelector(".site-head");
  function onScroll() {
    head.classList.toggle("scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- mobile nav ---- */
  var burger = document.querySelector(".burger");
  var mnav = document.getElementById("mnav");
  if (burger && mnav) {
    burger.addEventListener("click", function () {
      var open = mnav.getAttribute("data-open") === "true";
      mnav.setAttribute("data-open", String(!open));
      burger.setAttribute("aria-expanded", String(!open));
      if (!open) { head.classList.add("scrolled"); } else { onScroll(); }
    });
    mnav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        mnav.setAttribute("data-open", "false");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- flight paths: measure, then draw when visible ---- */
  var fps = document.querySelectorAll(".flightpath");
  fps.forEach(function (svg) {
    var line = svg.querySelector(".fp-line");
    if (line) { svg.style.setProperty("--len", Math.ceil(line.getTotalLength())); }
  });

  /* ---- scroll reveal ---- */
  var targets = document.querySelectorAll("[data-reveal]");
  targets.forEach(function (el) { el.classList.add("reveal"); });

  function countUp(el) {
    var t = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce || !isFinite(t)) { return; }
    var start = null, dur = 900;
    function frame(ts) {
      if (start === null) { start = ts; }
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(t * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) { requestAnimationFrame(frame); }
    }
    el.textContent = "0" + suffix;
    requestAnimationFrame(frame);
  }

  /* Reveal everything unconditionally — the no-IO path and the failsafe.
     Content must never be left invisible. */
  function revealAll() {
    targets.forEach(function (el) { el.classList.add("is-in"); });
    fps.forEach(function (s) { s.classList.add("is-drawn"); });
    document.querySelectorAll("[data-count]").forEach(function (el) {
      el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
  }

  if (!("IntersectionObserver" in window)) { revealAll(); }
  else {
    var fired = false;
    window.setTimeout(function () { if (!fired) { revealAll(); } }, 2500);

    var io = new IntersectionObserver(function (entries) {
      fired = true;
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        en.target.classList.add("is-in");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });

    var fio = new IntersectionObserver(function (entries) {
      fired = true;
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        en.target.classList.add("is-drawn");
        fio.unobserve(en.target);
      });
    }, { threshold: 0.2 });
    fps.forEach(function (s) { fio.observe(s); });
  }

  /* ---- hero falcon: scroll parallax + pointer tilt ---- */
  var art = document.querySelector(".hero-falcon .art");
  if (art && !reduce) {
    window.addEventListener("scroll", function () {
      var y = Math.min(window.scrollY, 900);
      art.style.transform = "translateX(1%) translateY(" + y * 0.06 + "px)";
    }, { passive: true });
  }
  var tilt = document.querySelector(".hero-falcon .tilt");
  var hero = document.querySelector(".hero");
  if (tilt && hero && !reduce && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform =
        "perspective(1100px) rotateY(" + (x * 7).toFixed(2) + "deg)" +
        " rotateX(" + (-y * 5).toFixed(2) + "deg)";
    });
    hero.addEventListener("pointerleave", function () { tilt.style.transform = ""; });
  }

  /* ---- before/after sliders ---- */
  document.querySelectorAll(".ba").forEach(function (ba) {
    var r = ba.querySelector("input[type=range]");
    if (!r) { return; }
    function set() {
      ba.style.setProperty("--pos", r.value + "%");
      ba.style.setProperty("--posn", r.value);
    }
    r.addEventListener("input", set);
    set();
  });

  /* ---- enquiry form (contact page only) --------------------------------
     Client-side validation, honeypot, and a hard refusal to submit while the
     endpoint is still a placeholder — an enquiry must never be silently lost. */
  var form = document.getElementById("enquiry");
  if (!form) { return; }
  var msg = document.getElementById("formmsg");
  var ENDPOINT = form.getAttribute("action");
  var CONFIGURED = ENDPOINT.indexOf("__") === -1;

  function setError(input, errEl, text) {
    input.setAttribute("aria-invalid", text ? "true" : "false");
    errEl.textContent = text || "";
    return !text;
  }
  function say(state, text) { msg.setAttribute("data-state", state); msg.textContent = text; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("f-name");
    var contact = document.getElementById("f-contact");
    var ok = true;
    ok = setError(name, document.getElementById("e-name"),
      name.value.trim() ? "" : "Please tell me your name.") && ok;
    var v = contact.value.trim();
    var mail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    var tel = /^[0-9+()\s-]{9,}$/.test(v);
    ok = setError(contact, document.getElementById("e-contact"),
      (mail || tel) ? "" : "Please leave an email address or a phone number so I can reply.") && ok;
    if (!ok) {
      say("err", "Please check the highlighted fields.");
      form.querySelector("[aria-invalid='true']").focus();
      return;
    }
    if (document.getElementById("f-hp").value) { return; } /* bot */
    if (!CONFIGURED) {
      say("warn", "This form is not connected to an inbox yet. Please email __EMAIL__ or call __PHONE__ instead — sorry about that.");
      return;
    }
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    say("ok", "Sending…");
    fetch(ENDPOINT, { method: "POST", headers: { "Accept": "application/json" }, body: new FormData(form) })
      .then(function (r) {
        if (!r.ok) { throw new Error("bad"); }
        form.reset();
        say("ok", "Thanks — that's with me. I'll reply within one working day.");
      })
      .catch(function () {
        say("err", "Something went wrong sending that. Please email __EMAIL__ or call __PHONE__ instead.");
      })
      .finally(function () { btn.disabled = false; });
  });
})();
