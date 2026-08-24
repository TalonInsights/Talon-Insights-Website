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

  /* ---- the design machine (web design page) --------------------------
     Three research briefs, one artifact. A brief is data; the render is a
     pure function of it. Which is the section's whole argument. */
  var dz = document.getElementById("wd-dz");
  if (dz) {
    var BRIEFS = [
      { name: "Damp specialist",
        sum: "Buyers 55+ &middot; arrive by recommendation &middot; the fear is mess",
        v: { zI: "#2E2A25", zA: "#B4622D", zP: "#FAF6F0", zS: "1.08" },
        kick: "Marches Damp &amp; Timber &middot; est. 1998",
        h: "Damp coming through? We&rsquo;ll find where &mdash; and fix it tidily.",
        sub: "Surveyed by the owner, not a salesman. Dust sheets as standard.",
        cta: "Book the owner&rsquo;s visit",
        proof: { chips: ["Trade-body registered", "25 years local", "Owner answers the phone"] },
        log: [
          ["demographics", "Base type up, contrast up &mdash; 55+ eyes reading on phones."],
          ["customer language", "&ldquo;Damp coming through&rdquo;, never &ldquo;moisture ingress&rdquo; &mdash; the headline is the phone call."],
          ["objections", "&ldquo;Tidily&rdquo; and dust sheets lead, because mess is the fear that loses the job."],
          ["competitor scan", "Every rival is blue and corporate &mdash; clay and cream owns the local results page."]
        ] },
      { name: "Wedding florist",
        sum: "Couples 25&ndash;35 &middot; found on Instagram &middot; browsing at 11pm on a phone",
        v: { zI: "#43333B", zA: "#C26A77", zP: "#FBF4F2", zS: ".97" },
        kick: "Foxglove &amp; Fern &middot; seasonal flowers",
        h: "Flowers that feel like the two of you.",
        sub: "Grown close to home, arranged the week of the day.",
        cta: "Check your date",
        proof: { gallery: true },
        log: [
          ["demographics", "Thumb-first layout, gallery before words &mdash; the decision happens at 11pm on a phone."],
          ["route to market", "Instagram sends them, so the page continues the grid rather than opening a brochure."],
          ["customer language", "&ldquo;Your date&rdquo;, &ldquo;the day&rdquo; &mdash; the words couples actually use."],
          ["objections", "Price anxiety is quiet but real &mdash; &ldquo;from&rdquo; ranges appear before they must ask."]
        ] },
      { name: "Commercial cleaning",
        sum: "Facilities managers &middot; procurement-led &middot; risk is the whole conversation",
        v: { zI: "#16232E", zA: "#145C8E", zP: "#F4F6F8", zS: ".93" },
        kick: "Bridgnorth Contract Cleaning &middot; B2B",
        h: "Compliance-clean. Audit-ready. Every visit logged.",
        sub: "Method statements, vetted staff and a named account manager.",
        cta: "Request the compliance pack",
        proof: { chips: ["Insured &pound;10m", "Staff vetted &amp; uniformed", "RAMS on request"] },
        log: [
          ["demographics", "Denser layout, smaller type &mdash; read at a desk, printed for a tender file."],
          ["route to market", "Procurement finds them: documents beat photographs here."],
          ["customer language", "&ldquo;RAMS&rdquo;, &ldquo;audit-ready&rdquo; &mdash; jargon is correct for once; these buyers speak it."],
          ["competitor scan", "And here blue IS the right call &mdash; the research says corporate, so corporate it is."]
        ] }
    ];

    var tabs = dz.querySelector(".dz-briefs");
    var mini = dz.querySelector(".dz-mini");
    var log = dz.querySelector(".dz-log");

    BRIEFS.forEach(function (b, i) {
      var t = document.createElement("button");
      t.type = "button";
      t.className = "dz-tab";
      t.setAttribute("role", "tab");
      t.setAttribute("aria-selected", i === 0 ? "true" : "false");
      t.tabIndex = i === 0 ? 0 : -1;
      t.innerHTML = "<b>" + b.name + "</b><span>" + b.sum + "</span>";
      t.addEventListener("click", function () { show(i); });
      tabs.appendChild(t);
    });
    tabs.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") { return; }
      e.preventDefault();
      var all = [].slice.call(tabs.children);
      var cur = all.indexOf(document.activeElement);
      var next = (cur + (e.key === "ArrowRight" ? 1 : all.length - 1)) % all.length;
      all[next].focus();
      show(next);
    });

    function show(i) {
      var b = BRIEFS[i];
      [].forEach.call(tabs.children, function (t, k) {
        t.setAttribute("aria-selected", k === i ? "true" : "false");
        t.tabIndex = k === i ? 0 : -1;
      });
      Object.keys(b.v).forEach(function (k) {
        mini.style.setProperty("--" + k, b.v[k]);
      });
      var proof = b.proof.gallery
        ? '<div class="dz-gallery"><i></i><i></i><i></i></div>'
        : '<ul class="dz-proof"><li>' + b.proof.chips.join("</li><li>") + "</li></ul>";
      mini.innerHTML = '<p class="dz-kick">' + b.kick + '</p>'
        + '<p class="dz-h">' + b.h + '</p>'
        + '<p class="dz-sub">' + b.sub + '</p>'
        + '<span class="dz-cta">' + b.cta + "</span>" + proof;
      log.innerHTML = "<h3>What the research changed</h3><ul>"
        + b.log.map(function (l) {
            return '<li><span class="dz-src">' + l[0] + "</span><p>" + l[1] + "</p></li>";
          }).join("") + "</ul>";
      mini.classList.remove("switching");
      void mini.offsetWidth;
      mini.classList.add("switching");
    }
    show(0);
  }

  /* ---- feature deck (web design page) --------------------------------
     Scroll-snap carries the carousel; buttons, dots and arrow keys are
     conveniences layered on native scrolling. Each slide's demo is wired
     here, guarded so a missing slide costs nothing. */
  var deck = document.getElementById("wd-deck");
  if (deck) {
    var track = deck.querySelector(".deck-track");
    var slides = [].slice.call(track.children);
    var dots = deck.querySelector(".deck-dots");
    slides.forEach(function (sl, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Go to demonstration " + (i + 1));
      if (i === 0) { b.setAttribute("aria-current", "true"); }
      b.addEventListener("click", function () {
        track.scrollTo({ left: sl.offsetLeft, behavior: reduce ? "auto" : "smooth" });
      });
      dots.appendChild(b);
    });
    var watcher = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          var i = slides.indexOf(en.target);
          [].forEach.call(dots.children, function (d, k) {
            if (k === i) { d.setAttribute("aria-current", "true"); }
            else { d.removeAttribute("aria-current"); }
          });
        }
      });
    }, { root: track, threshold: 0.6 });
    slides.forEach(function (sl) { watcher.observe(sl); });

    [].forEach.call(deck.querySelectorAll(".deck-btn"), function (b) {
      b.addEventListener("click", function () {
        track.scrollBy({ left: track.clientWidth * +b.getAttribute("data-dir"),
                         behavior: reduce ? "auto" : "smooth" });
      });
    });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        track.scrollBy({ left: track.clientWidth * (e.key === "ArrowRight" ? 1 : -1),
                         behavior: reduce ? "auto" : "smooth" });
      }
    });

    /* slide 1: replay the staged entrance */
    var stagey = deck.querySelector(".dk-stagey");
    var replay = deck.querySelector(".dk-replay");
    if (replay) {
      replay.addEventListener("click", function () {
        stagey.classList.remove("is-play");
        void stagey.offsetWidth;             /* reflow restarts the animations */
        stagey.classList.add("is-play");
      });
    }

    /* slide 2: magnetic button + pointer tilt */
    var mag = deck.querySelector(".dk-mag");
    if (mag && !reduce) {
      mag.addEventListener("pointermove", function (e) {
        var r = mag.getBoundingClientRect();
        mag.style.transform = "translate("
          + (e.clientX - r.left - r.width / 2) * 0.25 + "px,"
          + (e.clientY - r.top - r.height / 2) * 0.35 + "px)";
      });
      mag.addEventListener("pointerleave", function () { mag.style.transform = ""; });
    }
    var tiltCard = deck.querySelector(".dk-tilt");
    if (tiltCard && !reduce) {
      tiltCard.addEventListener("pointermove", function (e) {
        var r = tiltCard.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        tiltCard.style.transform = "perspective(500px) rotateY(" + (x * 14).toFixed(1)
          + "deg) rotateX(" + (-y * 12).toFixed(1) + "deg)";
      });
      tiltCard.addEventListener("pointerleave", function () { tiltCard.style.transform = ""; });
    }

    /* slide 3: the badge reads the visitor's clock against trading hours */
    var openEl = document.getElementById("dk-open");
    if (openEl) {
      var HOURS = { 1: [7, 15], 2: [7, 15], 3: [7, 15], 4: [7, 15], 5: [7, 15], 6: [7, 15] };
      var DAYN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var two = function (n) { return (n < 10 ? "0" : "") + n; };
      var tick = function () {
        var now = new Date();
        var d = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
        var h = HOURS[d];
        var state = openEl.querySelector(".dk-state b");
        var when = openEl.querySelector(".dk-when");
        if (h && mins >= h[0] * 60 && mins < h[1] * 60) {
          var left = h[1] * 60 - mins;
          openEl.classList.remove("shut");
          state.textContent = "Open now";
          when.textContent = "Closes " + two(h[1]) + ":00 \u2014 in "
            + (left >= 60 ? Math.floor(left / 60) + "h " : "") + (left % 60) + "m";
        } else {
          var day = d, hop = 0;
          while (hop < 8 && (!HOURS[day] || (hop === 0 && mins >= HOURS[day][1] * 60))) {
            day = (day + 1) % 7; hop++;
          }
          openEl.classList.add("shut");
          state.textContent = "Closed";
          when.textContent = "Opens " + (hop === 0 ? "today" : DAYN[day]) + " at "
            + two(HOURS[day][0]) + ":00";
        }
      };
      tick();
      setInterval(tick, 30000);
    }

    /* slide 4: swap the example's tokens */
    [].forEach.call(deck.querySelectorAll(".dk-swatches button"), function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-t").split(",");
        var th = deck.querySelector(".dk-theme");
        th.style.setProperty("--tA", t[0]);
        th.style.setProperty("--tB", t[1]);
        th.style.setProperty("--tP", t[2]);
      });
    });
  }

  /* ---- mini scheduler: the board that argues back (custom software) ----
     A deliberately tiny model of the real tool's one idea: state, rules,
     and a sentence the moment a rule is broken. Two ways to move a job -
     pointer drag, or select-then-place, which also covers keyboard and
     touch. Rendering rebuilds the board from state every time; the DOM is
     never the source of truth. */
  var sched = document.getElementById("sched");
  if (sched) {
    var DAY_N = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    var DAY_S = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    var CAP = 2;
    var SEED = [
      { id: "a", name: "Oak staircase", stage: "machining", cls: "",        due: 2,    day: 0 },
      { id: "b", name: "Sash windows",  stage: "assembly",  cls: "job--b",  due: 4,    day: 1 },
      { id: "c", name: "Kitchen fit",   stage: "finishing", cls: "job--c",  due: null, day: 1 },
      { id: "d", name: "Door set",      stage: "spraying",  cls: "job--d",  due: 3,    day: 2 }
    ];
    var board = sched.querySelector(".sched-board");
    var status = sched.querySelector(".sched-status");
    var jobs, selected = null;

    function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

    function render() {
      var html = "";
      for (var d = 0; d < 5; d++) {
        var here = jobs.filter(function (jb) { return jb.day === d; });
        var over = here.length > CAP;
        html += '<div class="sched-day' + (over ? " conflict" : "")
              + '" data-day="' + d + '"><h3>' + DAY_S[d]
              + '<span class="flag">over</span></h3><div class="sched-slots">';
        here.forEach(function (jb) {
          var late = jb.due !== null && jb.day > jb.due;
          html += '<button type="button" class="job ' + jb.cls
                + (late ? " late" : "") + '" data-job="' + jb.id
                + '" aria-label="' + esc(jb.name) + ", " + jb.stage
                + (jb.due !== null ? ", due " + DAY_N[jb.due] : "")
                + (late ? ", LATE" : "") + '. Press to pick up.">'
                + esc(jb.name) + "<small>" + jb.stage
                + (jb.due !== null ? " &middot; due " + DAY_S[jb.due] : "")
                + "</small></button>";
        });
        for (var g = here.length; g < CAP; g++) { html += '<div class="slot-ghost"></div>'; }
        html += "</div></div>";
      }
      board.innerHTML = html;
      verdict();
    }

    function verdict() {
      var msgs = [], cls = "";
      jobs.forEach(function (jb) {
        if (jb.due !== null && jb.day > jb.due) {
          msgs.push("<b>" + esc(jb.name) + "</b> now lands " + DAY_N[jb.day]
                  + " but is due " + DAY_N[jb.due]
                  + ". The real tool flags this the moment you let go &mdash; not on delivery day.");
          cls = "bad";
        }
      });
      for (var d = 0; d < 5; d++) {
        var n = jobs.filter(function (jb) { return jb.day === d; }).length;
        if (n > CAP) {
          msgs.push("<b>" + DAY_N[d] + "</b> has " + n
                  + " jobs and two benches. Something on that list isn't getting done.");
          if (!cls) { cls = "warn"; }
        }
      }
      if (!msgs.length) {
        msgs.push(selected
          ? "Now tap a day to move <b>" + esc(selected.name) + "</b>."
          : "Four jobs, two benches a day, no conflicts. Try dragging <b>Oak staircase</b> to Thursday.");
      }
      status.className = "sched-status" + (cls ? " " + cls : "");
      status.innerHTML = msgs.join(" ");
      if (selected) {
        [].forEach.call(board.querySelectorAll(".sched-day"), function (el) {
          el.classList.add("target");
        });
        var el = board.querySelector('[data-job="' + selected.id + '"]');
        if (el) { el.classList.add("sel"); }
      }
    }

    function jobById(id) {
      return jobs.filter(function (jb) { return jb.id === id; })[0];
    }
    function move(jb, day) { jb.day = day; selected = null; render(); }

    /* select-then-place: click a job, click a day */
    board.addEventListener("click", function (e) {
      var jEl = e.target.closest(".job");
      var dEl = e.target.closest(".sched-day");
      if (jEl && !dragged) {
        selected = (selected && selected.id === jEl.getAttribute("data-job"))
          ? null : jobById(jEl.getAttribute("data-job"));
        render();
      } else if (dEl && selected) {
        move(selected, +dEl.getAttribute("data-day"));
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && selected) { selected = null; render(); }
    });

    /* pointer drag: a fixed-position ghost follows the pointer; columns are
       hit-tested underneath it */
    var dragged = null, ghost = null, sx = 0, sy = 0;
    board.addEventListener("pointerdown", function (e) {
      var jEl = e.target.closest(".job");
      if (!jEl) { return; }
      dragged = null; sx = e.clientX; sy = e.clientY;
      var id = jEl.getAttribute("data-job");
      var onMove = function (ev) {
        if (!dragged && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 7) { return; }
        if (!dragged) {
          dragged = jobById(id);
          ghost = jEl.cloneNode(true);
          ghost.className += " job-drag";
          document.body.appendChild(ghost);
          jEl.classList.add("lift");
        }
        ghost.style.left = (ev.clientX - 70) + "px";
        ghost.style.top = (ev.clientY - 24) + "px";
        var under = document.elementFromPoint(ev.clientX, ev.clientY);
        [].forEach.call(board.querySelectorAll(".sched-day"), function (el) {
          el.classList.toggle("target", !!(under && el.contains(under)));
        });
      };
      var onUp = function (ev) {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        if (ghost) { ghost.remove(); ghost = null; }
        if (dragged) {
          var under = document.elementFromPoint(ev.clientX, ev.clientY);
          var dEl = under && under.closest(".sched-day");
          if (dEl) { move(dragged, +dEl.getAttribute("data-day")); }
          else { render(); }
          /* swallow the click that follows a drag */
          setTimeout(function () { dragged = null; }, 0);
        }
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });

    sched.querySelector(".sched-reset").addEventListener("click", function () {
      init();
    });
    function init() {
      jobs = SEED.map(function (jb) {
        return { id: jb.id, name: jb.name, stage: jb.stage, cls: jb.cls,
                 due: jb.due, day: jb.day };
      });
      selected = null;
      render();
    }
    init();
  }

  /* ---- SEO x-ray: flip the homepage replica to what Google reads ---- */
  var xray = document.getElementById("seo-xray");
  if (xray) {
    var xtog = xray.querySelector(".xr-toggle");
    var xlabel = xtog.querySelector("b");
    function xset(on) {
      xray.classList.toggle("is-on", on);
      xtog.setAttribute("aria-pressed", on ? "true" : "false");
      xlabel.textContent = on ? "Googlebot view" : "Visitor view";
      xray.querySelector(".xr-meta").setAttribute("aria-hidden", on ? "false" : "true");
    }
    xtog.addEventListener("click", function () {
      xset(!xray.classList.contains("is-on"));
    });
    var xnotes = [].slice.call(xray.querySelectorAll(".xr-note"));
    var xpins = [].slice.call(xray.querySelectorAll(".xr-pin"));
    xpins.forEach(function (pin) {
      pin.setAttribute("aria-expanded", "false");
      pin.addEventListener("click", function () {
        var id = pin.getAttribute("data-note");
        xset(true); /* the pins annotate the Googlebot layer, so reveal it */
        xpins.forEach(function (p) {
          p.setAttribute("aria-expanded", p === pin ? "true" : "false");
        });
        xnotes.forEach(function (n) {
          n.hidden = n.getAttribute("data-note") !== id;
        });
        /* the card sits above the exhibit; a pin low on the frame would
           otherwise update it out of view */
        var shown = xray.querySelector(".xr-note:not([hidden])");
        if (shown && shown.getBoundingClientRect().top < 0) {
          shown.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
        }
      });
    });
  }

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
      when.value.trim() ? "" : "When were you thinking?") && ok;
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
