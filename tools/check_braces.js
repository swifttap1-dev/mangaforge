import fs from 'fs'
const s = fs.readFileSync('src/services/claude.ts', 'utf8')
const openExpr = (s.match(/\${/g) || []).length;
const openBrace = (s.match(/{/g) || []).length;
const closeBrace = (s.match(/}/g) || []).length;
console.log('open ${ count:', openExpr);
console.log('{ count:', openBrace);
console.log('} count:', closeBrace);

// show occurrences of '${' without matching '}' within next 200 chars
let idx = s.indexOf('${');
while (idx !== -1) {
  const snippet = s.substr(idx, 200);
  const closeIdx = snippet.indexOf('}');
  console.log('\nfound ${ at', idx+1, ' snippet:');
  console.log(snippet.replace(/\n/g, '\\n'));
  console.log('first } in snippet at', closeIdx);
  idx = s.indexOf('${', idx+2);
}
