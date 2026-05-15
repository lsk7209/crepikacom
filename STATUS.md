# Status | 마지막: 2026-05-16

## 현재 작업
Performance 최적화 완료 (lazy loading). Vercel 배포 중 — 측정 대기.

## 최근 변경 (최근 5개)
- 05-16: Home.tsx RecentBlogPosts lazy load → 179KB blog-posts-meta 초기 렌더 제외
- 05-16: App.tsx Toaster/Sonner/KeyboardShortcutsModal lazy load + GA4 defer
- 05-16: blog-content.ts 236개 포스트 /tools/ 링크 + E-E-A-T 신호 일괄 추가
- 05-16: scripts/improve-posts.mjs 배치 개선 스크립트 추가
- 05-15: AdSlot.tsx 인터랙션 후 레이지 로드 (Best Practices 100)

## TODO
- [x] Vercel 배포 완료 (2026-05-15, commit 726d988)
- [x] 발행 후 자동 색인: IndexNow + Google Indexing API (2026-05-15)
- [x] 기존 포스트 236개 /tools/ 링크 일괄 추가 (2026-05-16)
- [x] GSC sitemap.xml 재제출 — API로 자동 제출 완료, submitted: 265 (2026-05-16)
- [x] Lighthouse 측정: Performance 82, A11y 100, BP 100, SEO 100 (2026-05-16)
- [x] Lazy load: GA4, Toaster, Sonner, KeyboardShortcutsModal, RecentBlogPosts (05-16)
- [ ] Lighthouse 재측정 — lazy loading 배포 후 Performance 90+ 목표
- [ ] Vercel 대시보드: crepika.com을 primary domain으로 설정 (현재 www→non-www 307 리다이렉트 780ms 낭비)
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
