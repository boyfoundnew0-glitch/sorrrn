/* ============================================================
   sorrrn — shop-detail 공통 스크립트
   · 1440 기준 스테이지를 뷰포트 폭에 맞춰 scale (CLAUDE.md 원칙 4)
   · MENU 는 화면 하단 고정 (원칙 5) — 같은 배율로 축소한다
   · 바늘 커서는 splash/shop 과 동일
   ============================================================ */
(function () {
  "use strict";

  /* 항상 최신 페이지를 띄우는 서비스 워커 (../sw.js — 사이트 전체 범위) */
  if ("serviceWorker" in navigator) {
    try { navigator.serviceWorker.register("../sw.js").catch(function () {}); } catch (err) {}
  }

  var doc   = document.getElementById("doc");
  var stage = document.getElementById("stage");
  var menu  = document.getElementById("menu");
  var needle = document.getElementById("needle");
  var H = parseFloat(doc.getAttribute("data-h")) || 2336;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ---------- h1 products → -shop-scroll ----------
     같은 주소로의 재이동이 무시되거나 뒤로가기 캐시에서 복원되어
     아무 일도 일어나지 않는 경우가 없도록, 누를 때마다 고유한 주소로 보낸다.
     (횟수 제한 없음 — 몇 번을 눌러도 매번 이동한다) */

  [].slice.call(document.querySelectorAll(".h1grp")).forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var href = a.getAttribute("href");
      var sep = href.indexOf("?") >= 0 ? "&" : "?";
      window.location.href = href + sep + "t=" + Date.now();
    });
  });

  /* ---------- 스크롤에 따라 커졌다 작아지는 원 (Group 14924: ROUND1~4) ----------
     -splash 와 같은 계단식(저프레임) 모션. 화면에 들어오면 원래 크기까지 커지고,
     다시 위로 올려 화면을 벗어나면 줄어들어 사라진다.
     (IntersectionObserver 가 동작하지 않는 환경이 있어 스크롤 위치로 직접 판정한다) */

  var grows = [].slice.call(document.querySelectorAll(".grow-wrap"));
  if (grows.length) {
    function syncGrow() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      grows.forEach(function (el) {
        var r = el.getBoundingClientRect();
        el.classList.toggle("is-in", r.bottom > 0 && r.top < vh);
      });
    }
    /* 일부 임베드 환경에서는 scroll 이벤트와 rAF 가 오지 않는다.
       이벤트 + 낮은 빈도 폴링을 함께 걸어 어디서나 동작하게 한다. */
    window.addEventListener("scroll", syncGrow, { passive: true });
    window.addEventListener("resize", syncGrow);
    var lastY = -1;
    setInterval(function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (y === lastY) return;
      lastY = y;
      syncGrow();
    }, 100);
    syncGrow();
  }

  /* ---------- h1 products 슬라이드 (좌측부터 차례로, 스프링) ----------
     스크롤과 무관하게 페이지에 들어올 때 한 번 재생한다.
     뒤로 가기로 돌아왔을 때(bfcache 복원 포함)도 다시 재생한다. */

  var h1 = [].slice.call(document.querySelectorAll(".h1box.is-slide"));
  if (h1.length) {
    h1.forEach(function (el, i) {
      var p = el.querySelector(".h1ltr");
      if (p) p.style.transitionDelay = (reduced ? 0 : i * 60) + "ms";
    });
    var playH1 = function () {
      h1.forEach(function (el) { el.classList.remove("is-in"); });
      /* 시작 상태를 한 프레임 확정시킨 뒤 재생한다 */
      void h1[0].offsetWidth;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          h1.forEach(function (el) { el.classList.add("is-in"); });
        });
      });
      setTimeout(function () { h1.forEach(function (el) { el.classList.add("is-in"); }); }, 240);
    };
    playH1();
    window.addEventListener("pageshow", function (e) { if (e.persisted) playH1(); });
  }

  /* ---------- see you soon! 팝업 ----------
     상세 페이지를 아직 열지 않은 카드(.is-blocked). 호버/클릭하는 동안
     바늘 커서 꼬리(바늘귀 = 커서 기준 오른쪽 위)에 붙어 따라다닌다. */

  var soonpop = document.getElementById("soonpop");
  var blocked = [].slice.call(document.querySelectorAll(".card.is-blocked"));

  if (soonpop && blocked.length) {
    var NEEDLE_W = 24.7;          /* 바늘 커서 폭 — 꼬리는 이 오른쪽 끝에 있다 */
    var GAP = 12;

    function moveSoon(e) {
      var w = soonpop.offsetWidth, h = soonpop.offsetHeight;
      var x = e.clientX + NEEDLE_W + GAP;
      var y = e.clientY - h / 2;
      /* 화면 밖으로 나가면 커서 반대쪽으로 넘긴다 */
      if (x + w > window.innerWidth - 8) x = e.clientX - GAP - w;
      y = Math.max(8, Math.min(window.innerHeight - h - 8, y));
      soonpop.style.transform = "translate(" + x + "px," + y + "px)";
    }

    blocked.forEach(function (el) {
      el.addEventListener("pointerenter", function (e) { moveSoon(e); soonpop.classList.add("is-on"); });
      el.addEventListener("pointermove", moveSoon);
      el.addEventListener("pointerleave", function () { soonpop.classList.remove("is-on"); });
      el.addEventListener("click", function (e) { e.preventDefault(); moveSoon(e); soonpop.classList.add("is-on"); });
    });
  }

  /* ---------- how to sewing 슬라이드 (책갈피 상세) ----------
     ▶ 다음, ◀ 이전. 끝에서 누르면 처음/마지막으로 돌아간다.
     누른 아이콘은 잠깐 selected 상태(--icon-selected)가 된다. */
  var htView = document.querySelector(".ht-view");
  if (htView) {
    var htTrack = htView.querySelector(".ht-track");
    var htSlides = [].slice.call(htView.querySelectorAll(".ht-slide"));
    var htW = parseFloat(htView.style.width) || 267.1, htIdx = 0;
    function htGo(i) {
      htIdx = (i + htSlides.length) % htSlides.length;
      htTrack.style.left = (-htIdx * htW) + "px";
      htSlides.forEach(function (s, k) {
        if (k === htIdx) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true");
      });
    }
    [["prev", -1], ["next", 1]].forEach(function (p) {
      var b = document.querySelector(".ht-nav." + p[0]);
      if (!b) return;
      var t = null;
      function flash() {
        b.classList.add("is-sel");
        clearTimeout(t);
        t = setTimeout(function () { b.classList.remove("is-sel"); }, 450);
      }
      /* 누르는 순간 selected 로 바뀌고, 클릭이 확정되면 넘어간다 */
      b.addEventListener("pointerdown", flash);
      b.addEventListener("click", function (e) {
        e.preventDefault();
        flash();
        htGo(htIdx + p[1]);
      });
    });
  }

  /* ---------- 항상 최신 페이지로 이동 ----------
     GitHub Pages 는 HTML 을 10분 캐시하고 Safari 는 그보다 오래 들고 있기도 해서,
     업데이트 직후에도 예전 상세페이지가 보였다. 사이트 안의 .html 링크는
     누를 때마다 고유 쿼리를 붙여 이동한다 (다른 핸들러가 막은 클릭은 건드리지 않는다). */
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.target === "_blank") return;
    var href = a.getAttribute("href");
    if (!/^[^:#?]+\.html(\?[^#]*)?(#.*)?$/.test(href)) return;   /* 같은 사이트의 .html 만 */
    e.preventDefault();
    var hash = href.indexOf("#") >= 0 ? href.slice(href.indexOf("#")) : "";
    var base = hash ? href.slice(0, href.indexOf("#")) : href;
    window.location.href = base + (base.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now() + hash;
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
    [].slice.call(document.querySelectorAll("a, button")).forEach(function (el) {
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
