const fs = require('fs');
let code = fs.readFileSync('dist/assets/vendor-react-D1n_swNO.js', 'utf8');

const target = 'function Zn(){let e=cr(),t=';
const replacement = 'function Zn(){let e=cr(); console.error("REACT_ROUTER_CAUGHT_ERROR:", e && (e.stack || e.message || e)); let t=';

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('dist/assets/vendor-react-D1n_swNO.js', code);
  console.log('Successfully hooked React Router ErrorBoundary!');
} else {
  console.log('Target not found in vendor-react!');
}
