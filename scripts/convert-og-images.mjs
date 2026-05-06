#!/usr/bin/env node
/**
 * SVG → PNG 변환 스크립트
 * 소셜미디어는 SVG og:image를 지원하지 않으므로 PNG 버전을 생성합니다.
 */
import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync } from 'fs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SVG_FILES = [
  { src: 'public/og-image.svg', dest: 'public/og-image.png' },
  { src: 'public/images/og-guide.svg', dest: 'public/images/og-guide.png' },
  { src: 'public/images/og-tips.svg', dest: 'public/images/og-tips.png' },
  { src: 'public/images/og-insights.svg', dest: 'public/images/og-insights.png' },
  { src: 'public/images/og-case-study.svg', dest: 'public/images/og-case-study.png' },
  { src: 'public/images/og-tool-plan.svg', dest: 'public/images/og-tool-plan.png' },
  { src: 'public/images/og-tool-create.svg', dest: 'public/images/og-tool-create.png' },
  { src: 'public/images/og-tool-publish.svg', dest: 'public/images/og-tool-publish.png' },
  { src: 'public/images/og-tool-analyze.svg', dest: 'public/images/og-tool-analyze.png' },
];

async function convertAll() {
  let ok = 0, fail = 0;
  for (const { src, dest } of SVG_FILES) {
    const srcPath = join(ROOT, src);
    const destPath = join(ROOT, dest);
    if (!existsSync(srcPath)) {
      console.warn(`⚠️ 파일 없음: ${src}`);
      fail++;
      continue;
    }
    try {
      await sharp(srcPath, { density: 150 })
        .resize(1200, 630, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(destPath);
      console.log(`✅ ${src} → ${dest}`);
      ok++;
    } catch (e) {
      console.error(`❌ ${src}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\n완료: ${ok}개 성공, ${fail}개 실패`);
}

convertAll();
