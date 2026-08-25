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

  /* ---- live Monte Carlo (research page) -------------------------------
     A real simulation, seeded so identical inputs give identical answers.
     Fifty thousand trials of a hire-vs-buy decision: each draws demand,
     margin and upkeep from triangular distributions and computes months to
     pay back the machine. The histogram animates in batches so the visitor
     watches the distribution form; the verdict is a sentence, because the
     product of this service is an answer, not a chart. */
  var mc = document.getElementById("mc");
  if (mc) {
    var COST = 48000, OUT_MARGIN = 45, N = 50000, CAP = 60;
    var canvas = document.getElementById("mc-hist");
    var ctx = canvas.getContext("2d");
    var slider = document.getElementById("mc-demand");
    var paybacks, draws, run = 0;

    function rng(seed) {                       /* mulberry32 */
      return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    function tri(u, a, m, b) {                 /* inverse-CDF triangular */
      var f = (m - a) / (b - a);
      return u < f ? a + Math.sqrt(u * f) * (b - a)
                   : b - Math.sqrt((1 - u) * (1 - f)) * (b - a);
    }
    function quantile(sorted, q) {
      return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
    }
    function pearson(xs, ys) {
      var n = xs.length, sx = 0, sy = 0, sxy = 0, sx2 = 0, sy2 = 0, i;
      for (i = 0; i < n; i++) {
        sx += xs[i]; sy += ys[i]; sxy += xs[i] * ys[i];
        sx2 += xs[i] * xs[i]; sy2 += ys[i] * ys[i];
      }
      var d = Math.sqrt((n * sx2 - sx * sx) * (n * sy2 - sy * sy));
      return d === 0 ? 0 : (n * sxy - sx * sy) / d;
    }

    function simulate(mode) {
      var rand = rng(0xC0FFEE + mode);         /* seeded: same slider, same answer */
      paybacks = new Float64Array(N);
      draws = { demand: new Float64Array(N), margin: new Float64Array(N),
                upkeep: new Float64Array(N) };
      for (var i = 0; i < N; i++) {
        var dJobs = tri(rand(), 8, mode, 26);
        var dMarg = tri(rand(), 120, 180, 260) - OUT_MARGIN;
        var dKeep = tri(rand(), 300, 800, 2400) / 12;
        draws.demand[i] = dJobs; draws.margin[i] = dMarg; draws.upkeep[i] = dKeep;
        var gain = dJobs * dMarg - dKeep;
        paybacks[i] = Math.min(COST / gain, CAP);
      }
    }

    function draw(upTo) {
      var dpr = window.devicePixelRatio || 1;
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var BINS = 48, counts = new Array(BINS + 1).fill(0), i;
      for (i = 0; i < upTo; i++) {
        counts[Math.min(BINS, Math.floor(paybacks[i]))]++;
      }
      var max = Math.max.apply(null, counts) || 1;
      var pad = { l: 10, r: 10, t: 14, b: 22 };
      var bw = (w - pad.l - pad.r) / (BINS + 1);
      /* faint gridlines every 12 months */
      ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 1;
      ctx.fillStyle = "rgba(255,255,255,.45)";
      ctx.font = "10px ui-monospace,Menlo,monospace"; ctx.textAlign = "center";
      for (i = 12; i <= BINS; i += 12) {
        var gx = pad.l + i * bw;
        ctx.beginPath(); ctx.moveTo(gx, pad.t); ctx.lineTo(gx, h - pad.b); ctx.stroke();
        ctx.fillText(i + "mo", gx, h - 8);
      }
      for (i = 0; i <= BINS; i++) {
        if (!counts[i]) { continue; }
        var bh = (h - pad.t - pad.b) * counts[i] / max;
        ctx.fillStyle = i < 24 ? "#F5A623" : "rgba(255,255,255,.34)";
        ctx.fillRect(pad.l + i * bw + 1, h - pad.b - bh, Math.max(bw - 2, 1), bh);
      }
      /* the two-year line the verdict hangs on */
      var lx = pad.l + 24 * bw;
      ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(lx, pad.t - 4); ctx.lineTo(lx, h - pad.b); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.textAlign = "left";
      ctx.fillText("2 years", lx + 5, pad.t + 4);
    }

    function verdict() {
      var sorted = Float64Array.from(paybacks).sort();
      var within = 0, i;
      for (i = 0; i < N; i++) { if (paybacks[i] <= 24) { within++; } }
      var p24 = Math.round(100 * within / N);
      var med = Math.round(quantile(sorted, 0.5));
      var p10 = Math.round(quantile(sorted, 0.1));
      var p90 = Math.round(quantile(sorted, 0.9));
      var call = document.getElementById("mc-call");
      if (p24 >= 70) {
        call.innerHTML = "The model says <em>buy it</em> \u2014 " + p24
          + "% of futures pay it back inside two years.";
      } else if (p24 >= 45) {
        call.innerHTML = "The model says <em>genuinely marginal</em> \u2014 " + p24
          + "% of futures clear two years. This is where the research money goes next.";
      } else {
        call.innerHTML = "The model says <em>keep outsourcing</em> \u2014 only " + p24
          + "% of futures pay back inside two years.";
      }
      document.getElementById("mc-detail").innerHTML =
        "In the typical story it takes <b>" + med + " months</b> to earn the money back. "
        + "In 8 out of 10 stories it lands between <b>" + p10 + "</b> and <b>" + p90
        + " months</b>. That\u2019s the value of the method: not one number, but the odds.";

      /* sensitivity: which input actually moves the answer */
      var rs = [
        ["Jobs per month", Math.abs(pearson(draws.demand, paybacks))],
        ["Margin per job", Math.abs(pearson(draws.margin, paybacks))],
        ["Upkeep costs", Math.abs(pearson(draws.upkeep, paybacks))]
      ].sort(function (a, b) { return b[1] - a[1]; });
      var top = rs[0][1] || 1;
      document.getElementById("mc-bars").innerHTML = rs.map(function (r) {
        return '<div class="mc-bar"><span>' + r[0] + '</span><i style="width:'
          + Math.round(100 * r[1] / top) + '%"></i><b>r=' + r[1].toFixed(2) + "</b></div>";
      }).join("");
      var ratio = (rs[0][1] / Math.max(rs[2][1], 0.01)).toFixed(0);
      document.getElementById("mc-read").innerHTML =
        "<b>" + rs[0][0] + "</b> carries roughly " + ratio + "\u00D7 the weight of "
        + rs[2][0].toLowerCase() + " \u2014 so before anyone spends \u00A348,000, the "
        + "research budget goes into pinning down " + rs[0][0].toLowerCase()
        + ", not a maintenance appraisal.";
    }

    function runSim() {
      var mode = +slider.value;
      var stamp = ++run;                      /* invalidates any older animation */
      document.getElementById("mc-demand-v").textContent = mode;
      mc.querySelector("[data-mode]").textContent = mode;
      simulate(mode);
      var nEl = document.getElementById("mc-n");
      if (reduce) {
        draw(N); nEl.textContent = N.toLocaleString(); verdict(); return;
      }
      var shown = 0;
      (function step() {
        if (stamp !== run) { return; }
        shown = Math.min(shown + 2500, N);
        draw(shown);
        nEl.textContent = shown.toLocaleString();
        if (shown < N) { requestAnimationFrame(step); }
        else { verdict(); }
      })();
    }

    var mcT;
    slider.addEventListener("input", function () {
      clearTimeout(mcT); mcT = setTimeout(runSim, 120);
    });
    window.addEventListener("resize", function () {
      if (paybacks) { draw(N); }
    });
    runSim();
  }

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

  /* ---- homepage vignettes: play once on reveal, replay on hover ------ */
  var vigs = document.getElementById("vigs");
  if (vigs && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("go");
          vio.unobserve(en.target);
        }
      });
    }, { threshold: 0.45 });
    [].forEach.call(vigs.children, function (tile) {
      vio.observe(tile);
      tile.addEventListener("mouseenter", function () {
        if (reduce) { return; }
        tile.classList.remove("go");
        void tile.offsetWidth;
        tile.classList.add("go");
      });
    });
  } else if (vigs) {
    [].forEach.call(vigs.children, function (t) { t.classList.add("go"); });
  }

  /* ---- capability index (custom software page) ------------------------
     An expander rather than a grid, because the entries run from one line
     to a paragraph and equal-height cards cannot absorb that. Rows stay
     uniform when closed, so nothing depends on how much there is to say.
     The hidden attribute is removed on open and restored on close, so the
     panel is genuinely out of the tree for assistive tech, not just short. */
  var ix = document.getElementById("ix");
  if (ix) {
    var heads = [].slice.call(ix.querySelectorAll(".ix-head"));
    heads.forEach(function (h) {
      var item = h.parentNode;
      var body = item.querySelector(".ix-body");
      if (h.getAttribute("aria-expanded") === "true") { item.classList.add("open"); }
      h.addEventListener("click", function () {
        var open = h.getAttribute("aria-expanded") === "true";
        if (open) {
          h.setAttribute("aria-expanded", "false");
          item.classList.remove("open");
          setTimeout(function () {
            if (h.getAttribute("aria-expanded") === "false") { body.hidden = true; }
          }, reduce ? 0 : 320);
        } else {
          body.hidden = false;
          void body.offsetWidth;               /* let the row height animate from 0 */
          h.setAttribute("aria-expanded", "true");
          item.classList.add("open");
        }
      });
    });
  }

  /* ---- resource planner (custom software page) ------------------------
     A small but real planning tool: people and machines as rows, days as
     columns, jobs as hour-blocks planned against capacity. Deadlines,
     skills and absences all feed one issues panel that objects in plain
     English. Everything renders from a single state object - the same
     discipline as the production builds - and nothing persists, because
     this is the demonstration, not the product. */
  var ops = document.getElementById("ops");
  if (ops) {
    var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    var DAYN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    var SKILLN = { saw: "sawing", cnc: "the CNC", spray: "spraying",
                   veneer: "veneering", fit: "fitting" };
    var RES = [
      { id: "ai", name: "Aisha", role: "Fabrication", cap: 8, skills: ["saw", "cnc"] },
      { id: "dn", name: "Dan", role: "Fitting", cap: 8, skills: ["fit", "saw"] },
      { id: "pr", name: "Priya", role: "Finishing \u00b7 part-time", cap: 6, skills: ["spray", "veneer"] },
      { id: "mc", name: "CNC bed", role: "Machine", cap: 10, skills: ["cnc"], machine: true }
    ];
    /* five scenarios, each staging one feature of the tool */
    var PRESETS = [
      { key: "clean", label: "1 \u00b7 A clean week",
        cap: "Everything fits. Read the meters: Priya's part-time six-hour days, the CNC bed's ten, and the utilisation bar under each name. <b>Try:</b> drag any job and watch the hours rebalance.",
        absent: {},
        tasks: [
          ["Caf\u00e9 counter carcass", 6, 3, "saw", "ai", 0, ""],
          ["Panel batch \u2014 school", 8, 2, "cnc", "mc", 0, "t-b"],
          ["Site fit \u2014 dental rooms", 7, 4, "fit", "dn", 1, "t-c"],
          ["Spray \u2014 32 doors", 5, 3, "spray", "pr", 1, "t-d"],
          ["Veneer repair bench", 4, 4, "veneer", "pr", 3, "t-e"],
          ["Cut list \u2014 wardrobes", 5, 4, "saw", "ai", 2, "t-b"]
        ] },
      { key: "over", label: "2 \u00b7 Overbooked Tuesday",
        cap: "Tuesday doesn't fit \u2014 Aisha is planned for 11 hours of an 8-hour day, and the cell says so. <b>Try:</b> drag one of her Tuesday jobs to Wednesday and watch the flag clear.",
        absent: {},
        tasks: [
          ["Caf\u00e9 counter carcass", 6, 3, "saw", "ai", 1, ""],
          ["Cut list \u2014 wardrobes", 5, 3, "saw", "ai", 1, "t-b"],
          ["Panel batch \u2014 school", 8, 2, "cnc", "mc", 1, "t-c"],
          ["Site fit \u2014 dental rooms", 7, 4, "fit", "dn", 2, "t-d"],
          ["Spray \u2014 32 doors", 5, 4, "spray", "pr", 3, "t-e"]
        ] },
      { key: "late", label: "3 \u00b7 Deadline crunch",
        cap: "The school panels are due Wednesday but planned for Friday \u2014 the job has turned red and the panel below explains why. <b>Try:</b> move it to the CNC bed's Tuesday, which is standing idle.",
        absent: {},
        tasks: [
          ["Panel batch \u2014 school", 8, 2, "cnc", "mc", 4, ""],
          ["Caf\u00e9 counter carcass", 6, 4, "saw", "ai", 1, "t-b"],
          ["Site fit \u2014 dental rooms", 7, 4, "fit", "dn", 2, "t-c"],
          ["Spray \u2014 32 doors", 5, 4, "spray", "pr", 2, "t-d"]
        ] },
      { key: "skill", label: "4 \u00b7 Wrong hands",
        cap: "The chairs need spraying and Dan has never held the gun \u2014 the tool knows who can do what. <b>Try:</b> move the job to Priya, the only sprayer in the shop.",
        absent: {},
        tasks: [
          ["Spray \u2014 caf\u00e9 chairs", 5, 3, "spray", "dn", 1, ""],
          ["Caf\u00e9 counter carcass", 6, 3, "saw", "ai", 1, "t-b"],
          ["Panel batch \u2014 school", 8, 3, "cnc", "mc", 2, "t-c"],
          ["Veneer repair bench", 4, 4, "veneer", "pr", 3, "t-d"]
        ] },
      { key: "sick", label: "5 \u00b7 Priya's off sick",
        cap: "Priya is out on Wednesday \u2014 her capacity is zero and her spray job is now homeless hours. <b>Try:</b> move it to her Thursday, or see what happens if you give it to Dan instead.",
        absent: { "pr-2": true },
        tasks: [
          ["Spray \u2014 32 doors", 5, 3, "spray", "pr", 2, ""],
          ["Veneer repair bench", 4, 4, "veneer", "pr", 3, "t-b"],
          ["Caf\u00e9 counter carcass", 6, 3, "saw", "ai", 1, "t-c"],
          ["Panel batch \u2014 school", 8, 3, "cnc", "mc", 1, "t-d"],
          ["Site fit \u2014 dental rooms", 7, 4, "fit", "dn", 2, "t-e"]
        ] }
    ];

    var grid = document.getElementById("ops-grid");
    var tray = document.getElementById("ops-tray");
    var issues = document.getElementById("ops-issues");
    var caption = document.getElementById("ops-caption");
    var state, sel = null, nextId = 1, dragging = null;

    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function resById(id) {
      return RES.filter(function (r) { return r.id === id; })[0];
    }
    function taskById(id) {
      return state.tasks.filter(function (t) { return t.id === id; })[0];
    }
    function cap(r, d) { return state.absent[r.id + "-" + d] ? 0 : r.cap; }
    function used(r, d) {
      return state.tasks.reduce(function (n, t) {
        return n + (t.r === r.id && t.d === d ? t.hrs : 0);
      }, 0);
    }

    function loadPreset(i) {
      var p = PRESETS[i];
      state = { preset: i, absent: p.absent, tasks: p.tasks.map(function (t) {
        return { id: "t" + nextId++, name: t[0], hrs: t[1], due: t[2],
                 skill: t[3], r: t[4], d: t[5], cls: t[6] };
      }) };
      sel = null;
      caption.innerHTML = p.cap;
      [].forEach.call(ops.querySelectorAll(".ops-preset"), function (b, k) {
        b.setAttribute("aria-pressed", k === i ? "true" : "false");
      });
      render();
    }

    /* ---------- the rules: everything the plan can be wrong about ------- */
    function problems() {
      var out = [];
      state.tasks.forEach(function (t) {
        if (!t.r) { return; }
        var r = resById(t.r);
        if (t.d > t.due) {
          out.push(["bad", "<b>" + esc(t.name) + "</b> is planned for " + DAYN[t.d]
            + " but due " + DAYN[t.due] + ". In the real tool this flags the moment you let go."]);
        }
        if (t.skill && r.skills.indexOf(t.skill) === -1) {
          out.push(["bad", "<b>" + esc(t.name) + "</b> needs " + SKILLN[t.skill] + " and <b>"
            + r.name + "</b> " + (r.machine ? "is a machine" : "isn't trained for it") + ". "
            + (RES.filter(function (x) { return x.skills.indexOf(t.skill) > -1; })
                 .map(function (x) { return x.name; }).join(" or ") || "Nobody here")
            + " can do it."]);
        }
      });
      RES.forEach(function (r) {
        for (var d = 0; d < 5; d++) {
          var u = used(r, d), cp = cap(r, d);
          if (u > cp) {
            out.push(["bad", "<b>" + r.name + "</b> has " + u + "h planned on " + DAYN[d]
              + (cp === 0 ? " \u2014 and is off that day. Those hours need a new home."
                          : " against a " + cp + "h day. Something slips.")]);
          }
        }
      });
      var loose = state.tasks.filter(function (t) { return !t.r; });
      if (loose.length) {
        out.push(["warn", loose.length + " job" + (loose.length > 1 ? "s" : "") + " ("
          + loose.reduce(function (n, t) { return n + t.hrs; }, 0)
          + "h) still in the backlog, waiting for a home."]);
      }
      return out;
    }

    /* ---------- render: state in, DOM out ------------------------------- */
    function render() {
      var html = '<div class="ops-hcell">Week 34</div>';
      DAYS.forEach(function (d) { html += '<div class="ops-hcell">' + d + "</div>"; });
      RES.forEach(function (r) {
        var tot = 0, capTot = 0, d;
        for (d = 0; d < 5; d++) { tot += used(r, d); capTot += cap(r, d); }
        var pct = capTot ? Math.round(100 * tot / capTot) : 0;
        html += '<div class="ops-res"><b>' + r.name + "</b><small>" + r.role
          + " \u00b7 " + (r.skills.map(function (k) { return SKILLN[k]; }).join(", "))
          + '</small><div class="ops-util' + (pct > 100 ? " hot" : "") + '"><i style="width:'
          + Math.min(pct, 100) + '%"></i></div><span class="pct">' + tot + "h / "
          + capTot + "h \u00b7 " + pct + "%</span></div>";
        for (d = 0; d < 5; d++) {
          var u = used(r, d), cp = cap(r, d), off = cp === 0;
          html += '<div class="ops-cell' + (u > cp ? " over" : "") + (off ? " off" : "")
            + '" data-r="' + r.id + '" data-d="' + d + '" tabindex="0" role="button" aria-label="'
            + r.name + ", " + DAYN[d] + ": " + u + " of " + cp + ' hours planned">'
            + '<span class="ops-load">' + (off ? '<span class="ops-off-chip">OFF</span>'
              : "<b>" + u + "h</b>/" + cp + "h") + "</span>";
          state.tasks.forEach(function (t) {
            if (t.r !== r.id || t.d !== d) { return; }
            var bad = t.d > t.due || (t.skill && r.skills.indexOf(t.skill) === -1);
            html += taskHtml(t, bad);
          });
          html += "</div>";
        }
      });
      grid.innerHTML = html;

      var loose = state.tasks.filter(function (t) { return !t.r; });
      tray.innerHTML = '<span class="ops-tray-h">Backlog</span>'
        + (loose.length ? loose.map(function (t) { return taskHtml(t, false); }).join("")
                        : '<span class="ops-tray-empty">empty \u2014 everything has a home</span>');

      var ps = problems();
      var msg = ps.map(function (p) {
        return '<p class="i-' + p[0] + '">' + p[1] + "</p>";
      }).join("");
      if (!ps.length) {
        msg = '<p class="i-ok">Nothing to argue about: every job fits its day, its deadline and its person.</p>';
      }
      if (sel) {
        var t = taskById(sel);
        if (t) {
          msg += '<p class="i-sel">Selected: <b>' + esc(t.name) + "</b> \u00b7 " + t.hrs
            + "h \u00b7 due " + DAYN[t.due] + (t.skill ? " \u00b7 needs " + SKILLN[t.skill] : "")
            + ". Tap a cell to place it.<button type='button' data-unassign>To backlog</button>"
            + "<button type='button' data-delete>Delete</button></p>";
          var el = ops.querySelector('[data-task="' + sel + '"]');
          if (el) { el.classList.add("sel"); }
          [].forEach.call(grid.querySelectorAll(".ops-cell"), function (cell) {
            cell.classList.add("tgt");
          });
        }
      }
      issues.innerHTML = msg;
    }
    function taskHtml(t, bad) {
      return '<button type="button" class="ops-task ' + t.cls + (bad ? " bad" : "")
        + '" data-task="' + t.id + '" aria-label="' + esc(t.name) + ", " + t.hrs
        + " hours, due " + DAYN[t.due] + '. Press to pick up.">' + esc(t.name)
        + "<small>" + t.hrs + "h \u00b7 due " + DAYS[t.due]
        + (t.skill ? " \u00b7 " + SKILLN[t.skill] : "") + "</small></button>";
    }

    /* ---------- moving jobs: select-then-place, and pointer drag -------- */
    function place(t, rid, d) { t.r = rid; t.d = d; sel = null; render(); }
    ops.addEventListener("click", function (e) {
      if (e.target.closest("[data-unassign]")) {
        var t1 = taskById(sel); if (t1) { t1.r = null; } sel = null; render(); return;
      }
      if (e.target.closest("[data-delete]")) {
        state.tasks = state.tasks.filter(function (t) { return t.id !== sel; });
        sel = null; render(); return;
      }
      var tEl = e.target.closest(".ops-task");
      var cEl = e.target.closest(".ops-cell");
      if (tEl && !dragging) {
        var id = tEl.getAttribute("data-task");
        sel = sel === id ? null : id;
        render();
      } else if (cEl && sel) {
        place(taskById(sel), cEl.getAttribute("data-r"), +cEl.getAttribute("data-d"));
      }
    });
    ops.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sel) { sel = null; render(); }
      if ((e.key === "Enter" || e.key === " ") && sel) {
        var cEl = e.target.closest && e.target.closest(".ops-cell");
        if (cEl) { e.preventDefault(); place(taskById(sel), cEl.getAttribute("data-r"), +cEl.getAttribute("data-d")); }
      }
    });
    ops.addEventListener("pointerdown", function (e) {
      var tEl = e.target.closest(".ops-task");
      if (!tEl) { return; }
      var id = tEl.getAttribute("data-task"), sx = e.clientX, sy = e.clientY, ghost = null;
      dragging = null;
      var onMove = function (ev) {
        if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 7) { return; }
        if (!dragging) {
          dragging = id;
          ghost = tEl.cloneNode(true);
          ghost.className += " ops-drag";
          document.body.appendChild(ghost);
          tEl.classList.add("lift");
        }
        ghost.style.left = (ev.clientX - 75) + "px";
        ghost.style.top = (ev.clientY - 20) + "px";
        var under = document.elementFromPoint(ev.clientX, ev.clientY);
        [].forEach.call(grid.querySelectorAll(".ops-cell"), function (cell) {
          cell.classList.toggle("tgt", !!(under && cell.contains(under)));
        });
      };
      var onUp = function (ev) {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        if (ghost) { ghost.remove(); }
        if (dragging) {
          var under = document.elementFromPoint(ev.clientX, ev.clientY);
          var cEl = under && under.closest(".ops-cell");
          var tr = under && under.closest(".ops-tray");
          var t = taskById(dragging);
          if (cEl) { place(t, cEl.getAttribute("data-r"), +cEl.getAttribute("data-d")); }
          else if (tr) { t.r = null; sel = null; render(); }
          else { render(); }
          setTimeout(function () { dragging = null; }, 0);
        }
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });

    /* ---------- add-a-job form ------------------------------------------ */
    var addForm = document.getElementById("ops-add");
    var dueSel = document.getElementById("ops-add-due");
    DAYN.forEach(function (d, i) {
      var o = document.createElement("option");
      o.value = i; o.textContent = d;
      if (i === 3) { o.selected = true; }
      dueSel.appendChild(o);
    });
    document.getElementById("ops-add-toggle").addEventListener("click", function () {
      addForm.hidden = !addForm.hidden;
      if (!addForm.hidden) { document.getElementById("ops-add-name").focus(); }
    });
    addForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("ops-add-name").value.trim() || "New job";
      var hrs = Math.max(1, Math.min(16, +document.getElementById("ops-add-hrs").value || 4));
      state.tasks.push({ id: "t" + nextId++, name: name, hrs: hrs,
        due: +dueSel.value, skill: document.getElementById("ops-add-skill").value,
        r: null, d: 0, cls: ["", "t-b", "t-c", "t-d", "t-e"][nextId % 5] });
      document.getElementById("ops-add-name").value = "";
      render();
    });

    /* ---------- full screen, with an overlay fallback for iOS ----------- */
    var fullBtn = document.getElementById("ops-full");
    function fsOn() { return document.fullscreenElement === ops || ops.classList.contains("ops--max"); }
    function fsLabel() { fullBtn.innerHTML = fsOn() ? "\u2715 Exit full screen" : "\u26F6 Full screen"; }
    fullBtn.addEventListener("click", function () {
      if (fsOn()) {
        if (document.fullscreenElement) { document.exitFullscreen(); }
        ops.classList.remove("ops--max");
        document.body.style.overflow = "";
      } else if (ops.requestFullscreen) {
        ops.requestFullscreen().catch(function () { ops.classList.add("ops--max"); });
      } else {
        ops.classList.add("ops--max");
        document.body.style.overflow = "hidden";
      }
      setTimeout(fsLabel, 120);
    });
    document.addEventListener("fullscreenchange", fsLabel);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ops.classList.contains("ops--max")) {
        ops.classList.remove("ops--max");
        document.body.style.overflow = "";
        fsLabel();
      }
    });

    /* ---------- presets + reset ----------------------------------------- */
    var presetsEl = ops.querySelector(".ops-presets");
    PRESETS.forEach(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ops-preset";
      b.setAttribute("aria-pressed", "false");
      b.textContent = p.label;
      b.addEventListener("click", function () { loadPreset(i); });
      presetsEl.appendChild(b);
    });
    document.getElementById("ops-reset").addEventListener("click", function () {
      loadPreset(state.preset);
    });
    loadPreset(0);
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

