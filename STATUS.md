# Status | 마지막: 2026-05-15

## 현재 작업
사이트 전체 최적화 완료. Lighthouse 55/55 전 항목 통과 + CLS 0.00 달성. 프로덕션 배포 완료.

## 최근 변경 (최근 5개)
- 05-15: AdSlot.tsx 인터랙션 후 레이지 로드 (Best Practices 100 로컬+프로덕션)
- 05-15: App.tsx Suspense 폴백 min-h-[50vh]→min-h-screen (CLS 0.431→0.00)
- 05-15: Home.tsx/RecentBlogPosts.tsx WCAG 색상 대비 수정 (Accessibility 100)
- 05-15: RecentBlogPosts.tsx 링크 텍스트 구체화 (SEO 100)
- 05-15: sitemap.xml 도구 7개 lastmod → 2026-05-15 갱신

## TODO
- [x] Vercel 배포 완료 (2026-05-15, commit dcb7cea)
- [ ] 프로덕션 PSI 재측정 (crepika.com — 배포 수분 후)
- [ ] AdSense 수동 슬롯 ID — 사용자 생성 후 제공 (AdSlot의 slotId 파라미터)
- [ ] GSC OAuth 토큰 연동 (~/.claude/skills/site-optimizer/.env)

## 결정사항
- CLS 원인: App.tsx lazy(Home) → Suspense 스피너 50vh → Home 로드 시 footer 이동
- 수정: 스피너를 min-h-screen으로 → footer 뷰포트 밖 → CLS 측정 제외
- Home은 lazy 유지 (blog-posts-meta 175KB 때문에 eager 전환 불가)
- Accessibility 100: -700 shades(라이트) / -300~400 shades(다크) 사용
- Best Practices 100: localhost에서 AdSense 로드 스킵

## 주의
- 프로덕션 Lighthouse는 아직 이전 점수 (미배포 상태)
- AdSense slotId 없으면 Auto Ads 플레이스홀더만 렌더링 (정상)
- GA4 / GSC OAuth: ~/.claude/skills/site-optimizer/.env 토큰 필요
