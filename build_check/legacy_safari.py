# -*- coding: utf-8 -*-
"""예전 Safari(전시 iMac A1418 — macOS 상한 때문에 Safari 14~15대)에서도 CSS 가 버려지지 않게 바꾼다.

1) 선택자 묶음 안에 :focus-visible 이 있으면 예전 Safari(15.4 미만)는 그 규칙 '전체'를 버린다.
   → `.a:hover x, .a:focus-visible x {…}` 를 `.a:hover x {…}` 와 `.a:focus-visible x {…}` 두 규칙으로 나눈다.
2) inset 속성(Safari 14.1 미만 미지원) → top / right / bottom / left 로 풀어 쓴다.
3) flex gap(Safari 14.1 미만 미지원) → 자식 사이 margin-left 로 바꾼다 (FLEX_GAP 목록).

여러 번 돌려도 결과가 같다(이미 바뀐 곳은 건드리지 않음).
사용: python3 build_check/legacy_safari.py   → css/*.css 와 html/combined.html 셸 스타일을 고친다.
"""
import io, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def split_focus_visible(css):
    out = []; pos = 0
    for m in re.finditer(r'([^{}]*)\{([^{}]*)\}', css):
        head, body = m.group(1), m.group(2)
        # head 앞쪽의 주석·공백은 그대로 두고 실제 선택자만 본다
        cm = list(re.finditer(r'/\*.*?\*/', head, re.S))
        lead = head[:cm[-1].end()] if cm else ''
        sel = head[len(lead):]
        parts = [p.strip() for p in sel.split(',')]
        # :focus-visible 과 일반 선택자가 섞여 있을 때만 나눈다 (focus-visible 끼리만 묶인 건 그대로)
        if (len(parts) > 1 and any(':focus-visible' in p for p in parts)
                and any(':focus-visible' not in p for p in parts) and not sel.strip().startswith('@')):
            ws = re.match(r'\s*', sel).group(0)
            normal = [p for p in parts if ':focus-visible' not in p]
            fv = [p for p in parts if ':focus-visible' in p]
            new = lead + ws + ', '.join(normal) + ' {' + body + '}\n' + ws.lstrip('\n') + ', '.join(fv) + ' {' + body + '}'
            out.append(css[pos:m.start()]); out.append(new); pos = m.end()
    out.append(css[pos:])
    return ''.join(out)

def expand_inset(css):
    def rep(m):
        v = m.group(1).split()
        t, r, b, l = (v * 4)[:4] if len(v) == 1 else (v[0], v[1], v[0], v[1]) if len(v) == 2 else \
                     (v[0], v[1], v[2], v[1]) if len(v) == 3 else v[:4]
        return 'top: %s; right: %s; bottom: %s; left: %s;' % (t, r, b, l)
    return re.sub(r'(?<![-\w])inset:\s*([^;}{]+?)\s*;', rep, css)

# (파일, 컨테이너 선택자, 간격) — flex gap 을 자식 margin-left 로
FLEX_GAP = [
    ('css/detail.css', '.nav-left', '36px'), ('css/detail.css', '.nav-right', '32px'),
    ('css/detail.css', '.f-mail', '10px'),
    ('css/shop.css', '.nav-left', '36px'), ('css/shop.css', '.nav-right', '32px'),
    ('css/splash.css', '.scrollit', '24px'),
]

def fix_gap(css, sel, gap):
    pat = re.compile(r'(' + re.escape(sel) + r'\s*\{[^}]*?)\s*gap:\s*' + re.escape(gap) + r';')
    if not pat.search(css):
        return css
    css = pat.sub(r'\1', css, count=1)
    rule = '%s > * + * { margin-left: %s; }   /* flex gap 대신 (Safari 14.1 미만 대응) */' % (sel, gap)
    # 컨테이너 규칙 바로 뒤에 넣는다
    m = re.search(re.escape(sel) + r'\s*\{[^}]*\}', css)
    return css[:m.end()] + '\n' + rule + css[m.end():]

def fix_css_text(css, gaps=()):
    css = split_focus_visible(css)
    css = expand_inset(css)
    css = re.sub(r'(display:\s*flex;\s*flex-direction:\s*column;)\s*gap:\s*0;', r'\1', css)  # gap 0 은 불필요
    for sel, gap in gaps:
        css = fix_gap(css, sel, gap)
    return css

if __name__ == '__main__':
    for f in sorted(glob.glob(os.path.join(ROOT, 'css/*.css'))):
        rel = os.path.relpath(f, ROOT)
        s = io.open(f, encoding='utf-8').read()
        n = fix_css_text(s, [(sel, g) for ff, sel, g in FLEX_GAP if ff == rel])
        if n != s:
            io.open(f, 'w', encoding='utf-8').write(n); print('fixed', rel)
    # 셸(combined.html) 자체 스타일 — 첫 <style> 블럭만 (DOC 들은 sync 스크립트가 css 에서 다시 만든다)
    p = os.path.join(ROOT, 'html/combined.html')
    s = io.open(p, encoding='utf-8').read()
    a = s.index('<style>'); b = s.index('</style>', a)
    shell = s[a:b]
    n = fix_css_text(shell, [('.scrollit', '24px')])
    if n != shell:
        io.open(p, 'w', encoding='utf-8').write(s[:a] + n + s[b:]); print('fixed html/combined.html (shell style)')
