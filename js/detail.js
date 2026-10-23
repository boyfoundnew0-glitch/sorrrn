/* ============================================================
   sorrrn — shop-detail 공통 스크립트
   · 1440 기준 스테이지를 뷰포트 폭에 맞춰 scale (CLAUDE.md 원칙 4)
   · MENU 는 화면 하단 고정 (원칙 5) — 같은 배율로 축소한다
   · 바늘 커서는 splash/shop 과 동일
   ============================================================ */
(function () {
  "use strict";

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
