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

  /* ---------- special thanks to — 이름 호버 팝업 ----------
     see you soon! 팝업처럼 바늘 커서 꼬리(커서 오른쪽)에 붙어 따라다닌다. */
  var thankpop = document.getElementById("thankpop");
  var THANKS = {
    mom: "a crafter of pumpkin pincushions",
    dad: "a strong pillar for me",
    sis: "my own bamboo forest"
  };
  if (thankpop) {
    var moveThank = function (e) {
      var fitNow = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--fit")) || 1;
      var w = thankpop.offsetWidth, h = thankpop.offsetHeight;
      var x = e.clientX + (24.7 + 12) * fitNow;
      var y = e.clientY - h / 2;
      if (x + w > window.innerWidth - 8) x = e.clientX - 12 * fitNow - w;
      y = Math.max(8, Math.min(window.innerHeight - h - 8, y));
      thankpop.style.transform = "translate(" + x + "px," + y + "px)";
    };
    [].slice.call(document.querySelectorAll("[data-pop]")).forEach(function (el) {
      var key = el.getAttribute("data-pop");
      el.addEventListener("pointerenter", function (e) {
        thankpop.textContent = THANKS[key] || "";
        thankpop.className = "thankpop " + key;
        moveThank(e);
        thankpop.classList.add("is-on");
      });
      el.addEventListener("pointermove", moveThank);
      el.addEventListener("pointerleave", function () { thankpop.classList.remove("is-on"); });
    });
  }

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
