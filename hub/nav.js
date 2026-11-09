// Adds a floating "prev · hub · next" bar to any concept page that includes it.
(function () {
  var pages = window.HUB_PAGES || [];
  // Site root = folder above /hub/, so it works at "/" and at "/<repo>/" (GitHub Pages).
  var root = new URL("..", document.currentScript.src).pathname;
  var path = decodeURIComponent(location.pathname);
  var i = pages.findIndex(function (p) {
    var dir = root + p.href.slice(0, p.href.lastIndexOf("/") + 1);
    return path.indexOf(decodeURIComponent(dir)) === 0;
  });
  if (i < 0 || window.self !== window.top) return; // not a concept page, or shown as a hub preview

  var cur = pages[i];
  pages = pages.map(function (p) { return Object.assign({}, p, { href: root + p.href }); });
  var prev = pages[(i - 1 + pages.length) % pages.length];
  var next = pages[(i + 1) % pages.length];
  var arrowL = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>';
  var arrowR = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 3 5 5-5 5"/></svg>';
  var grid = '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="5" height="5" rx="1.2"/><rect x="9" y="2" width="5" height="5" rx="1.2"/><rect x="2" y="9" width="5" height="5" rx="1.2"/><rect x="9" y="9" width="5" height="5" rx="1.2"/></svg>';

  function build() {
    var nav = document.createElement("nav");
    nav.className = "hubnav";
    nav.setAttribute("aria-label", "Concept navigator");
    nav.style.setProperty("--hub-accent", cur.accent);
    nav.innerHTML =
      '<a href="' + prev.href + '" rel="prev" title="' + prev.name + '">' + arrowL + '<span class="hubnav-label">' + prev.name + '</span></a>' +
      '<a class="hubnav-home" href="' + root + '" title="All concepts">' + grid + '<span class="hubnav-label">Hub</span></a>' +
      '<span class="hubnav-dots">' + pages.map(function (p, j) {
        return '<a href="' + p.href + '" title="' + p.name + '"' + (j === i ? ' aria-current="page"' : '') + '></a>';
      }).join("") + '</span>' +
      '<a href="' + next.href + '" rel="next" title="' + next.name + '"><span class="hubnav-label">' + next.name + '</span>' + arrowR + '</a>';
    document.body.appendChild(nav);

    // Tuck the bar away while scrolling down, bring it back on scroll up / near the bottom.
    var lastY = scrollY;
    addEventListener("scroll", function () {
      var y = scrollY, atEnd = innerHeight + y >= document.documentElement.scrollHeight - 40;
      nav.classList.toggle("is-hidden", y > lastY && y > 200 && !atEnd);
      lastY = y;
    }, { passive: true });
  }

  // Alt + ← / → jumps between concepts, Alt + H goes to the hub.
  addEventListener("keydown", function (e) {
    if (!e.altKey) return;
    if (e.key === "ArrowLeft") location.href = prev.href;
    else if (e.key === "ArrowRight") location.href = next.href;
    else if (e.key === "h" || e.key === "H") location.href = root;
  });

  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
})();
