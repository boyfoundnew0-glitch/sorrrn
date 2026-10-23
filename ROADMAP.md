# 작업 순서 (Claude Code 참고용)

Figma 프레임이 완성되는 순서대로 구현 요청 예정. 아래 순서를 기본으로 하되, 실제 디자인 완성 상태에 따라 조정 가능.

## 1단계 — 진입
- [x] `-splash` (첫 화면) — splash0 → splash1 → splash2 → splash3-1 → 3-2 → 3-3~3-8 → 3-9 → splash4 스크롤 시퀀스

## 2단계 — 상품 목록 (모션 포함)
- [x] `-shop-default` (기본 상태)
- [x] `-shop-scroll` (스크롤 인터랙션)
- [x] `-shop-hover` (호버 인터랙션)
- [x] `-shop-click` (클릭 시 전환 — click-one1~5)

## 3단계 — 상품 상세 (단계별 플로우)
- [ ] `-shop-click-one1`
- [ ] `-shop-click-one2`
- [ ] `-shop-click-one3`
- [ ] `-shop-click-one4`
- [ ] `-shop-click-one5`

## 4단계 — 카테고리별 세부 페이지
- [ ] `-shop-cate sb`
- [ ] `-shop-cate kit-basic`
- [ ] `-shop-cate kit-medium`
- [ ] `-shop-cate kit-pro`

## 5단계 — 취향 테스트
- [ ] `-explore your stitch`

## 6단계 — 브랜드 소개
- [ ] `-about sorrrn`

## 7단계 — 마무리
- [ ] 전체 페이지 간 네비게이션 연결 확인
- [ ] 반복 요소(헤더/푸터) 일관성 점검
- [ ] GitHub Pages에서 최종 확인

---

## 진행 방식
- 각 단계 완성 후 GitHub에 개별 push (한 번에 몰아서 하지 않음)
- 모션이 필요한 프레임은 "이런 느낌의 모션을 원한다"는 설명을 별도로 함께 전달할 것
- 프레임 이름이 바뀌거나 새 프레임이 추가되면 `CLAUDE.md`의 "프레임 목록" 섹션도 함께 갱신할 것
- 체크박스는 작업 진행하면서 직접 `[x]`로 표시해 진행 상황 추적
