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

  /* 셸 안에서는 iframe 이 화면 폭 전체(스크롤바가 화면 오른쪽 끝에 붙도록)이고 높이는 810 x 배율.
     폭과 높이 중 작은 쪽 배율로 1440 스테이지를 맞추고, 남는 좌우 폭(bleed)만큼 가운데로 민다. */
  function fit() {
    var w = document.documentElement.clientWidth;
    var h = window.innerHeight || document.documentElement.clientHeight;
    var s = Math.min(w / 1440, h / 810);
    var bleed = Math.max(0, (w / s - 1440) / 2);          /* 프레임 좌표 기준 */
    doc.style.setProperty("--fit", s);
    document.documentElement.style.setProperty("--fit", s);   /* 바늘 커서 */
    document.getElementById("stage").style.left = (bleed * s) + "px";
    if (menu) { menu.style.setProperty("--fit", s); menu.style.setProperty("--bleed", bleed + "px"); }
    doc.style.height = (H * s) + "px";
  }
  fit();
  window.addEventListener("resize", fit);

  /* ---------- graphic1 · graphic2 ----------
     그룹이 화면에 들어오면 .is-in — 원들이 저프레임으로 천천히 제 크기가 된다.
     (상세 페이지 ROUND 와 같은 방식: 이벤트 + 낮은 빈도 폴링으로 어디서나 동작) */
  var graphics = [].slice.call(document.querySelectorAll(".graphic"));
  if (graphics.length) {
    function syncGraphic() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      graphics.forEach(function (el) {
        var r = el.getBoundingClientRect();
        el.classList.toggle("is-in", r.bottom > 0 && r.top < vh);
      });
    }
    document.addEventListener("scroll", syncGraphic, { passive: true, capture: true });
    window.addEventListener("resize", syncGraphic);
    setInterval(syncGraphic, 250);
    syncGraphic();
  }

  /* ---------- 호버 판정 (special thanks 팝업 · 명함 플립) ----------
     Safari 에서는 메인 화면(셸) 안 iframe 의 요소에 pointerenter/leave 가 오지 않아
     팝업도 플립도 반응하지 않았다. 진입 이벤트에 기대지 않고, 마우스가 움직이거나
     스크롤될 때마다 커서 좌표가 어느 요소의 영역 안에 있는지 직접 계산한다. */
  var thankpop = document.getElementById("thankpop");
  var THANKS = {
    mom: "a crafter of pumpkin pincushions",
    dad: "a strong pillar for me",
    sis: "my own bamboo forest"
  };
  var pops = [].slice.call(document.querySelectorAll("[data-pop]"));
  var card = document.querySelector(".card3d");
  var curPop = null, inCard = false;
  var lastX = -1, lastY = -1;

  function inside(el, x, y, pad) {
    var r = el.getBoundingClientRect();
    return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
  }
  function placeThank(x, y) {
    var fitNow = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--fit")) || 1;
    var w = thankpop.offsetWidth, h = thankpop.offsetHeight;
    var px = x + (24.7 + 12) * fitNow;
    var py = y - h / 2;
    if (px + w > window.innerWidth - 8) px = x - 12 * fitNow - w;
    py = Math.max(8, Math.min(window.innerHeight - h - 8, py));
    thankpop.style.transform = "translate(" + px + "px," + py + "px)";
  }
  function setFlip(on) { if (card) card.classList.toggle("is-flip", on); }

  function track(x, y) {
    lastX = x; lastY = y;
    /* special thanks 이름 */
    if (thankpop) {
      var hit = null;
      for (var i = 0; i < pops.length; i++) if (inside(pops[i], x, y, 4)) { hit = pops[i]; break; }
      if (hit !== curPop) {
        curPop = hit;
        if (hit) {
          var key = hit.getAttribute("data-pop");
          thankpop.textContent = THANKS[key] || "";
          thankpop.className = "thankpop " + key + " is-on";
        } else {
          thankpop.classList.remove("is-on");
        }
        if (needle) needle.classList.toggle("is-selected", !!hit);
      }
      if (hit) placeThank(x, y);
    }
    /* 명함 */
    if (card) {
      var over = inside(card, x, y, 0);
      if (over !== inCard) { inCard = over; setFlip(over); }
    }
  }
  function onMove(e) { track(e.clientX, e.clientY); }
  document.addEventListener("mousemove", onMove, { passive: true });
  document.addEventListener("pointermove", onMove, { passive: true });
  /* 문서·body 어느 쪽이 스크롤하든 잡히도록 capture 로 듣는다 */
  document.addEventListener("scroll", function () { if (lastX >= 0) track(lastX, lastY); }, { passive: true, capture: true });
  /* 커서가 창(iframe) 밖으로 나가면 모두 닫는다 */
  document.addEventListener("mouseleave", function () {
    curPop = null; if (thankpop) thankpop.classList.remove("is-on");
    if (inCard) { inCard = false; setFlip(false); }
  });
  /* 터치: 호버가 없는 환경에서는 눌러서 뒤집는다 (마우스로 올라가 있으면 이미 뒷면) */
  if (card) card.addEventListener("click", function () {
    if (!inCard) setFlip(!card.classList.contains("is-flip"));
  });

  /* ---------- 바늘 커서 ---------- */

  if (needle) {
    document.addEventListener("pointermove", function (e) {
      needle.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
      needle.classList.add("is-on");
    });
    document.addEventListener("pointerleave", function () { needle.classList.remove("is-on"); });
    document.addEventListener("pointerdown", function () { needle.classList.add("is-selected"); });
    document.addEventListener("pointerup", function () { needle.classList.remove("is-selected"); });
    [].slice.call(document.querySelectorAll("a, button, .card3d, [data-pop]")).forEach(function (el) {
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
