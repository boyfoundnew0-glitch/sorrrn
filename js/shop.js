/* ============================================================
   sorrrn — -shop
   Figma: -shop-scroll 446:9155 / -shop-hover 446:14025 / -shop-click-one1~5
   프레임 1440 x 810

   -shop-default : 최초 접근. 사각형 그래픽만 배치된 상태
   -shop-scroll  : 위로 스크롤 시 products 글자가 사각형 안에서 clip 된 채
                   슬라이딩 업 → 0.5초 뒤 explore our products 페이드인
                   → 안내문구 페이드인 후 1.5초 뒤 페이드아웃
   -shop-hover   : 카테고리 블럭 호버 시 click it! 버튼만 등장 (블럭 변화 없음)
   -shop-click   : 클릭 시 블럭이 벌어지며 카테고리명 카드 등장,
                   나머지 블럭은 오퍼시티 60%. × 누르면 -shop-scroll 로 복귀
   ============================================================ */
(function () {
  "use strict";

  var frame    = document.getElementById("frame");
  var viewport = document.getElementById("viewport");
  var stage    = document.getElementById("stage");
  var needle   = document.getElementById("needle");
  var lead     = document.getElementById("lead");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CATES = ["sb", "tools", "kitm", "kith", "kitb"];
  /* 카테고리별 상세 목록 페이지 — 아직 만들어지지 않은 카테고리는 비워둔다 */
  var DETAIL = { kitb: "kitbasic.html", kitm: "kitmid.html" };

  /* -move-* 프레임에서 뽑은 블럭 이동 경로 (프레임 좌표) */
  var MOVES = {"sb":{"big":[[362.63,206.9],[475.49,282.13]],"small":[[306.21,188.09],[287.4,206.9],[268.59,224.95],[268.59,282.13]]},"tools":{"big":[[437.87,432.6],[381.44,489.03],[325.02,507.84]],"small":[]},"kitm":{"big":[[720.0,319.75],[701.17,338.67],[644.77,394.98]],"small":[[776.4,300.94],[757.59,300.94],[719.97,300.94],[682.35,300.94]]},"kith":{"big":[[1002.13,206.9],[1058.56,263.32],[1115.1,282.21]],"small":[]},"kitb":{"big":[[1002.13,432.6],[1049.16,460.93],[1096.18,485.31],[1153.11,508.16]],"small":[]}};
  var MOVE_DUR = 720;      /* 블럭 이동 (한 카테고리당 1초 안) */
  var CARD_AT  = 620;      /* 카드 프레임이 뜨는 시점 */
  var blocks = {}, popups = {}, cards = {};
  CATES.forEach(function (id) {
    blocks[id] = document.getElementById("blk-" + id);
    popups[id] = document.getElementById("pop-" + id);
    cards[id]  = document.getElementById("card-" + id);
  });

  var scrolled = false;   /* products 가 올라온 상태인가 */
  var openCate = null;    /* 열려 있는 카테고리 */
  var leadTimer = null;

  /* ---------- 프레임 스케일 ---------- */

  function fit() {
    var s = Math.min(window.innerWidth / 1440, window.innerHeight / 810);
    frame.style.setProperty("--fit", s);
    return s;
  }
  var scale = fit();
  window.addEventListener("resize", function () { scale = fit(); });

  /* ---------- -shop-scroll ---------- */

  function showProducts() {
    if (scrolled) return;
    scrolled = true;
    frame.classList.add("is-scrolled");

    /* 글자들이 좌측부터 순차적으로 올라오도록 시차를 준다 */
    var ltrs = stage.querySelectorAll(".pltr");
    [].slice.call(ltrs).forEach(function (el, i) {
      el.style.transitionDelay = (reduced ? 0 : i * 60) + "ms";
    });

    /* 안내문구: explore 페이드인(0.5s 시간차) 뒤 등장 → 1.5초 후 페이드아웃 */
    clearTimeout(leadTimer);
    var inAt = reduced ? 0 : 1300;
    leadTimer = setTimeout(function () {
      lead.classList.add("is-in");
      leadTimer = setTimeout(function () { lead.classList.remove("is-in"); }, 1500 + 500);
    }, inAt);
  }

  function hideProducts() {
    scrolled = false;
    frame.classList.remove("is-scrolled");
    clearTimeout(leadTimer);
    lead.classList.remove("is-in");
  }

  /* ---------- -shop-hover ---------- */

  function setHover(id, on) {
    if (openCate) return;                 /* 카드가 열려 있으면 호버 반응 없음 */
    if (!scrolled) return;
    popups[id].classList.toggle("is-on", on);   /* 블럭 자체는 변화 없음 */
  }

  /* ---------- -shop-click ---------- */

  /* ---------- 블럭 이동 ---------- */

  var anim = {};

  function easeMove(x) { return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2; }

  /* 경로를 등간격 구간으로 나눠 t(0~1) 지점의 좌표를 낸다 */
  function atPath(path, t) {
    if (path.length === 1) return path[0];
    var seg = 1 / (path.length - 1);
    var i = Math.min(path.length - 2, Math.floor(t / seg));
    var u = (t - i * seg) / seg;
    return [path[i][0] + (path[i+1][0] - path[i][0]) * u,
            path[i][1] + (path[i+1][1] - path[i][1]) * u];
  }

  function setSq(el, p) { if (el) { el.style.left = p[0] + "px"; el.style.top = p[1] + "px"; } }

  function runMove(id, forward, done) {
    var m = MOVES[id], blk = blocks[id];
    var b = blk.querySelector(".sq-b"), sm = blk.querySelector(".sq-s");
    cancelAnimationFrame(anim[id]);
    blk.classList.add("is-moving");
    var t0 = null;
    function frameStep(now) {
      if (t0 === null) t0 = now;
      var raw = Math.min(1, (now - t0) / MOVE_DUR);
      var t = easeMove(forward ? raw : 1 - raw);
      setSq(b, atPath(m.big, t));
      if (sm && m.small.length) setSq(sm, atPath(m.small, t));
      if (raw < 1) anim[id] = requestAnimationFrame(frameStep);
      else { blk.classList.remove("is-moving"); if (done) done(); }
    }
    anim[id] = requestAnimationFrame(frameStep);
    /* 탭이 숨겨져 rAF 가 멈춰도 최종 상태로 확정 */
    clearTimeout(anim[id + "_t"]);
    anim[id + "_t"] = setTimeout(function () {
      cancelAnimationFrame(anim[id]);
      setSq(b, forward ? m.big[m.big.length-1] : m.big[0]);
      if (sm && m.small.length) setSq(sm, forward ? m.small[m.small.length-1] : m.small[0]);
      blk.classList.remove("is-moving");
      if (done) done();
    }, MOVE_DUR + 160);
  }

  function openCard(id) {
    if (!scrolled || openCate === id) return;
    if (openCate) closeCard();
    openCate = id;
    frame.classList.add("is-open");
    blocks[id].classList.add("is-active");
    popups[id].classList.remove("is-on");
    runMove(id, true);
    clearTimeout(anim[id + "_card"]);
    anim[id + "_card"] = setTimeout(function () {
      if (openCate === id) cards[id].classList.add("is-on");
    }, CARD_AT);
  }

  function closeCard() {
    if (!openCate) return;
    var id = openCate;
    openCate = null;
    frame.classList.remove("is-open");
    clearTimeout(anim[id + "_card"]);
    cards[id].classList.remove("is-on", "is-selected");
    runMove(id, false, function () { blocks[id].classList.remove("is-active"); });
  }

  CATES.forEach(function (id) {
    var blk = blocks[id];
    [].slice.call(blk.querySelectorAll(".blk-sq")).forEach(function (sq) {
      sq.addEventListener("pointerenter", function () { setHover(id, true); });
      sq.addEventListener("pointerleave", function () { setHover(id, false); });
      sq.addEventListener("click", function () { openCard(id); });
    });
    popups[id].addEventListener("pointerenter", function () { setHover(id, true); });
    popups[id].addEventListener("pointerleave", function () { setHover(id, false); });
    popups[id].addEventListener("click", function () { openCard(id); });

    /* 카드: 호버/클릭 시 selected 상태 */
    cards[id].addEventListener("pointerenter", function () { cards[id].classList.add("is-selected"); });
    cards[id].addEventListener("pointerleave", function () { cards[id].classList.remove("is-selected"); });
    /* selected 상태에서 카드를 누르면 카테고리 목록 페이지로 이동 */
    cards[id].addEventListener("click", function (e) {
      if (e.target.closest(".card-close")) return;
      var page = DETAIL[id];
      if (!page) return;
      /* shop 문서는 셸 안의 iframe 이다. 최상위(window.top)는 아티팩트에서
         다른 출처라 건드릴 수 없으므로, 바로 위 문서(셸)를 기준으로 이동한다. */
      var w = (window.parent && window.parent !== window) ? window.parent : window;
      try {
        var base = (w.document && w.document.baseURI) || w.location.href;
        w.location.href = new URL(page, base).href;
      } catch (err) {
        try { w.location.href = page; } catch (e2) { window.location.href = page; }
      }
    });
  });

  [].slice.call(document.querySelectorAll(".card-close")).forEach(function (b) {
    b.addEventListener("click", function (e) { e.stopPropagation(); closeCard(); });
  });

  /* ---------- 스크롤 / 키보드 ---------- */

  var acc = 0, lock = false;

  window.addEventListener("wheel", function (e) {
    e.preventDefault();
    if (lock) return;
    acc += e.deltaY;
    if (Math.abs(acc) > 46) {
      if (acc > 0) { showProducts(); }
      else { if (openCate) closeCard(); else hideProducts(); }
      acc = 0; lock = true;
      setTimeout(function () { lock = false; }, 460);
    }
  }, { passive: false });

  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); showProducts(); }
    else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); if (openCate) closeCard(); else hideProducts(); }
    else if (e.key === "Escape") { closeCard(); }
  });

  /* ---------- 바늘 커서 ---------- */

  function moveNeedle(e) {
    if (!needle) return;
    needle.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    needle.classList.add("is-on");
  }
  function selOn()  { if (needle) needle.classList.add("is-selected"); }
  function selOff() { if (needle) needle.classList.remove("is-selected"); }

  document.addEventListener("pointermove", moveNeedle);
  document.addEventListener("pointerleave", function () { if (needle) needle.classList.remove("is-on"); });
  document.addEventListener("pointerdown", selOn);
  document.addEventListener("pointerup", selOff);
  [].slice.call(document.querySelectorAll("a, button, .blk-sq")).forEach(function (el) {
    el.addEventListener("pointerenter", selOn);
    el.addEventListener("pointerleave", selOff);
  });

  if (needle && !needle.children.length) {
    Promise.all([
      fetch("../assets/svg/cursor-niddleicon.svg").then(function (r) { return r.ok ? r.text() : Promise.reject(); }),
      fetch("../assets/svg/cursor-niddleicon-selected.svg").then(function (r) { return r.ok ? r.text() : Promise.reject(); })
    ]).then(function (svgs) {
      needle.innerHTML = '<span class="nd-default">' + svgs[0] + '</span>' +
                         '<span class="nd-selected">' + svgs[1] + '</span>';
    }).catch(function () {
      viewport.classList.add("no-needle");
      needle.remove();
      needle = null;
    });
  }

  /* 튜닝/데모용 */
  window.SHOP = {
    scroll: showProducts, reset: function () { closeCard(); hideProducts(); },
    open: openCard, close: closeCard
  };
})();
