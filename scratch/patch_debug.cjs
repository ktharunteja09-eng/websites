const fs = require('fs');
let code = fs.readFileSync('dist/assets/vendor-react-D1n_swNO.js', 'utf8');

const startIdx = code.indexOf(',(i || (console.error("HYDRATION_DEBUG_TAG"');
const endIdx = code.indexOf(', ua(t))))', startIdx) + ', ua(t))))'.length;

const replacement = `,(i || ((() => {
  let stack = [];
  let cur = t;
  while (cur) {
    let name = typeof cur.type === 'string' ? cur.type : (cur.type?.displayName || cur.type?.name || 'Unknown');
    let props = cur.pendingProps ? Object.keys(cur.pendingProps).filter(k => k !== 'children').join(',') : '';
    let idOrClass = cur.pendingProps?.id ? ('#' + cur.pendingProps.id) : (cur.pendingProps?.className ? ('.' + String(cur.pendingProps.className).slice(0, 30)) : '');
    let text = cur.pendingProps?.children && typeof cur.pendingProps.children === 'string' ? ' text="' + cur.pendingProps.children + '"' : '';
    stack.push(name + (idOrClass ? '(' + idOrClass + ')' : '') + (props ? '[' + props + ']' : '') + text);
    cur = cur.return;
  }
  console.error("HYDRATION_FIBER_STACK:", stack.join(" -> "));
})(), ua(t))))`;

code = code.slice(0, startIdx) + replacement + code.slice(endIdx);
fs.writeFileSync('dist/assets/vendor-react-D1n_swNO.js', code);
console.log('Successfully replaced with full fiber stack!');
