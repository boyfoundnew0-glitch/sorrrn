/* ============================================================
   sorrrn — 장바구니
   · 담은 상품은 localStorage("sorrrn.cart") 에 둔다 (서버가 없다)
   · 상세 페이지 add to cart / buy it → 담기, buy it 은 장바구니로 이동
   · 장바구니 페이지는 담긴 내용을 피그마 -shop-shoppingbag 레이아웃으로 그린다
   · 아직 페이지가 없는 버튼([data-soon])은 see you soon! 팝업을 띄운다
   ============================================================ */
(function () {
  "use strict";

  var KEY = "sorrrn.cart";
  var SHIPPING = 2500;
  /* 피그마 -shop-shoppingbag-default 측정값 */
  var PITCH = 330;          /* 구분선 사이 간격 (364.86 → 694.86) */
  var TAIL_BASE = 0;        /* 1개일 때 꼬리·footer 는 제자리 */

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(v) ? v.filter(function (r) { return r && r.key; }) : [];
    } catch (e) { return []; }
  }
  function write(rows) {
    try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) {}
  }
  function add(key, qty) {
    var rows = read(), hit = null;
    rows.forEach(function (r) { if (r.key === key) hit = r; });
    if (hit) hit.qty += qty;
    else rows.push({ key: key, qty: qty, at: Date.now() });
    write(rows);
    return rows;
  }
  function won(n) { return "₩" + n.toLocaleString("en-US"); }
  function dateKR(ms) {
    var d = new Date(ms);
    return d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일에 담음";
  }

  /* ---------- see you soon! : 아직 만들지 않은 화면 ---------- */

  var soonpop = document.getElementById("soonpop");
  var NEEDLE_W = 24.7, SOON_GAP = 12;
  function moveSoon(e) {
    if (!soonpop) return;
    var w = soonpop.offsetWidth, h = soonpop.offsetHeight;
    var x = e.clientX + NEEDLE_W + SOON_GAP;
    var y = e.clientY - h / 2;
    if (x + w > window.innerWidth - 8) x = e.clientX - SOON_GAP - w;
    y = Math.max(8, Math.min(window.innerHeight - h - 8, y));
    soonpop.style.transform = "translate(" + x + "px," + y + "px)";
  }
  function wireSoon(root) {
    [].slice.call((root || document).querySelectorAll("[data-soon]")).forEach(function (el) {
      el.addEventListener("pointerenter", function (e) { moveSoon(e); if (soonpop) soonpop.classList.add("is-on"); });
      el.addEventListener("pointermove", moveSoon);
      el.addEventListener("pointerleave", function () { if (soonpop) soonpop.classList.remove("is-on"); });
      el.addEventListener("click", function (e) { e.preventDefault(); });
    });
  }
  wireSoon(document);

  /* ---------- 회원가입: 전체 동의 ---------- */

  var allBox = document.querySelector('input[name="all"]');
  if (allBox) {
    var terms = [].slice.call(document.querySelectorAll('input[name="term"]'));
    allBox.addEventListener("change", function () {
      terms.forEach(function (t) { t.checked = allBox.checked; });
    });
    terms.forEach(function (t) {
      t.addEventListener("change", function () {
        allBox.checked = terms.every(function (x) { return x.checked; });
      });
    });
  }

  /* ---------- 상세 페이지: buy it / add to cart ---------- */

  var buyRow = document.querySelector("[data-prod]");
  if (buyRow) {
    var prod = buyRow.getAttribute("data-prod");
    [].slice.call(document.querySelectorAll("[data-cart]")).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        add(prod, 1);
        if (btn.getAttribute("data-cart") === "buy") { window.location.href = "bag.html"; return; }
        /* 담기만 한 경우 — 버튼 글자로 담겼음을 알린다 */
        var was = btn.textContent;
        btn.textContent = "담았어요 ✓";
        setTimeout(function () { btn.textContent = was; }, 1400);
      });
    });
  }

  /* ---------- 장바구니 페이지 ---------- */

  var itemsBox = document.getElementById("bag-items");
  if (!itemsBox) return;

  var P = window.SORRRN_PRODUCTS || {};
  var tailBox = document.getElementById("bag-tail");
  var footBox = document.getElementById("bag-foot");
  var doc = document.getElementById("doc");
  var BASE_H = parseFloat(doc.getAttribute("data-h"));
  var totalH = BASE_H;
  /* 아이템이 늘면 문서도 그만큼 길어진다 — detail.js 는 H 를 처음 한 번만 읽는다 */
  function fitDoc() {
    doc.style.height = (totalH * (document.documentElement.clientWidth / 1440)) + "px";
  }
  window.addEventListener("resize", fitDoc);

  var STITCH = itemsBox.getAttribute("data-stitch") || "";

  function itemHTML(row, i) {
    var p = P[row.key];
    if (!p) return "";
    var dy = i * PITCH;
    var g = { basic: ["초급", "basic", "mint"], mid: ["중급", "mid", "lav"], high: ["고급", "high", "tan"] }[p.grade]
         || ["초급", "basic", "mint"];
    var o = [];
    o.push('<span class="a-stitch" style="left:88px;top:' + (364.86 + dy) + 'px;width:818px;height:24px">' + STITCH + '</span>');
    o.push('<img class="a-thumb" src="../assets/img/' + p.img + '" alt="" style="left:88px;top:' + (459.71 + dy) + 'px;width:220px;height:164.3px">');
    o.push('<p class="a-h3" style="left:336px;top:' + (420.86 + dy) + 'px">' + p.kr + '</p>');
    o.push('<p class="a-h3e" style="left:336px;top:' + (451.86 + dy) + 'px">' + p.en + '</p>');
    o.push('<span class="a-dot ' + g[2] + '" style="left:336px;top:' + (515.36 + dy) + 'px;width:8px;height:8px"></span>');
    o.push('<p class="a-body2" style="left:352px;top:' + (506.86 + dy) + 'px">' + g[0] + '</p>');
    o.push('<span class="a-dot" style="left:386px;top:' + (518.13 + dy) + 'px;width:2.45px;height:2.45px;background:var(--text-primary)"></span>');
    o.push('<p class="a-en" style="left:396.45px;top:' + (507.36 + dy) + 'px">' + g[1] + '</p>');
    o.push('<p class="a-en" style="left:336px;top:' + (563.86 + dy) + 'px">' + won(p.price) + '</p>');
    o.push('<div class="a-qty" style="left:336px;top:' + (603.86 + dy) + 'px">'
         + '<button class="minus" type="button" data-q="-1" data-k="' + row.key + '" aria-label="수량 줄이기">−</button>'
         + '<span class="v">' + row.qty + '</span>'
         + '<button class="plus" type="button" data-q="1" data-k="' + row.key + '" aria-label="수량 늘리기">+</button></div>');
    o.push('<a class="a-tbtn a-lb c-sec" style="left:843px;top:' + (615.36 + dy) + 'px" href="#" data-del="' + row.key + '">삭제하기</a>');
    return o.join("");
  }

  function render() {
    var rows = read();
    var n = rows.reduce(function (a, r) { return a + r.qty; }, 0);
    var goods = rows.reduce(function (a, r) { return a + ((P[r.key] || {}).price || 0) * r.qty; }, 0);
    var shift = Math.max(0, rows.length - 1) * PITCH;

    document.getElementById("bag-count").textContent = n;
    itemsBox.innerHTML = rows.map(itemHTML).join("");

    var added = document.getElementById("bag-added");
    var marker = document.getElementById("bag-marker");
    if (rows.length) {
      var newest = rows.reduce(function (a, r) { return (r.at || 0) > (a.at || 0) ? r : a; });
      added.textContent = dateKR(newest.at || Date.now());
      added.style.display = marker.style.display = "";
    } else {
      added.style.display = marker.style.display = "none";
    }

    document.getElementById("bag-sub-label").textContent = "상품 금액 · " + n + "개";
    document.getElementById("bag-sub").textContent = won(goods);
    document.getElementById("sum-goods-label").textContent = "상품 금액 (" + n + "개)";
    document.getElementById("sum-goods").textContent = won(goods);
    document.getElementById("sum-ship").textContent = won(n ? SHIPPING : 0);
    document.getElementById("sum-total").textContent = won(goods + (n ? SHIPPING : 0));

    tailBox.style.transform = footBox.style.transform = "translateY(" + (TAIL_BASE + shift) + "px)";
    totalH = BASE_H + shift;
    fitDoc();

    var empty = document.getElementById("bag-empty");
    if (empty) empty.style.display = rows.length ? "none" : "";

    var pay = document.getElementById("checkout");
    if (pay) pay.disabled = !n;

    wireSoon(itemsBox);
    [].slice.call(itemsBox.querySelectorAll("[data-q]")).forEach(function (b) {
      b.addEventListener("click", function () {
        var rs = read(), d = parseInt(b.getAttribute("data-q"), 10), k = b.getAttribute("data-k");
        rs.forEach(function (r) { if (r.key === k) r.qty = Math.max(1, r.qty + d); });
        write(rs); render();
      });
    });
    [].slice.call(itemsBox.querySelectorAll("[data-del]")).forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var k = a.getAttribute("data-del");
        write(read().filter(function (r) { return r.key !== k; }));
        render();
      });
    });
  }

  render();
})();
