const fs = require('fs');
const p = __dirname + '/src/pages/AboutUs.jsx';
let s = fs.readFileSync(p, 'utf8');
s = s.replace(/\u2019/g, "'");
fs.writeFileSync(p, s);
console.log('Done');
