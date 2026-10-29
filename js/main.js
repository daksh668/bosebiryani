/* Sorry, Suzan — Mota Hathi's interactions */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const root = document.documentElement;
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Motion preference ---------- */
  const motionToggle = $("#motion-toggle");
  const osReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const storedCalm = localStorage.getItem("ellie:calm");
  let calm = storedCalm === null ? osReduced.matches : storedCalm === "1";
  const applyCalm = () => {
    root.classList.toggle("reduce-motion", calm);
    motionToggle.setAttribute("aria-pressed", String(calm));
    if (calm) $("#floaties").replaceChildren();
  };
  motionToggle.addEventListener("click", () => {
    calm = !calm;
    localStorage.setItem("ellie:calm", calm ? "1" : "0");
    applyCalm();
    announce(calm ? "Calm mode on. Animations reduced." : "Calm mode off.");
  });
  applyCalm();

  const announcer = $("#announcer");
  function announce(msg) {
    announcer.textContent = "";
    requestAnimationFrame(() => { announcer.textContent = msg; });
  }

  /* ---------- Clone Mota Hathi into every slot ---------- */
  const tpl = $("#elephant-tpl");
  $$(".elephant-slot").forEach((slot) => slot.appendChild(tpl.content.cloneNode(true)));

  /* ---------- Scenes / pager ---------- */
  const scenes = $$(".scene");
  const dotsList = $("#dots");
  const prevBtn = $("#prev");
  const nextBtn = $("#next");
  let current = 0;

  scenes.forEach((scene, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dot";
    b.setAttribute("aria-label", `Page ${i + 1} of ${scenes.length}: ${scene.dataset.title}`);
    b.addEventListener("click", () => goTo(i));
    li.appendChild(b);
    dotsList.appendChild(li);
  });
  const dots = $$(".dot", dotsList);

  function updatePager() {
    dots.forEach((d, i) => (i === current ? d.setAttribute("aria-current", "step") : d.removeAttribute("aria-current")));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === scenes.length - 1;
  }

  function goTo(index, { focus = true } = {}) {
    index = Math.max(0, Math.min(scenes.length - 1, index));
    if (index === current) return;
    const dir = index > current ? 1 : -1;
    scenes[current].hidden = true;
    scenes[current].classList.remove("is-entering");
    current = index;
    const scene = scenes[current];
    scene.style.setProperty("--dir", dir);
    scene.hidden = false;
    void scene.offsetWidth;
    scene.classList.add("is-entering");
    updatePager();
    history.replaceState(null, "", current === 0 ? location.pathname + location.search : `#${slug(scene.dataset.title)}`);
    window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
    if (focus) $(".title", scene)?.focus({ preventScroll: true });
    document.title = `${scene.dataset.title} · Sorry, Suzan 🐘`;
  }
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));
  $$("[data-next]").forEach((b) => b.addEventListener("click", () => goTo(current + 1)));
  $$("[data-goto]").forEach((el) =>
    el.addEventListener("click", (e) => { e.preventDefault(); goTo(Number(el.dataset.goto)); })
  );

  document.addEventListener("keydown", (e) => {
    if (document.querySelector("dialog[open]")) return;
    if (e.target.closest("input, textarea, [role='tablist']")) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowRight") goTo(current + 1);
    if (e.key === "ArrowLeft") goTo(current - 1);
  });

  // swipe between pages on touch screens
  let touchStart = null;
  const stage = $("#main");
  stage.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY, time: Date.now() };
  }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - touchStart.time < 700) {
      goTo(current + (dx < 0 ? 1 : -1));
    }
    touchStart = null;
  }, { passive: true });

  // deep link (#our-song etc.)
  const initial = scenes.findIndex((s) => `#${slug(s.dataset.title)}` === location.hash);
  updatePager();
  if (initial > 0) goTo(initial, { focus: false });
  window.addEventListener("hashchange", () => {
    const i = scenes.findIndex((s) => `#${slug(s.dataset.title)}` === location.hash);
    goTo(i < 0 ? 0 : i);
  });

  /* ---------- Dialog helpers ---------- */
  const supportsDialog = typeof HTMLDialogElement === "function" && "showModal" in HTMLDialogElement.prototype;
  function openDialog(dlg) {
    if (supportsDialog) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
  }
  function closeDialog(dlg) {
    if (supportsDialog) dlg.close(); else { dlg.removeAttribute("open"); dlg.dispatchEvent(new Event("close")); }
  }
  $$("dialog").forEach((dlg) => {
    $$("[data-close]", dlg).forEach((b) => b.addEventListener("click", () => closeDialog(dlg)));
    // click on backdrop closes
    dlg.addEventListener("click", (e) => { if (e.target === dlg && dlg.classList.contains("modal")) closeDialog(dlg); });
  });

  const shyDialog = $("#shy-dialog");
  $$("[data-action='shy']").forEach((b) => b.addEventListener("click", () => openDialog(shyDialog)));

  /* ---------- The HUG ---------- */
  const hugDialog = $("#hug-dialog");
  const hugCaption = $("#hug-caption");
  const hugBurst = $("#hug-burst");
  const hugCountEl = $("#hug-count");
  let hugs = Number(localStorage.getItem("ellie:hugs")) || 0;
  const hugLabel = $(".hug-count__label");
  const renderHugs = () => { hugCountEl.textContent = hugs; hugLabel.textContent = hugs === 1 ? "hug" : "hugs"; };
  renderHugs();
  let hugRun = 0;

  const hugLines = [
    "Sorry, mera hathi… squeeeeze! 🐘💗",
    "A big sorry hug for my teddy bear 🧸",
    "Bubu, you are so, so loved 💕",
    "Babu, no more sad faces — only hugs 🤍",
    "I'm sorry, baby. Trunk-wrapped & extra squishy 🥺💗",
    "Suzan, Mota Hathi never wants to let go 🌸",
  ];

  async function startHug() {
    const run = ++hugRun;
    if (shyDialog.open) closeDialog(shyDialog);
    hugDialog.classList.remove("is-open", "is-wrapping");
    hugBurst.replaceChildren();
    hugCaption.textContent = "Mota Hathi is coming in for a sorry hug…";
    openDialog(hugDialog);
    $("#hug-again").focus({ preventScroll: true });
    void hugDialog.offsetWidth;

    hugDialog.classList.add("is-open");           // approach + arms open wide
    await wait(calm ? 50 : 950);
    if (run !== hugRun) return;

    hugDialog.classList.add("is-wrapping");       // big squeeze
    hugCaption.textContent = pick(hugLines);
    if (!calm) {
      burst(hugBurst, 22);
      document.body.classList.remove("is-squeezed");
      void document.body.offsetWidth;
      document.body.classList.add("is-squeezed");
      if (navigator.vibrate) { try { navigator.vibrate([25, 70, 35]); } catch (_) {} }
    }
    hugs += 1;
    cheerUp();
    localStorage.setItem("ellie:hugs", String(hugs));
    renderHugs();
    const counter = hugCountEl.parentElement;
    counter.classList.remove("bump"); void counter.offsetWidth; counter.classList.add("bump");
  }

  function burst(container, n) {
    const icons = ["💗", "💕", "🤍", "✨", "💖", "🌸", "🫧"];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "burst";
      s.textContent = pick(icons);
      const angle = (Math.PI * 2 * i) / n + rand(-0.2, 0.2);
      const dist = rand(140, Math.min(window.innerWidth, 700) * 0.55);
      s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      s.style.setProperty("--dy", `${Math.sin(angle) * dist * 0.8 - 40}px`);
      s.style.setProperty("--spin", `${rand(-60, 60)}deg`);
      s.style.setProperty("--size", `${rand(1.2, 2.4)}rem`);
      s.style.animationDelay = `${rand(0, 0.25)}s`;
      s.addEventListener("animationend", () => s.remove());
      frag.appendChild(s);
    }
    container.appendChild(frag);
  }

  $$("[data-action='hug']").forEach((b) => b.addEventListener("click", startHug));
  $("#hug-again").addEventListener("click", startHug);
  hugDialog.addEventListener("close", () => {
    hugRun++;
    hugDialog.classList.remove("is-open", "is-wrapping");
    hugBurst.replaceChildren();
    document.body.classList.remove("is-squeezed");
  });

  /* ---------- Sorry Mota Hathi: sad until forgiven ---------- */
  const sorryEllie = $("#sorry-ellie");
  let forgiven = false;
  let boopTimer;
  function cheerUp() {
    if (forgiven) return;
    forgiven = true;
    clearTimeout(boopTimer);
    sorryEllie.dataset.pose = "wave";
    const hint = $(".scene--sorry .hint");
    if (hint) hint.textContent = "Mota Hathi is smiling again — thank you, Suzan 💗";
  }

  /* ---------- Rotating pet names ---------- */
  const nickEl = $("#nickname");
  const nicknames = ["mera hathi 🐘", "teddy bear 🧸", "bubu 💗", "babu 🌸", "baby 🥺"];
  let nickIndex = 0;
  setInterval(() => {
    if (document.hidden) return;
    nickIndex = (nickIndex + 1) % nicknames.length;
    if (calm) { nickEl.textContent = nicknames[nickIndex]; return; }
    nickEl.classList.add("is-out");
    setTimeout(() => { nickEl.textContent = nicknames[nickIndex]; nickEl.classList.remove("is-out"); }, 280);
  }, 2200);

  /* ---------- Boop: trunk sprays hearts ---------- */
  const boop = $(".boop");
  const boopLines = ["Boop! 💦", "Hehe, that tickles!", "Boop received 💗"];
  boop.addEventListener("click", () => {
    announce(pick(boopLines));
    if (!forgiven) {
      sorryEllie.dataset.pose = "wave";
      clearTimeout(boopTimer);
      boopTimer = setTimeout(() => { if (!forgiven) sorryEllie.dataset.pose = "sad"; }, 2200);
    }
    if (calm) return;
    for (let i = 0; i < 9; i++) {
      const s = document.createElement("span");
      s.className = "spray";
      s.setAttribute("aria-hidden", "true");
      s.textContent = pick(["💧", "💗", "🫧", "💕"]);
      s.style.setProperty("--dx", `${rand(10, 120)}px`);
      s.style.setProperty("--dy", `${rand(-170, -60)}px`);
      s.style.setProperty("--spin", `${rand(-90, 90)}deg`);
      s.style.animationDelay = `${i * 45}ms`;
      s.addEventListener("animationend", () => s.remove());
      boop.appendChild(s);
    }
  });

  /* ---------- Floating hearts in the background ---------- */
  const floaties = $("#floaties");
  const floatIcons = ["💗", "🤍", "🫧", "✨", "🌸", "💕", "🎈"];
  function spawnFloaty() {
    if (calm || document.hidden || floaties.childElementCount > 16) return;
    const s = document.createElement("span");
    s.className = "floaty";
    s.textContent = pick(floatIcons);
    s.style.setProperty("--x", `${rand(0, 100)}vw`);
    s.style.setProperty("--size", `${rand(0.9, 1.8)}rem`);
    s.style.setProperty("--dur", `${rand(10, 18)}s`);
    s.style.setProperty("--drift", `${rand(-80, 80)}px`);
    s.style.setProperty("--spin", `${rand(-40, 40)}deg`);
    s.addEventListener("animationend", () => s.remove());
    floaties.appendChild(s);
  }
  setInterval(spawnFloaty, 1100);

  /* ---------- Music tabs + click-to-load embeds ---------- */
  const tabs = $$("[role='tab']");
  function selectTab(tab) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute("aria-controls")}`).hidden = !on;
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next); next.focus(); }
    });
  });

  const isFileProtocol = location.protocol === "file:";
  $$(".embed").forEach((wrap) => {
    const btn = $(".embed__load", wrap);
    if (wrap.dataset.embed === "youtube" && isFileProtocol) {
      wrap.parentElement.querySelector(".embed__warn").hidden = false;
    }
    btn.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = wrap.dataset.src;
      iframe.title = wrap.dataset.title;
      iframe.loading = "lazy";
      iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      wrap.replaceChildren(iframe);
      iframe.focus();
    });
  });

  /* ---------- Add your own photos (local only) ---------- */
  const photoInput = $("#photo-input");
  const joys = $("#joys");
  photoInput.addEventListener("change", () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const li = document.createElement("li");
    li.className = "polaroid";
    li.style.setProperty("--tilt", `${rand(-4, 4).toFixed(1)}deg`);
    li.innerHTML = `
      <span class="polaroid__art"><img alt="Your photo" /></span>
      <span class="polaroid__cap">Our memory 💕</span>
      <button class="polaroid__remove" type="button" aria-label="Remove photo">×</button>`;
    $("img", li).src = url;
    $(".polaroid__remove", li).addEventListener("click", () => {
      URL.revokeObjectURL(url);
      li.remove();
      announce("Photo removed");
      photoInput.focus();
    });
    joys.insertBefore(li, joys.lastElementChild);
    photoInput.value = "";
    announce("Photo added to the memory board");
  });

  /* ---------- Surprise: confetti then the last page ---------- */
  $$("[data-action='surprise']").forEach((b) =>
    b.addEventListener("click", async () => {
      if (!calm) confetti();
      await wait(calm ? 0 : 450);
      goTo(scenes.length - 1);
    })
  );

  const canvas = $("#confetti");
  const ctx = canvas.getContext("2d");
  let confettiRaf = 0;
  function confetti() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = (canvas.width = innerWidth * dpr);
    const h = (canvas.height = innerHeight * dpr);
    const colors = ["#ffb6cf", "#c9b8ff", "#a8e6cf", "#ffe08a", "#a9d6ff", "#ffc9a8"];
    const pieces = Array.from({ length: 160 }, () => ({
      x: w / 2 + rand(-w * 0.1, w * 0.1),
      y: h * 0.65,
      vx: rand(-9, 9) * dpr,
      vy: rand(-18, -8) * dpr,
      size: rand(6, 12) * dpr,
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.2, 0.2),
      color: pick(colors),
      shape: Math.random() < 0.3 ? "heart" : Math.random() < 0.5 ? "circle" : "rect",
    }));
    const start = performance.now();
    cancelAnimationFrame(confettiRaf);
    const frame = (t) => {
      ctx.clearRect(0, 0, w, h);
      const life = (t - start) / 3200;
      pieces.forEach((p) => {
        p.vy += 0.35 * dpr;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        else if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        else heart(ctx, p.size);
        ctx.restore();
      });
      if (life < 1) confettiRaf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    };
    confettiRaf = requestAnimationFrame(frame);
  }
  function heart(c, s) {
    c.beginPath();
    c.moveTo(0, s * 0.3);
    c.bezierCurveTo(-s * 0.6, -s * 0.1, -s * 0.3, -s * 0.6, 0, -s * 0.25);
    c.bezierCurveTo(s * 0.3, -s * 0.6, s * 0.6, -s * 0.1, 0, s * 0.3);
    c.fill();
  }
  /* ---------- Envelope intro ---------- */
  const intro = $("#intro");
  const envelope = $("#envelope");
  const behind = [$(".skip-link"), $(".topbar"), $("#main"), $(".pager"), $(".fab-hug")].filter(Boolean);
  let introDone = false;
  if (intro && location.hash === "") {
    intro.hidden = false;
    behind.forEach((el) => { el.inert = true; });
    document.body.classList.add("has-intro");
    $("#open-envelope").focus({ preventScroll: true });
    const openEnvelope = async () => {
      if (introDone) return;
      introDone = true;
      envelope.classList.add("is-open");
      announce("Opening your letter…");
      await wait(calm ? 100 : 1700);
      intro.classList.add("is-leaving");
      await wait(calm ? 50 : 600);
      intro.remove();
      behind.forEach((el) => { el.inert = false; });
      document.body.classList.remove("has-intro");
      $(".title", scenes[current])?.focus({ preventScroll: true });
    };
    envelope.addEventListener("click", openEnvelope);
    $("#open-envelope").addEventListener("click", openEnvelope);
  } else if (intro) {
    intro.remove();
  }
})();
