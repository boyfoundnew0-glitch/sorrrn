/* ============================================================
   sorrrn — about sorrrn
   · 1440 기준 스테이지를 뷰포트 폭에 맞춰 scale (CLAUDE.md 원칙 4)
   · MENU 는 화면 하단 고정 (원칙 5) — 같은 배율로 축소한다
   · 바늘 커서는 splash/shop/상세 와 동일
   ============================================================ */
(function () {
  "use strict";

  var doc    = document.getElementById("doc");
  var menu   = document.getElementById("menu");
  var needle = document.getElementById("needle");
  var H = parseFloat(doc.getAttribute("data-h")) || 17831.13;

  /* ---------- 배율 ---------- */

  function fit() {
    var w = document.documentElement.clientWidth;
    var s = w / 1440;
    doc.style.setProperty("--fit", s);
    if (menu) menu.style.setProperty("--fit", s);
    doc.style.height = (H * s) + "px";
  }
  fit();
  window.addEventListener("resize", fit);

  /* ---------- 명함 플립 ----------
     포인터가 올라가면 뒷면, 벗어나면 앞면. 클릭(터치)하면 뒤집기를 토글한다.
     스크롤로 명함이 커서 아래에 들어온 경우도 pointermove 로 잡는다. */
  var card = document.querySelector(".card3d");
  if (card) {
    var inCard = false;
    function hitCard(x, y) {
      var r = card.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }
    function setFlip(on) { card.classList.toggle("is-flip", on); }
    card.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") { inCard = true; setFlip(true); } });
    card.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") { inCard = false; setFlip(false); } });
    card.addEventListener("click", function () { if (!inCard) setFlip(!card.classList.contains("is-flip")); });
    var lastX = -1, lastY = -1;
    document.addEventListener("pointermove", function (e) { lastX = e.clientX; lastY = e.clientY; }, { passive: true });
    /* 문서·body 어느 쪽이 스크롤하든 잡히도록 capture 로 듣는다 */
    document.addEventListener("scroll", function () {
      if (lastX < 0) return;
      var hit = hitCard(lastX, lastY);
      if (hit !== inCard) { inCard = hit; setFlip(hit); }
    }, { passive: true, capture: true });
  }

  /* ---------- 바늘 커서 ---------- */

  if (needle) {
    document.addEventListener("pointermove", function (e) {
      needle.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
      needle.classList.add("is-on");
    });
    document.addEventListener("pointerleave", function () { needle.classList.remove("is-on"); });
    document.addEventListener("pointerdown", function () { needle.classList.add("is-selected"); });
    document.addEventListener("pointerup", function () { needle.classList.remove("is-selected"); });
    [].slice.call(document.querySelectorAll("a, button, .card3d")).forEach(function (el) {
      el.addEventListener("pointerenter", function () { needle.classList.add("is-selected"); });
      el.addEventListener("pointerleave", function () { needle.classList.remove("is-selected"); });
    });

    if (!needle.children.length) {
      Promise.all([
        fetch("../assets/svg/cursor-niddleicon.svg").then(function (r) { return r.ok ? r.text() : Promise.reject(); }),
        fetch("../assets/svg/cursor-niddleicon-selected.svg").then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      ]).then(function (svgs) {
        needle.innerHTML = '<span class="nd-default">' + svgs[0] + '</span>' +
                           '<span class="nd-selected">' + svgs[1] + '</span>';
      }).catch(function () {
        document.body.classList.add("no-needle");
        needle.remove();
      });
    }
  }
})();