/* ---- groundwork: the document that writes itself ------------------------ */
(function () {
  "use strict";
  var doc = document.querySelector(".gw-doc");
  if (!doc) { return; }
  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var steps = document.querySelectorAll(".gw-step");
  /* Lines are visible by default. Only hide them when we know we can bring
     them back — the same contract as the reveal system above. */
  if (reduce || !steps.length || !("IntersectionObserver" in window)) { return; }
  doc.classList.add("gw-js");

  function write(n) {
    var batch = doc.querySelectorAll('[data-s="' + n + '"]:not(.is-writ)');
    batch.forEach(function (el, i) {
      el.style.transitionDelay = (i * 110) + "ms";
      el.classList.add("is-writ");
    });
  }
  /* Failsafe: if nothing has intersected within 2.5s, write everything. */
  var fired = false;
  window.setTimeout(function () {
    if (!fired) { write(1); write(2); write(3); }
  }, 2500);

  var io = new IntersectionObserver(function (entries) {
    fired = true;
    entries.forEach(function (en) {
      if (!en.isIntersecting) { return; }
      write(en.target.getAttribute("data-step"));
      io.unobserve(en.target);
    });
  }, { threshold: 0.35, rootMargin: "0px 0px -10% 0px" });
  steps.forEach(function (s) { io.observe(s); });
})();
