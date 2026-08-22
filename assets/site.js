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

  /* ---- desktop nav dropdowns: hover, click, keyboard ---- */
  var drops = document.querySelectorAll(".navdrop");
  function closeDrops(except) {
    drops.forEach(function (d) {
      if (d === except) { return; }
      d.setAttribute("data-open", "false");
      d.querySelector(".navdrop-t").setAttribute("aria-expanded", "false");
    });
  }
  drops.forEach(function (d) {
    var t = d.querySelector(".navdrop-t");
    var hoverable = window.matchMedia("(hover: hover)").matches;
    function set(open) {
      d.setAttribute("data-open", String(open));
      t.setAttribute("aria-expanded", String(open));
      if (open) { closeDrops(d); }
    }
    t.addEventListener("click", function (e) {
      e.stopPropagation();
      set(d.getAttribute("data-open") !== "true");
    });
    if (hoverable) {
      var timer;
      d.addEventListener("pointerenter", function () { clearTimeout(timer); set(true); });
      d.addEventListener("pointerleave", function () {
        timer = setTimeout(function () { set(false); }, 140);
      });
    }
    d.addEventListener("focusout", function (e) {
      if (!d.contains(e.relatedTarget)) { set(false); }
    });
  });
  if (drops.length) {
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") { return; }
      var open = document.querySelector('.navdrop[data-open="true"]');
      if (open) { open.querySelector(".navdrop-t").focus(); closeDrops(null); }
    });
    document.addEventListener("click", function () { closeDrops(null); });
  }

  /* ---- mobile nav accordion groups ---- */
  document.querySelectorAll(".mgroup").forEach(function (g) {
    var t = g.querySelector(".mgroup-t");
    var m = g.querySelector(".mgroup-m");
    t.addEventListener("click", function () {
      var open = g.getAttribute("data-open") === "true";
      g.setAttribute("data-open", String(!open));
      t.setAttribute("aria-expanded", String(!open));
      if (reduce) { m.style.height = open ? "0px" : "auto"; return; }
      if (open) {
        m.style.height = m.scrollHeight + "px";
        requestAnimationFrame(function () { m.style.height = "0px"; });
      } else {
        m.style.height = "0px";
        requestAnimationFrame(function () { m.style.height = m.scrollHeight + "px"; });
        m.addEventListener("transitionend", function te() {
          m.style.height = "auto"; m.removeEventListener("transitionend", te);
        });
      }
    });
  });

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

  /* ---- scroll progress: the flight path as a reading indicator ---- */
  var prog = document.querySelector(".progress i");
  if (prog) {
    var ticking = false;
    function drawProgress() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(drawProgress); }
    }, { passive: true });
    drawProgress();
  }

  /* ---- back to top ---- */
  var toTop = document.querySelector(".totop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.setAttribute("data-show", String(window.scrollY > window.innerHeight));
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---- lightbox: click any case image to enlarge ---- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lb-cap");
    var lastFocus = null;

    function openLB(src, alt) {
      lastFocus = document.activeElement;
      lbImg.src = src;
      lbImg.alt = alt || "";
      lbCap.textContent = alt || "";
      lb.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb-close").focus();
    }
    function closeLB() {
      lb.setAttribute("data-open", "false");
      document.body.style.overflow = "";
      if (lastFocus) { lastFocus.focus(); }
    }

    document.querySelectorAll(".case-img").forEach(function (img) {
      /* wrap so a hover cue can sit over the image */
      var fig = document.createElement("span");
      fig.className = "figzoom";
      img.parentNode.insertBefore(fig, img);
      fig.appendChild(img);
      fig.insertAdjacentHTML("beforeend",
        '<span class="zoomcue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6" ' +
        'stroke-linecap="round"/></svg>Click to enlarge</span>');

      img.setAttribute("role", "button");
      img.setAttribute("tabindex", "0");
      img.addEventListener("click", function () { openLB(img.currentSrc || img.src, img.alt); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); img.click(); }
      });
    });

    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target === lbImg || e.target.closest(".lb-close")) { closeLB(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.getAttribute("data-open") === "true") { closeLB(); }
    });
  }

  /* ---- cursor spotlight on service cards ---- */
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".svc").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    /* ---- magnetic pull on primary CTAs (deliberately slight) ---- */
    document.querySelectorAll(".btn--amber, .btn--primary").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = "translate(" + (dx * 7).toFixed(1) + "px," +
          (dy * 5 - 1).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---- smooth accordion (progressive: <details> still works without JS) ---- */
  if (!reduce) {
    document.querySelectorAll(".faq details").forEach(function (d) {
      var summary = d.querySelector("summary");
      if (!summary) { return; }
      var wrap = document.createElement("div");
      wrap.className = "faq-body";
      while (summary.nextSibling) { wrap.appendChild(summary.nextSibling); }
      d.appendChild(wrap);

      summary.addEventListener("click", function (e) {
        e.preventDefault();
        if (d.open) {
          wrap.style.height = wrap.scrollHeight + "px";
          requestAnimationFrame(function () { wrap.style.height = "0px"; });
          wrap.addEventListener("transitionend", function te() {
            d.open = false; wrap.style.height = "";
            wrap.removeEventListener("transitionend", te);
          });
        } else {
          d.open = true;
          wrap.style.height = "0px";
          requestAnimationFrame(function () { wrap.style.height = wrap.scrollHeight + "px"; });
          wrap.addEventListener("transitionend", function te() {
            wrap.style.height = "auto";
            wrap.removeEventListener("transitionend", te);
          });
        }
      });
    });
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
    var loc = document.getElementById("f-loc");
    var when = document.getElementById("f-when");
    var consent = document.getElementById("f-consent");
    var needs = form.querySelectorAll("input[name=need]");
    var ok = true;
    ok = setError(name, document.getElementById("e-name"),
      name.value.trim() ? "" : "Please tell me your name.") && ok;
    var v = contact.value.trim();
    var mail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    var tel = /^[0-9+()\s-]{9,}$/.test(v);
    ok = setError(contact, document.getElementById("e-contact"),
      (mail || tel) ? "" : "Please leave an email address or a phone number so I can reply.") && ok;
    var picked = false, i;
    for (i = 0; i < needs.length; i++) { if (needs[i].checked) { picked = true; } }
    ok = setError(needs[0], document.getElementById("e-need"),
      picked ? "" : "Pick at least one — “Not sure yet” is a perfectly good answer.") && ok;
    ok = setError(loc, document.getElementById("e-loc"),
      loc.value.trim() ? "" : "Roughly where are you? A town is enough.") && ok;
    ok = setError(when, document.getElementById("e-when"),
      when.value.trim() ? "" : "Roughly when were you thinking?") && ok;
    ok = setError(consent, document.getElementById("e-consent"),
      consent.checked ? "" : "Please tick this so I know I can reply to you.") && ok;
    if (!ok) {
      say("err", "Please check the highlighted fields.");
      form.querySelector("[aria-invalid='true']").focus();
      return;
    }
    if (document.getElementById("f-hp").value) { return; } /* bot */
    if (!CONFIGURED) {
      say("warn", "This form is not connected to an inbox yet. Please email taloninsights@gmail.com or call 07742 082423 instead — sorry about that.");
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
        say("err", "Something went wrong sending that. Please email taloninsights@gmail.com or call 07742 082423 instead.");
      })
      .finally(function () { btn.disabled = false; });
  });
})();
