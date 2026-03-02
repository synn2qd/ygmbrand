// YGM interactions shared across pages
(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Smooth anchor scrolling for same-page hashes
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Reveal on scroll (supports data-delay ms)
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  revealEls.forEach((el, i) => {
    const d = el.getAttribute("data-delay");
    const auto = (i % 7) * 55;
    el.style.setProperty("--d", (d ? `${d}ms` : `${auto}ms`));
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -12% 0px" });

  revealEls.forEach(el => io.observe(el));

  // Active nav based on visible sections (only for in-page anchors)
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const ids = Array.from(new Set(
    links.map(l => l.getAttribute("href"))
      .filter(h => h && h.startsWith("#"))
  ));
  const sections = ids.map(id => document.querySelector(id)).filter(Boolean);

  const setActive = (hash) => {
    links.forEach(l => l.classList.toggle("is-active", l.getAttribute("href") === hash));
  };

  if (sections.length) {
    const navIO = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive("#" + visible.target.id);
    }, { threshold: [0.25, 0.5, 0.75] });

    sections.forEach(s => navIO.observe(s));
  }

  // Ambient motion
  const setSheen = () => {
    const y = window.scrollY || 0;
    const h = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, y / h));
    const sheen = Math.max(0, Math.sin(p * Math.PI) * 0.16);
    document.documentElement.style.setProperty("--sheen", sheen.toFixed(3));
  };

  const sakuras = Array.from(document.querySelectorAll(".sakura"));
  const hero = document.querySelector(".hero, .roster-hero");
  const parallax = () => {
    if (!hero || !sakuras.length) return;
    const rect = hero.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    const amt = (t - 0.5) * 28;
    sakuras.forEach((el, idx) => {
      const k = (idx + 1) * 0.65;
      el.style.transform = `translate3d(${amt * k}px, ${-amt * k}px, 0)`;
    });
  };

  const move = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty("--mx", x.toFixed(2) + "%");
    document.documentElement.style.setProperty("--my", y.toFixed(2) + "%");
  };
  window.addEventListener("mousemove", move, { passive: true });

  const onScroll = () => { setSheen(); parallax(); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  // Twitch embed (parent must match the EXACT hostname serving this page)
  const twitchFrame = document.getElementById("twitch-embed");
  if (twitchFrame) {
    const channel = twitchFrame.getAttribute("data-channel") || "solveyfn";

    // If you open the HTML as file://, Twitch will refuse (no valid hostname).
    if (location.protocol === "file:") {
      const hint = document.querySelector(".twitch-hint");
      if (hint) {
        hint.textContent = "Twitch embed requires a real hostname. Run a local server (VS Code Live Server) or view on ygmbrand.org.";
      }
    }

    const host = (location.hostname || "localhost").toLowerCase();

    // Only send the minimum required parents. Twitch is picky.
    const parents = Array.from(new Set([
      host,
      "ygmbrand.org",
      "www.ygmbrand.org",
      "localhost",
      "127.0.0.1"
    ].filter(Boolean)));

    const parentParams = parents
      .map(p => `parent=${encodeURIComponent(p)}`)
      .join("&");

    twitchFrame.src = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parentParams}&muted=true`;

  }

})();


  // Live stream switcher (right-side cards)
  const liveCards = document.querySelectorAll(".live-side .member-card[data-channel]");
  const liveLabel = document.getElementById("liveLabel");
  const openTwitch = document.getElementById("openTwitch");
  const twitchFrame2 = document.getElementById("twitch-embed");

  function setActiveCard(card){
    liveCards.forEach(c => c.classList.remove("is-active"));
    card.classList.add("is-active");
  }

  function setStream(channel, label, url){
    if (!twitchFrame2) return;

    // reuse the same parent logic as the embed initializer
    const host = (location.hostname || "localhost").toLowerCase();
    const parents = [host];
    if (host === "www.ygmbrand.org") parents.push("ygmbrand.org");
    if (host === "ygmbrand.org") parents.push("www.ygmbrand.org");
    if (host === "localhost") parents.push("127.0.0.1");

    const parentParams = parents.filter(Boolean).map(p => `parent=${encodeURIComponent(p)}`).join("&");
    twitchFrame2.src = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parentParams}&muted=true`;

    if (liveLabel) liveLabel.textContent = label || `twitch.tv/${channel}`;
    if (openTwitch && url) openTwitch.href = url;
  }

  if (liveCards.length && twitchFrame2) {
    liveCards.forEach(card => {
      card.addEventListener("click", () => {
        const ch = card.getAttribute("data-channel");
        const lb = card.getAttribute("data-label");
        const url = card.getAttribute("data-url");
        setActiveCard(card);
        setStream(ch, lb, url);
      });
    });
  }


/* MOBILE_NAV */
(() => {
  const burger = document.querySelector(".nav-burger");
  const links = document.querySelector(".nav-links");
  if(!burger || !links) return;

  const close = () => links.classList.remove("is-open");
  burger.addEventListener("click", () => {
    links.classList.toggle("is-open");
  });
  // close when clicking a link
  links.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if(a) close();
  });
  // close on outside click
  document.addEventListener("click", (e) => {
    if(e.target.closest(".nav") || e.target.closest(".nav-links")) return;
    close();
  });
})();
