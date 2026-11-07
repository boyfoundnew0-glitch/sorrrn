/* ============================================================
   sorrrn — Safari 엔진(WebKit) 회귀 점검
   전시 PC 는 Safari 다. Chrome 에서만 확인하면 Safari 에서 깨진 걸 놓친다.
   push 전(로컬)과 push 후(배포본)에 이 스크립트로 주요 동작을 한 번에 확인한다.

   준비 (한 번만):  npm i playwright && npx playwright install webkit
   실행:            node build_check/webkit_check.js http://localhost:5601
                    node build_check/webkit_check.js https://boyfoundnew0-glitch.github.io/sorrrn
   ============================================================ */
const { webkit } = require('playwright');
const BASE = (process.argv[2] || 'http://localhost:5601').replace(/\/$/, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, info) => results.push((pass ? 'PASS ' : 'FAIL ') + name + (info ? '  — ' + info : ''));
const bust = () => '?x=' + Date.now();

(async () => {
  const browser = await webkit.launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(page.url().split('/').pop() + ': ' + e.message));

  /* 1) splash · shop 셸 */
  await page.goto(BASE + '/html/combined.html' + bust(), { waitUntil: 'load' });
  await sleep(1500);
  ok('셸 로드', await page.$('#splash-pane') !== null);

  /* 2) shop: 블럭 클릭 → 카테고리 카드 */
  await page.goto(BASE + '/html/combined.html?go=shop&x=' + Date.now(), { waitUntil: 'load' });
  await sleep(3000);
  const shop = await (await page.$('#shop-pane')).contentFrame();
  const shopBox = await (await page.$('#shop-pane')).boundingBox();
  const hit = await shop.evaluate(() => { const r = document.querySelector('#blk-kitb .blk-hit').getBoundingClientRect(); return { x: r.left + r.width - 6, y: r.top + 6 }; });
  await page.mouse.click(shopBox.x + hit.x, shopBox.y + hit.y);
  await sleep(1500);
  ok('shop 블럭 클릭 → 카드', await shop.evaluate(() => document.getElementById('card-kitb').classList.contains('is-on')));

  /* 3) kit basic 목록: 카드 호버 → 도형이 천천히 커짐 */
  await page.goto(BASE + '/html/kitbasic.html' + bust(), { waitUntil: 'load' });
  await sleep(800);
  await page.evaluate(() => document.querySelector('a.card').scrollIntoView({ block: 'center' }));
  await sleep(500);
  ok('목록 도형: 호버 전 흔적 없음', await page.evaluate(() => getComputedStyle(document.querySelector('a.card .plate')).opacity === '0'));
  const cb = await page.locator('a.card').first().boundingBox();
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await sleep(200);
  const early = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('a.card .plate')).transform).a);
  await sleep(1700);
  const late = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('a.card .plate')).transform).a);
  ok('목록 호버 도형 모션', early > 0.01 && early < 0.6 && late > 0.95, 'scale 0.2s=' + early.toFixed(3) + ' / 1.9s=' + late.toFixed(3));
  ok('목록 하단 MENU', await page.evaluate(() => { const m = document.getElementById('menu-about'); return !!m && m.getBoundingClientRect().bottom <= innerHeight + 1 && /go=about/.test(m.getAttribute('href')); }));
  const st = await page.locator('#menu-stitch').boundingBox();
  await page.mouse.move(st.x + st.width / 2, st.y + st.height / 2);
  await sleep(300);
  ok('explore your stitch → see you soon', await page.evaluate(() => document.getElementById('soonpop').classList.contains('is-on')));

  /* 4) 상세: MENU · how to sewing 슬라이드 · kit 블럭 링크 */
  await page.goto(BASE + '/html/detail-book.html' + bust(), { waitUntil: 'load' });
  await sleep(800);
  ok('상세 하단 MENU', await page.$('#menu-about') !== null);
  ok('상세 kit 블럭 → 목록', await page.evaluate(() => document.querySelector('a.h1grp').getAttribute('href') === 'kitbasic.html'));
  await page.evaluate(() => document.querySelector('.ht-nav.next').scrollIntoView({ block: 'center' }));
  await sleep(500);
  const nb = await page.locator('.ht-nav.next').boundingBox();
  await page.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
  await sleep(900);
  const left = await page.evaluate(() => getComputedStyle(document.querySelector('.ht-track')).left);
  ok('책갈피 슬라이드 ▶', Math.abs(parseFloat(left) + 267.1) < 1, 'left=' + left);

  /* 5) about (셸 안): 이미지 이음매 · 명함 플립 · 땡스 팝업 */
  await page.goto(BASE + '/html/combined.html?go=about&x=' + Date.now(), { waitUntil: 'load' });
  await sleep(3000);
  const ab = await page.$('#about-pane');
  const af = await ab.contentFrame();
  const abBox = await ab.boundingBox();
  const seamY = await af.evaluate(async () => {
    const imgs = document.querySelectorAll('.strip img'); imgs[2].scrollIntoView({ block: 'center' });
    await new Promise(r => setTimeout(r, 1500));
    return imgs[3].getBoundingClientRect().top;
  });
  const shot = await page.screenshot({ clip: { x: abBox.x + 560, y: abBox.y + seamY - 6, width: 600, height: 12 } });
  const { PNG } = (() => { try { return require('pngjs'); } catch (e) { return {}; } })();
  if (PNG) {
    const png = PNG.sync.read(shot); let worst = 255, base = 0, n = 0;
    for (let y = 0; y < png.height; y++) {
      let sum = 0; for (let x = 0; x < png.width; x += 5) { const i = (y * png.width + x) * 4; sum += (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3; }
      const avg = sum / Math.ceil(png.width / 5); worst = Math.min(worst, avg); base += avg; n++;
    }
    ok('about 이미지 이음매 없음', base / n - worst < 25, '행 평균 밝기 ' + (base / n).toFixed(0) + ' / 가장 어두운 행 ' + worst.toFixed(0));
  } else ok('about 이미지 이음매 (pngjs 없음 — 건너뜀)', true);

  const cc = await af.evaluate(async () => {
    const c = document.querySelector('.card3d'); c.scrollIntoView({ block: 'center' });
    await new Promise(r => setTimeout(r, 900)); const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(abBox.x + 40, abBox.y + 40);
  await sleep(900);
  ok('명함: 호버 전 뒷면 흔적(세로선) 없음', await af.evaluate(() => getComputedStyle(document.querySelector('.card3d .back')).opacity === '0'));
  await page.mouse.move(abBox.x + cc.x, abBox.y + cc.y, { steps: 10 });
  await sleep(1100);
  const flip = await af.evaluate(() => [new DOMMatrix(getComputedStyle(document.querySelector('.card3d .front')).transform).a,
                                       new DOMMatrix(getComputedStyle(document.querySelector('.card3d .back')).transform).a]);
  ok('about 명함 플립', flip[0] < 0.05 && flip[1] > 0.95, 'front=' + flip[0].toFixed(3) + ' back=' + flip[1].toFixed(3));
  ok('명함: 뒤집힌 뒤 앞면 흔적(세로선) 없음', await af.evaluate(() => getComputedStyle(document.querySelector('.card3d .front')).opacity === '0'));

  const nm = await af.evaluate(async () => {
    const el = document.querySelector('[data-pop="mom"]'); el.scrollIntoView({ block: 'center' });
    await new Promise(r => setTimeout(r, 600)); const r = el.getBoundingClientRect(); return { x: r.left + 10, y: r.top + r.height / 2 };
  });
  await page.mouse.move(abBox.x + nm.x - 60, abBox.y + nm.y);
  await page.mouse.move(abBox.x + nm.x, abBox.y + nm.y, { steps: 5 });
  await sleep(400);
  ok('땡스 투 팝업', await af.evaluate(() => { const p = document.getElementById('thankpop'); return p.classList.contains('is-on') && getComputedStyle(p).opacity > 0.9; }));
  const gr = await af.evaluate(() => { const g = document.querySelectorAll('.graphic'); return new DOMMatrix(getComputedStyle(g[g.length - 1].querySelector('i')).transform).a; });
  ok('about 그래픽 원(스크롤 등장)', gr > 0.95, 'scale=' + gr.toFixed(3));

  ok('스크립트 오류 없음', errors.length === 0, errors.join(' | '));
  console.log('WebKit ' + browser.version() + '  ' + BASE + '\n' + results.join('\n'));
  await browser.close();
  process.exit(results.some(r => r.startsWith('FAIL')) ? 1 : 0);
})().catch(e => { console.error('CHECK CRASHED', e); process.exit(2); });
