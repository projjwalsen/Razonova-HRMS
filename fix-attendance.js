const fs = require('fs');
const path = 'c:/Users/RAZONOVA/Desktop/hrms/app/company/attendance/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// 1) Add useAccess import
const importIdx = lines.findIndex(l => l.includes("from '@/store/actions/attendanceActions';"));
lines.splice(importIdx + 1, 0, "import { useAccess } from '@/lib/access';");

// 2) Add useAccess hook
const dispatchIdx = lines.findIndex(l => l.includes('const dispatch = useAppDispatch()'));
lines.splice(dispatchIdx + 1, 0, "  const { hasPermission, hasModule } = useAccess();");

// 3) Wrap p-8 div with permission guard using parentheses
const p8OpenIdx = lines.findIndex(l => l.trim() === '<div className="p-8">');
// Find the closing </div> with same indent as p-8 opening
const p8Indent = lines[p8OpenIdx].match(/^\s*/)[0];
const p8CloseIdx = lines.findIndex((l, i) => i > p8OpenIdx && l.trim() === '</div>' && l.startsWith(p8Indent));

console.log('p8OpenIdx:', p8OpenIdx, 'p8CloseIdx:', p8CloseIdx);

// Change p-8 opening to include opening paren: <div className="p-8"> becomes (   <div className="p-8">
lines[p8OpenIdx] = '    {hasModule("ATTENDANCE") && (\n' + lines[p8OpenIdx];

// After p-8 close, add closing paren + )} to end guard
lines.splice(p8CloseIdx + 1, 0, '    )}');

fs.writeFileSync(path, lines.join('\n'));
console.log('done');
