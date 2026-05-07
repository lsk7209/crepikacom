#!/usr/bin/env node
function postToTs(post) {
  const json = JSON.stringify(post, null, 2);
  let ts = json.replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:');
  ts = ts.replace(/"((?:[^"\\]|\\.)*)"/g, (match, jsonBody) => {
    let val;
    try { val = JSON.parse('"' + jsonBody + '"'); } catch { return match; }
    const bt = val
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${');
    return '`' + bt + '`';
  });
  return ts;
}

const testPost = {
  slug: 'test-post',
  title: '테스트 포스트',
  content: {
    introduction: "Threads의 추천 피드는 '팔로우 피드'와 '추천 피드' 두 가지로 나뉩니다. 실제로 '질문형 마무리'를 추가했을 때 댓글 수가 4.3배 증가했습니다.",
    conclusion: "단계별로 적용하면 '의미 있는 변화'가 시작됩니다."
  },
  keywords: ['테스트', '키워드'],
};

const ts = postToTs(testPost);
console.log('=== Generated TypeScript ===');
console.log(ts);
console.log('\n=== Verifying no double-escaped quotes ===');
const hasBadQuotes = ts.includes("\\\\'");
console.log('Has double-escaped quotes:', hasBadQuotes, '(should be false)');
const hasBacktickStrings = (ts.match(/`/g) || []).length > 0;
console.log('Uses backtick strings:', hasBacktickStrings, '(should be true)');
