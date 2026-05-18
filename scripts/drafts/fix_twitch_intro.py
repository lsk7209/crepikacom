# -*- coding: utf-8 -*-
import json, os

base = r"D:\web\crepic\webcrepiccrepic-toolkit\scripts\drafts"
fn = 'twitch-donation-system-comparison.json'
path = os.path.join(base, fn)

with open(path, encoding='utf-8') as f:
    d = json.load(f)

extra = " Twitch 방송을 통해 수익을 창출하려는 스트리머라면 어떤 후원 시스템이 자신에게 가장 적합한지 꼼꼼히 비교하고 선택하는 것이 중요합니다."
d['content']['introduction'] += extra

c = d['content']
secs = c['sections']
intro = len(c['introduction'])
conc = len(c['conclusion'])
smin = min(len(s['content']) for s in secs)
tot = sum(len(s['content']) for s in secs)
faq = d.get('faq', [])
fq = len(faq)
fa = min(len(q['answer']) for q in faq) if faq else 0
ok = intro >= 700 and smin >= 700 and tot >= 5000 and conc >= 400 and fq >= 5 and fa >= 200
status = 'PASS' if ok else 'FAIL'
print(f"{fn}: {status} i={intro} smin={smin} tot={tot} c={conc} fq={fq} fa={fa}")

with open(path, 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
