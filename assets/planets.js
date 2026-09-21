/* Solar-system program browser: planets, search, hover code preview */
(function () {
  var list = document.querySelector("main.list");
  if (!list) return;
  var DATA = window.PREVIEWS || {};
  var NAMES = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Moon", "Sun"];
  var COLORS = ["#b5b0a866", "#e0a95a77", "#3b8bffaa", "#e2603add", "#d9a86a88", "#ffd66daa", "#4fb6c8aa", "#3f63e6cc", "#cfd6e455", "#ff8a00cc"];

  /* ---------- search ---------- */
  var items = [].slice.call(list.querySelectorAll("ol li"));
  items.forEach(function (li) {
    li.firstElementChild.setAttribute("data-n", ("0" + ([].indexOf.call(li.parentNode.children, li) + 1)).slice(-2));
  });
  var box = document.createElement("div");
  box.className = "finder";
  box.innerHTML =
    '<input type="search" placeholder="Search programs..." aria-label="Search programs">' +
    '<span class="cnt"></span><span class="hint">Hover a planet to preview its code, click to open it</span>';
  list.insertBefore(box, list.querySelector("h2, ol"));
  var input = box.querySelector("input"), cnt = box.querySelector(".cnt");
  var none = document.createElement("p");
  none.className = "none";
  none.textContent = "No planets found in this orbit.";
  none.hidden = true;
  list.appendChild(none);

  function filter() {
    var q = input.value.trim().toLowerCase(), shown = 0;
    items.forEach(function (li) {
      var ok = !q || li.textContent.toLowerCase().indexOf(q) > -1 ||
        (li.firstElementChild.getAttribute("href") || "").toLowerCase().indexOf(q) > -1;
      li.hidden = !ok;
      if (ok) shown++;
    });
    [].forEach.call(list.querySelectorAll("ol"), function (ol) {
      var h = ol.previousElementSibling;
      var any = ol.querySelector("li:not([hidden])");
      ol.hidden = !any;
      if (h && h.tagName === "H2") h.hidden = !any;
    });
    cnt.textContent = shown + " of " + items.length + " programs";
    none.hidden = shown > 0;
  }
  input.addEventListener("input", filter);
  filter();

  /* ---------- hover / focus code preview ---------- */
  var peek = document.createElement("div");
  peek.id = "peek";
  peek.setAttribute("aria-hidden", "true");
  document.body.appendChild(peek);
  var current = null;

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function pos(rect) {
    var w = peek.offsetWidth, h = peek.offsetHeight, vw = window.innerWidth, vh = window.innerHeight, x, y;
    if (rect.right + 14 + w < vw) { x = rect.right + 14; y = rect.top; }
    else if (rect.left - 14 - w > 0) { x = rect.left - 14 - w; y = rect.top; }
    else { x = rect.left + rect.width / 2 - w / 2; y = rect.bottom + 10; if (y + h > vh - 8) y = rect.top - h - 10; }
    peek.style.left = Math.max(8, Math.min(x, vw - w - 8)) + "px";
    peek.style.top = Math.max(8, Math.min(y, vh - h - 8)) + "px";
  }
  function show(li) {
    var a = li.firstElementChild, i = items.indexOf(li);
    var idx = [].indexOf.call(li.parentNode.children, li);
    var code = DATA[a.getAttribute("href")];
    if (current) current.classList.remove("sel");
    current = li;
    li.classList.add("sel");
    var n = ("0" + (idx + 1)).slice(-2);
    peek.style.setProperty("--pg", COLORS[idx % 10]);
    peek.innerHTML =
      "<header><b>" + NAMES[idx % 10] + "</b> &middot; Program " + n + " &middot; " + esc(a.textContent) + "</header>" +
      (code ? "<pre>" + esc(code).replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span class="t">$2</span>') + "</pre>" : "") +
      "<footer>Click the planet to launch this program</footer>";
    pos(li.getBoundingClientRect());
    peek.classList.add("on");
  }
  function hide() { peek.classList.remove("on"); }

  items.forEach(function (li) {
    li.addEventListener("mouseenter", function () { show(li); });
    li.addEventListener("mouseleave", hide);
    li.firstElementChild.addEventListener("focus", function () { show(li); });
    li.firstElementChild.addEventListener("blur", hide);
  });
  window.addEventListener("scroll", hide, { passive: true });
})();
