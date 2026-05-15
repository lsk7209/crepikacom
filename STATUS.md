# Status | 마지막: 2026-05-16

## 현재 작업
전체 코드 감사 완료. 모든 페이지 SEO/스키마/메타 정상. Vercel 도메인 설정 대기 중.

## 최근 변경 (최근 5개)
- 05-16: llms-full.txt · rss.xml 날짜 갱신 (2026-05-16)
- 05-16: ai-index.json updated 날짜 갱신 (2026-05-16)
- 05-16: TooltipProvider 제거 → @radix-ui ui 청크 완전 lazy
- 05-16: react-query 제거 → vendor 번들 ~30KB 절감
- 05-16: AppShell lucide 제거 → icons 청크 완전 lazy

## TODO
- [x] Vercel 배포 완료 (2026-05-15, commit 726d988)
- [x] 발행 후 자동 색인: IndexNow + Google Indexing API (2026-05-15)
- [x] 기존 포스트 236개 /tools/ 링크 일괄 추가 (2026-05-16)
- [x] GSC sitemap.xml 재제출 — API로 자동 제출 완료, submitted: 265 (2026-05-16)
- [x] Lighthouse 측정: Performance 82, A11y 100, BP 100, SEO 100 (2026-05-16)
- [x] 코드 최적화: react-query·TooltipProvider 제거, icons·ui 청크 완전 lazy (05-16)
- [x] 전체 페이지 SEO 감사: Home·BlogList·BlogPost·About·Contact·NotFound 모두 정상 (05-16)
- [ ] Lighthouse 재측정 — 현재 배포 기준 Performance 목표 90+
- [ ] **[사용자 필수]** Vercel 대시보드 → Settings → Domains → crepika.com primary 설정 (307 리다이렉트 780ms 제거, 최대 단일 성능 향상)
- [ ] AdSense 수동 슬롯 ID — 사용자 생성 후 제공 (AdSlot의 slotId 파라미터)

## 결정사항
- Google Indexing API: 서비스 계정 JWT RS256 서명 (Node.js crypto 내장)
- Naver IndexNow: searchadvisor.naver.com/indexnow (기존 site/submit는 잘못된 엔드포인트)
- feed.xml: static 파일 없음 → vercel.json redirect로 rss.xml로 연결
- Best Practices 100: AdSense를 scroll/click/touchstart/keydown 후에만 로드

## 주의
- GSC 사이트맵: 2025-12-26 마지막 크롤, 12페이지만 발견 → GSC 콘솔에서 재제출 필요
- AdSense slotId 없으면 Auto Ads 플레이스홀더만 렌더링 (정상)
- Google Indexing API 서비스 계정: D:\env\cursorai-451704-85a5abbe8eeb.json
