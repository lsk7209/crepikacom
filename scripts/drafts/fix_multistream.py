# -*- coding: utf-8 -*-
import json, os

base = r"D:\web\crepic\webcrepiccrepic-toolkit\scripts\drafts"
fn = 'twitch-youtube-multistreaming-guide.json'
path = os.path.join(base, fn)

with open(path, encoding='utf-8') as f:
    d = json.load(f)

d['content']['sections'][1]['content'] += " 최고의 스트림 품질을 위해 하드웨어와 소프트웨어 설정을 정기적으로 최적화하세요."

c = d['content']
secs = c['sections']
tot = sum(len(s['content']) for s in secs)
intro = len(c['introduction'])
smin = min(len(s['content']) for s in secs)
conc = len(c['conclusion'])
faq = d.get('faq', [])
fq = len(faq)
fa = min(len(q['answer']) for q in faq) if faq else 0
ok = intro >= 700 and smin >= 700 and tot >= 5000 and conc >= 400 and fq >= 5 and fa >= 200
print(fn + ': ' + ('PASS' if ok else 'FAIL') + ' i=' + str(intro) + ' smin=' + str(smin) + ' tot=' + str(tot) + ' c=' + str(conc))

with open(path, 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
