# 소르른 (sorrrn) 웹사이트 프로젝트

## 프로젝트 개요
- 핸드메이드 취미 키트 브랜드 "소르른" 공식 웹사이트
- 성신여자대학교 시각디자인스튜디오 졸업 프로젝트
- 데스크탑 전용 구축 (모바일 반응형 없음)
- 키트 카테고리 6종: Basic, Stitch Book, Embroidery, Felt, Quilt, Machine Sewing
- 모션 설명은 ROADMAP.md 및 피그마 섹션 안의 설명 텍스트를 따른다

---

## Figma 연결 규칙 (가장 먼저 읽을 것)

- 파일: https://www.figma.com/design/TBZOn2Ygpr1vO7ZRtACUKC/
- **노드 ID를 사용자에게 묻지 않는다.** 사용자는 "페이지명 / 섹션명 / 프레임명"으로 지시한다.
- 찾는 순서
  1. `get_metadata`(fileKey만) → 페이지 목록
  2. 해당 페이지의 섹션·프레임 이름 조회 (결과가 너무 크면 `use_figma`로 최상위 2단계의 이름·ID만 뽑는 읽기 전용 스크립트 사용)
  3. 이름이 정확히 일치하는 노드 사용. 같은 이름이 여러 개면 후보(섹션명·위치)를 보여주고 묻는다.
- 찾은 이름↔ID는 `docs/figma-map.md`에 캐시한다. 이름으로 못 찾으면 캐시를 버리고 다시 조회한다.
- 아래 "프레임 맵"은 참고용 스냅샷이다. 실제 피그마와 다르면 **피그마가 우선**이다.
- 프레임 상태 규칙
  - `-default` 프레임 = 구현 대상
  - `-hover&selected` 프레임 = 상태 구현 결과를 시각 비교하는 용도 (별도 페이지로 만들지 않는다)
- 섹션 안의 설명 텍스트(모션·인터랙션 설명)는 해당 프레임 구현 스펙으로 읽는다.

## 디자인 가이드 (원본은 피그마)

- 위치: 페이지 **"가이드"** / 섹션 **"브랜드 가이드 v 1.00"**
  - 프레임: `01_Color_System`, `02_Typography`, `03_Design_Tokens`, `04_UI_Components`
- PDF를 요구하지 않는다. 사용자가 "가이드 수정했어"라고 하면:
  1. 위 4개 프레임을 하나씩 읽는다 (섹션 전체를 한 번에 읽지 않는다)
  2. `docs/design-guide.md`와 비교해 바뀐 항목만 먼저 보고한다
  3. 확인을 받은 뒤 `docs/design-guide.md`와 `src/styles/tokens.css`를 갱신한다
- 우선순위: **가이드 문구 > 가이드 샘플 > 디자인 프레임의 시각값**
  - 서로 다르면 멈추지 말고 충돌 목록을 보고한 뒤 가이드 문구 기준으로 진행한다.
- 피그마 컬러·텍스트 스타일 이름과 CSS 변수의 대응은 아래 표를 따른다.

---

## 디자인 토큰 — CSS 변수 (하드코딩 금지, 이 이름 그대로 사용)

```css
/* BACKGROUND */                 /* 피그마 스타일 */
--bg-base: #FFFCF6;              /* 배경/Base */
--bg-surface: #F0EBE1;           /* 배경/Surface */
--bg-dark: #33251A;              /* 배경/Dark */
--bg-white: #FFFFFF;             /* 배경/white (내비게이션 바, 상품 카드) */

/* TEXT */
--text-primary: #33251A;         /* 텍스트/Primary */
--text-secondary: #6F6258;       /* 텍스트/Secondary — 보조 설명, (명시 시) 선택 상태 */
--text-muted: #8E8278;           /* 텍스트/Muted — 비활성, 플레이스홀더 */
--text-inverse: #FFFCF6;         /* 텍스트/Inverse — bg-dark 위 텍스트 */
--text-valid: #52D34D;           /* 텍스트/valid */
--text-invalid: #FF3800;         /* 텍스트/invalid */

/* BORDER */
--border-default: #6F6258;       /* 선/default — 인풋·카드·구분선·버튼 기본 */
--border-strong: #B6ABA3;        /* 선/Strong — 강조 구분선 */
--border-focus: #CEC3B9;         /* 선/focus — 포커스·선택·호버 상태 */

/* ACCENT */
--accent-mint: #A1DFB2;          /* 포인트/Mint */
--accent-lavender: #A285C2;      /* 포인트/Lavender */
--accent-tangerine: #FF5424;     /* 포인트/Tangerine */

/* ICON */
--icon-default: #33251A;         /* 아이콘/default */
--icon-selected: #8E8278;        /* 아이콘/selected */
--icon-complete: #52D34D;        /* 아이콘/complete */
--icon-error: #FF3800;           /* 아이콘/error */
```

