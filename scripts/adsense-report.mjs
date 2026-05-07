#!/usr/bin/env node
/**
 * 크레피카 AdSense Management API 리포트
 *
 * 사전 조건:
 *   1. Google Cloud Console → AdSense Management API 활성화
 *   2. OAuth2 클라이언트 ID (데스크톱 앱 유형) 생성 → JSON 다운로드
 *   3. 다운로드한 파일을 D:\env\adsense_oauth_client.json 으로 저장
 *
 * 첫 실행: node scripts/adsense-report.mjs
 *   → 브라우저 인증 URL 출력 → 승인 → 코드 붙여넣기 → token 저장됨
 *
 * 이후 실행: 저장된 토큰으로 자동 인증
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = 'D:\\env\\adsense_oauth_client.json';
const TOKEN_PATH = join(__dirname, '.adsense-token.json');

const SCOPES = ['https://www.googleapis.com/auth/adsense.readonly'];

async function getAccessToken(credentials) {
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
  const redirect_uri = 'urn:ietf:wg:oauth:2.0:oob';

  // 저장된 토큰 로드
  if (existsSync(TOKEN_PATH)) {
    const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf-8'));
    if (token.expiry_date > Date.now()) return token.access_token;

    // 토큰 갱신
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id, client_secret,
        refresh_token: token.refresh_token,
        grant_type: 'refresh_token',
      }),
    });
    const refreshed = await res.json();
    if (refreshed.access_token) {
      const newToken = { ...token, access_token: refreshed.access_token, expiry_date: Date.now() + refreshed.expires_in * 1000 };
      writeFileSync(TOKEN_PATH, JSON.stringify(newToken));
      return newToken.access_token;
    }
  }

  // 신규 인증
  const authUrl = `https://accounts.google.com/o/oauth2/auth?` + new URLSearchParams({
    client_id, response_type: 'code',
    redirect_uri, scope: SCOPES.join(' '),
    access_type: 'offline', prompt: 'consent',
  });

  console.log('\n🔑 브라우저에서 아래 URL을 열고 승인하세요:\n');
  console.log(authUrl);
  console.log('\n승인 후 표시되는 코드를 붙여넣으세요:');

  const code = await new Promise(resolve => {
    process.stdin.resume();
    process.stdin.once('data', d => { process.stdin.pause(); resolve(d.toString().trim()); });
  });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id, client_secret, redirect_uri, grant_type: 'authorization_code' }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('인증 실패: ' + JSON.stringify(tokenData));

  const token = { ...tokenData, expiry_date: Date.now() + tokenData.expires_in * 1000 };
  writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log('✅ 토큰 저장 완료\n');
  return token.access_token;
}

async function adsenseRequest(path, accessToken) {
  const res = await fetch(`https://adsense.googleapis.com/v2${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`API 오류 ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  if (!existsSync(CREDENTIALS_PATH)) {
    console.error('❌ 자격증명 파일이 없습니다:', CREDENTIALS_PATH);
    console.error('\n📋 설정 방법:');
    console.error('  1. https://console.cloud.google.com 접속');
    console.error('  2. API 및 서비스 → 라이브러리 → AdSense Management API 활성화');
    console.error('  3. 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 생성 (데스크톱 앱)');
    console.error('  4. JSON 다운로드 → D:\\env\\adsense_oauth_client.json 저장');
    process.exit(1);
  }

  console.log('📊 크레피카 AdSense 리포트 생성 중...\n');

  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const accessToken = await getAccessToken(credentials);

  // 계정 목록
  const accounts = await adsenseRequest('/accounts', accessToken);
  if (!accounts.accounts?.length) { console.error('AdSense 계정을 찾을 수 없습니다.'); process.exit(1); }
  const accountId = accounts.accounts[0].name;
  console.log(`✅ 계정: ${accounts.accounts[0].displayName} (${accountId})\n`);

  // 지난 7일 수익 리포트
  const today = new Date();
  const weekAgo = new Date(today - 7 * 86400000);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const report = await adsenseRequest(
    `/${accountId}/reports:generate?` + new URLSearchParams({
      dateRange: 'CUSTOM',
      'startDate.year': weekAgo.getFullYear(),
      'startDate.month': weekAgo.getMonth() + 1,
      'startDate.day': weekAgo.getDate(),
      'endDate.year': today.getFullYear(),
      'endDate.month': today.getMonth() + 1,
      'endDate.day': today.getDate(),
      metrics: 'ESTIMATED_EARNINGS,PAGE_VIEWS,CLICKS,PAGE_VIEWS_RPM,IMPRESSIONS_CTR',
    }),
    accessToken
  );

  const totals = report.totals?.cells || [];
  const labels = ['수익(USD)', '페이지뷰', '클릭수', 'RPM', 'CTR'];
  console.log('── 지난 7일 요약 ──────────────────────');
  labels.forEach((label, i) => {
    const val = totals[i]?.value ?? '-';
    console.log(`  ${label.padEnd(12)}: ${val}`);
  });

  // 정책 경고
  try {
    const alerts = await adsenseRequest(`/${accountId}/alerts`, accessToken);
    const warnings = alerts.alerts?.filter(a => a.type !== 'INFO') || [];
    console.log('\n── 정책 알림 ──────────────────────────');
    if (warnings.length === 0) {
      console.log('  ✅ 정책 위반 없음');
    } else {
      warnings.forEach(a => console.log(`  ⚠️  [${a.severity}] ${a.message}`));
    }
  } catch {
    console.log('\n  (알림 조회 불가)');
  }

  console.log('\n✅ 리포트 완료');
}

main().catch(err => {
  console.error('❌ 오류:', err.message);
  process.exit(1);
});
