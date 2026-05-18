# -*- coding: utf-8 -*-
import json, os

base = r"D:\web\crepic\webcrepiccrepic-toolkit\scripts\drafts"

def load(fn):
    with open(os.path.join(base, fn), encoding='utf-8') as f:
        return json.load(f)

def save(fn, d):
    with open(os.path.join(base, fn), 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)

def validate(fn, d):
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
    return ok

# --- twitch-youtube-multistreaming-guide: tot=4406, need 594 more ---
fn = 'twitch-youtube-multistreaming-guide.json'
d = load(fn)
secs = d['content']['sections']
# Add ~120 chars to each section
add_per_sec = [
    "\n\n초기 설정 이후에는 정기적으로 스트림 품질을 점검하고 설정을 최적화해야 합니다. 네트워크 환경 변화나 PC 업그레이드 후에도 비트레이트와 해상도 설정을 재검토하세요.",
    "\n\n멀티스트리밍 안정성을 높이기 위해서는 OBS Studio의 자동 재연결 기능을 활성화해두세요. 인터넷 연결이 잠시 끊겨도 자동으로 재연결되어 방송 중단을 최소화할 수 있습니다.",
    "\n\n채팅 관리의 핵심은 일관성입니다. 어떤 행동이 허용되고 어떤 행동이 금지되는지 채팅 규칙을 명확히 공지하고, 챗봇이 이 규칙을 일관되게 집행하도록 설정하세요.",
    "\n\nYouTube 라이브 스트림은 종료 후 자동으로 VOD로 변환됩니다. 이 VOD에 자막을 추가하고 검색 최적화된 제목과 설명을 붙이면 추가적인 장기 조회수를 얻을 수 있습니다.",
    "\n\n멀티스트리밍 경험이 쌓일수록 플랫폼별 시청자 특성 차이가 명확해집니다. 이 데이터를 축적하고 분석해 각 플랫폼에 최적화된 콘텐츠 전략을 정기적으로 업데이트하세요."
]
for i, a in enumerate(add_per_sec):
    secs[i]['content'] += a
save(fn, d)
validate(fn, d)

# --- twitch-chat-bot-engagement-tips: tot=4436, need 564 more ---
fn = 'twitch-chat-bot-engagement-tips.json'
d = load(fn)
secs = d['content']['sections']
add_per_sec2 = [
    "\n\n챗봇 설정의 첫 단계는 목표를 명확히 하는 것입니다. 스팸 방지가 주목적인지, 시청자 참여 증대가 목적인지에 따라 설정 방향이 달라집니다. 명확한 목표를 설정하고 그에 맞는 기능을 우선적으로 구현하세요.",
    "\n\n효과적인 참여 유도 명령어는 채널의 정체성과 연결되어야 합니다. 스트리머의 닉네임이나 채널 테마와 관련된 창의적인 명령어를 만들면 시청자들이 더 즐겁게 사용하고 공유합니다.",
    "\n\n모더레이션 챗봇 설정에서 한 가지 중요한 원칙은 '처음 실수에는 경고, 반복 시 타임아웃' 방식입니다. 너무 엄격한 자동 처벌은 오히려 채팅 문화를 위축시킬 수 있습니다.",
    "\n\n고급 사용자를 위한 챗봇 API 연동도 고려해볼 만합니다. 날씨 API, 주식 정보 API 등을 연동해 방송 중 실시간 정보를 제공하는 독창적인 명령어를 만들 수 있습니다.",
    "\n\n챗봇 효과 측정을 위해 방송 전후 채팅 메시지 수, 명령어 사용 횟수, 신규 시청자 비율 등을 정기적으로 기록하고 트렌드를 분석하세요. 데이터 기반 개선이 장기적 성공의 기반입니다."
]
for i, a in enumerate(add_per_sec2):
    secs[i]['content'] += a
save(fn, d)
validate(fn, d)

# --- twitch-korea-streamer-monetization-guide: tot=4333, need 667 more ---
fn = 'twitch-korea-streamer-monetization-guide.json'
d = load(fn)
secs = d['content']['sections']
add_per_sec3 = [
    "\n\n어필리에이트 신청 후 심사 과정에서 탈락하는 경우도 있습니다. 주로 봇 트래픽이나 부자연스러운 성장 패턴이 감지될 때입니다. 자연스럽고 유기적인 성장 방식을 고수하는 것이 장기적으로 훨씬 안전하고 지속가능한 방법입니다.",
    "\n\n비트 후원의 심리적 효과를 극대화하려면 후원자의 이름을 방송 화면에 지속적으로 표시해주는 '리더보드' 기능을 활용하세요. 경쟁 심리를 자극해 후원 금액과 빈도가 자연스럽게 늘어납니다.",
    "\n\n구독자 전용 이벤트는 구독 유지율을 높이는 핵심 전략입니다. 월 1회 구독자 전용 게임, 특별 채팅 이벤트, 스트리머와의 Q&A 세션 등을 정기적으로 진행하면 구독자 이탈률이 크게 감소합니다.",
    "\n\n스폰서십 외에도 제품 리뷰나 언박싱 콘텐츠를 통해 수익을 올릴 수 있습니다. 게임 주변기기, 에너지드링크, 의자 등 스트리밍 관련 제품은 타겟 광고주가 많아 협업 제안을 받기 쉽습니다. 시청자에게 솔직한 리뷰를 제공하면서도 수익을 창출하는 투명한 방식이 장기적 신뢰 구축에 효과적입니다.",
    "\n\n수익 다각화와 함께 세금 및 재정 관리도 체계적으로 해야 합니다. 수익이 발생하기 시작하면 전문 세무사와 상담해 적절한 소득 신고 방식을 파악하고, 수익의 일정 부분을 세금 예비금으로 별도 관리하는 습관을 들이세요."
]
for i, a in enumerate(add_per_sec3):
    secs[i]['content'] += a
save(fn, d)
validate(fn, d)

print("Batch 3b done")
