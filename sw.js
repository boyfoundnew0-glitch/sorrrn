/* ============================================================
   sorrrn — 항상 최신 페이지를 띄우는 서비스 워커
   GitHub Pages 는 HTML 을 10분 캐시하고(Cache-Control: max-age=600) 서버 설정을
   바꿀 수 없다. Safari 는 그보다 오래 들고 있기도 해서 배포 직후에도 예전 화면이 보였다.

   · 페이지(HTML)와 CSS·JS 는 브라우저 캐시를 건너뛰고 항상 서버에서 새로 받는다.
   · 네트워크가 끊기면 브라우저가 가진 사본으로 대신 띄운다 (전시장 회선 대비).
   · 이미지·폰트 등은 손대지 않는다 (용량이 커서 평소 캐시를 그대로 쓴다).
   ============================================================ */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var isPage = req.mode === "navigate" || /\.html?$/.test(url.pathname) || url.pathname.slice(-1) === "/";
  var isCode = /\.(css|js)$/.test(url.pathname) && url.pathname.slice(-6) !== "/sw.js";
  if (!isPage && !isCode) return;

  /* navigate 요청은 옵션을 붙여 다시 만들 수 없는 브라우저가 있어 주소로 새로 요청한다 */
  e.respondWith(
    fetch(req.url, { cache: "no-store", credentials: "same-origin" })
      .then(function (res) { return res.ok || res.status === 404 ? res : fetch(req); })
      .catch(function () { return fetch(req); })
  );
});
