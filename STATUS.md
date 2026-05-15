# Status | 마지막: 2026-05-16

## 현재 작업
pingSearchEngines 수정 완료. 드래프트 264개 평균 94점 (90점+ 88%). 발행 자동화 준비 완료.

## 최근 변경 (최근 5개)
- 05-16: auto-scheduler.mjs — Naver IndexNow 엔드포인트 수정 + Google Indexing API 추가
- 05-16: CLS 수정 — contain-intrinsic-size: auto 400px (index.css)
- 05-16: CLS 수정 — Suspense skeleton fallback 추가 (Home.tsx RecentBlogPosts)
- 05-16: TooltipProvider 제거 → @radix-ui ui 청크 완전 lazy
- 05-16: react-query 제거 → vendor 번들 ~30KB 절감

## TODO
- [x] Vercel 배포 완료 (2026-05-15, commit 726d988)
- [x] 발행 후 자동 색인: IndexNow + Google Indexing API (2026-05-15)
- [x] 기존 포스트 236개 /tools/ 링크 일괄 추가 (2026-05-16)
- [x] GSC sitemap.xml 재제출 — API로 자동 제출 완료, submitted: 265 (2026-05-16)
- [x] Lighthouse 측정: Performance 82, A11y 100, BP 100, SEO 100 (2026-05-16)
- [x] 코드 최적화: react-query·TooltipProvider 제거, icons·ui 청크 완전 lazy (05-16)
- [x] 전체 페이지 SEO 감사: Home·BlogList·BlogPost·About·Contact·NotFound 모두 정상 (05-16)
- [x] CLS 0.431 수정: contain-intrinsic-size auto + Suspense skeleton (05-16)
- [ ] **배포 후** https://pagespeed.web.dev/ 에서 재측정 — CLS < 0.1, Performance 90+ 목표
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
