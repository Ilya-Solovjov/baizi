  // ───────────── Visitor counts ─────────────
  // Anonymous visit counts through GoatCounter (https://www.goatcounter.com): no cookies, no personal data.
  // Set GOATCOUNTER_CODE to your site code (the "baizi" in baizi.goatcounter.com) to turn it on; leave it empty to turn it off.
  // It only runs on the published site (not on file://, localhost, or inside other hosts), so testing never adds visits.
  const GOATCOUNTER_CODE = 'baizi';
  const ANALYTICS_ON = !!GOATCOUNTER_CODE && /\.github\.io$/.test(location.hostname);
  if (ANALYTICS_ON) {
    const s = document.createElement('script');
    s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.dataset.goatcounter = 'https://' + GOATCOUNTER_CODE + '.goatcounter.com/count';
    document.head.appendChild(s);
  }
  // Game events show up in the GoatCounter dashboard next to page views, e.g. "run-start" or "run-win".
  function track(name, title) {
    if (!ANALYTICS_ON) return;
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: title || name, event: true }); } catch (e) { /* counting must never break the game */ }
  }
