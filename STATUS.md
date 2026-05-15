# Status | 마지막: 2026-05-15

## 현재 작업
자동 색인 파이프라인 완성. 새 포스트 발행 시 IndexNow(Bing/Naver) + Google Indexing API 자동 호출.

## 최근 변경 (최근 5개)
- 05-15: publish-next.mjs Naver IndexNow 엔드포인트 수정 + Google Indexing API 추가
- 05-15: vercel.json /feed.xml → /rss.xml 리다이렉트 추가
- 05-15: AdSlot.tsx 인터랙션 후 레이지 로드 (Best Practices 100)
- 05-15: App.tsx Suspense 폴백 min-h-screen (CLS 0.00)
- 05-15: Home.tsx/RecentBlogPosts.tsx WCAG 색상 대비 수정 (Accessibility 100)

## TODO
- [x] Vercel 배포 완료 (2026-05-15, commit 726d988)
- [x] 발행 후 자동 색인: IndexNow + Google Indexing API (2026-05-15)
- [ ] 프로덕션 PSI 재측정 (crepika.com)
- [ ] AdSense 수동 슬롯 ID — 사용자 생성 후 제공 (AdSlot의 slotId 파라미터)
- [ ] GSC에서 sitemap.xml 재제출 (현재 12페이지 → 실제 254+개)

## 결정사항
- Google Indexing API: 서비스 계정 JWT RS256 서명 (Node.js crypto 내장)
- Naver IndexNow: searchadvisor.naver.com/indexnow (기존 site/submit는 잘못된 엔드포인트)
- feed.xml: static 파일 없음 → vercel.json redirect로 rss.xml로 연결
- Best Practices 100: AdSense를 scroll/click/touchstart/keydown 후에만 로드

## 주의
- GSC 사이트맵: 2025-12-26 마지막 크롤, 12페이지만 발견 → GSC 콘솔에서 재제출 필요
- AdSense slotId 없으면 Auto Ads 플레이스홀더만 렌더링 (정상)
- Google Indexing API 서비스 계정: D:\env\cursorai-451704-85a5abbe8eeb.json