- 피그마 노드가 `팔레트/…` 스타일을 직접 쓰고 있으면 같은 HEX의 시맨틱 변수로 바꿔 쓴다.
  예외: 인풋 안 8px 원형 도트 = 팔레트/Wood Gray(#8E8278) → `--icon-selected`와 같은 값이지만 의미상 별도이므로 `--input-dot: var(--text-muted);`로 정의해 사용
- 테두리에는 `--border-*`만, 텍스트에는 `--text-*`만 쓴다 (값이 같아도 다른 계열 변수를 쓰지 않는다).

## 타이포그래피 — 피그마 텍스트 스타일 기준

- 영문: Outfit / 국문: Noto Sans KR (Google Fonts, fonts.googleapis.com)

| 스타일 | 폰트 | 크기 | 행간 | 자간 |
|---|---|---|---|---|
| 영문/Display | Outfit Bold | 56px | 1.05 | -2% |
| 영문/H1 | Outfit Bold | 40px | 1.15 | -1% |
| 영문/H2 | Outfit Bold | 24px | 1.2 | 0 |
| 영문/H3 | Outfit Medium | 20px | 1.3 | 0 |
| 영문/Body | Outfit Medium | 17px | 1.6 | 0 |
| 영문/Label | Outfit Medium | 14px | 1.2 | 3% |
| 국문/H1 | Noto Sans KR Bold | 40px | 1.15 | 0 |
| 국문/H2 | Noto Sans KR Bold | 24px | 1.2 | 0 |
| 국문/H3 | Noto Sans KR Medium | 20px | 1.5 | 0 |
| 국문/Body | Noto Sans KR Regular | 16px | 1.8 | -2% |
| 국문/Body 2 | Noto Sans KR Medium | 16px | 1.8 | -2% |
| 국문/Label | Noto Sans KR Medium | 12px | 1.5 | -2% |
| 국문/Caption | Noto Sans KR Medium | 11px | 1.5 | -2% |

- 위 값을 `--font-*` 유틸리티 클래스(또는 변수)로 만들어 쓰고, 프레임에서 읽은 텍스트 스타일 이름에 맞춰 적용한다.

---

## UI 컴포넌트 상태 규칙 (가이드 04 요약)

모든 버튼: radius 50 / transition 200ms ease-out (`all` 대신 속성을 개별 지정) / Active 시 scale 0.98

| 버튼 | Default | Hover | Active | Disabled |
|---|---|---|---|---|
| Primary solid | bg `--bg-dark`, text `--text-inverse`, 테두리 없음, pad 12px 24px | bg opacity 0.85 | bg opacity 0.70 | bg `--bg-surface`, text `--text-muted`, cursor not-allowed |
| Primary border | bg `--bg-base`, text `--text-primary`, border 1.5px `--border-default` | border 1.5px `--border-focus`, text `--text-secondary` | Hover와 동일 | bg `--bg-surface`, 테두리 없음, text `--text-muted`, cursor not-allowed |
| Primary text | 배경·테두리 없음, text `--text-primary` | 텍스트 아래 4px에 `--accent-mint` 사각형 (W = 텍스트 폭 × 1.4, H 1px) | bg opacity 0.75 | text `--text-muted`, cursor not-allowed |

- 인풋: height 44px / radius 5·50·5·5 (우상단만 50) / border 1px `--border-default` / focus `--border-focus` / placeholder `--text-muted` / 좌측 8px 원형 도트(`--input-dot`, 텍스트와 12px 간격)
  - 유효: 도트 `--icon-complete`, 텍스트 `--text-primary` / 무효: 도트 `--icon-error`, 텍스트 `--text-invalid`
- 상품 카드: bg `--bg-white` / border 1px `--border-default` / radius 4px / 이미지 1:1 또는 3:4 / Hover scale(1.02), transition 250ms ease-out, 텍스트 `--text-secondary`
- 등급 태그: 8×8 원형(초급 mint / 중급 lavender / 고급 tangerine) + 텍스트, 배경·테두리 없음
- 내비게이션 바: height 64px / bg `--bg-white` / border-bottom 1px `--border-default` / 로고 SVG / 링크 Outfit Medium 13px
  - 현재 페이지 링크: `--text-secondary` + 아래 accent 사각형(W = 텍스트 폭, H 1px)
- 아이콘: inline SVG, 획 두께 1.7px 고정, 텍스트와 나란히 쓸 때 간격 12px, 크기는 가이드 04에 표기된 W×H 그대로
- 키트 카테고리 심볼 6종: 가이드 04 "Kit Category Tags" 노드에서 SVG로 export해 inline으로 사용. **표기된 W×H 외의 크기·비율 변경 금지**

---

## 레이아웃·화면 원칙

1. 수정 요청이 오면 Figma MCP로 해당 프레임을 먼저 읽고 확인한 뒤 코드에 반영한다.
2. 캔버스 폭 1440px 기준. 레이아웃 수치(여백, 크기, 위치)는 **피그마 프레임 값 그대로** 쓴다. 피그마에 없는 여백·크기를 임의로 만들지 않는다.
3. 프레임 높이에 따른 구분
   - 높이 810px 프레임 = 한 화면 고정(세로 스크롤 없음). 스크롤 인터랙션이 명시된 프레임은 예외.
   - 높이가 810px보다 큰 프레임(상세페이지, 장바구니, 로그인 등) = 일반 세로 스크롤 페이지
4. 화면 크기 대응: 1440px 기준 스테이지를 뷰포트 폭에 맞춰 `transform: scale()`로 비율 축소/확대한다 (scale = 뷰포트 폭 / 1440). 레이아웃 수치 자체는 바꾸지 않는다.
   - 전시 환경: 21.5" iMac (1920×1080 FHD), 브라우저 전체화면 → 배율 1.333, 1440×810 프레임이 화면에 정확히 맞는다.
5. **MENU 그룹 고정**: MENU는 `position: fixed`로 화면에 고정하고, 페이지 스크롤과 무관하게 같은 위치에 둔다. 위치·크기는 `frame design-splash&shop`, `frame design-shop` 섹션의 프레임 값을 따른다. 다른 콘텐츠보다 위(z-index 최상위)에 둔다.
6. arc 패턴, 키트 심볼, 아이콘은 이미지 파일이 아닌 inline SVG로 구현한다.
7. 모션은 ROADMAP.md 또는 피그마 섹션 설명에 있는 것만 구현한다. 설명 없는 모션을 임의로 추가하지 않는다.
8. Accent 3색(Mint, Lavender, Tangerine)은 Oatmeal 배경 위 본문 텍스트 색으로 쓰지 않는다 (대비 최대 2.9:1). 그 외 용도는 피그마 프레임을 따른다.

---

## 프레임 맵 (2026-10-10 스냅샷 — 피그마가 우선)

페이지 **"웹"**
- `frame design-splash&shop`: (주의: `-splash2`가 2개 — 250:19653, 451:35145. 지시에 섹션 내 위치나 ID가 없으면 묻는다) -splash0, -splash1, -splash2, -splash2-guide(arc 트랙 모션 방향 참고용), -splash3-1 ~ -splash3-6, -splash3-9, -splash4
- `frame design-shop`: -shop-default, -shop-scroll, -shop-hover, -shop-click-all, -shop-click-one1 ~ -shop-click-one5
- `frame design-shop-detail`
  - 카테고리: -shop-detail-kitbasic / kitmid / kithigh (-default, -hover&selected)
  - 상품 상세: -shop-detail-pincushion / hanger / tea / quilt / scissorspouch / lantern -default
  - 장바구니: -shop-shoppingbag(-hanger, -tea) (-default, -hover&selected)
  - 계정: -account-login, -account-join (-default, -hover&selected)
- `frame design-explore your stitch`: -explore your stitch
- `frame design-about sorrrn`: -about sorrrn
- `cate moving`: 카테고리명 컴포넌트의 default / selected / move 단계 (모션 스펙 텍스트 포함)

---

## 배포
- GitHub repo: https://github.com/boyfoundnew0-glitch/sorrrn
- GitHub Pages: https://boyfoundnew0-glitch.github.io/sorrrn/
- 페이지 단위로 완성될 때마다 개별 push (한 번에 전체 push 지양)
