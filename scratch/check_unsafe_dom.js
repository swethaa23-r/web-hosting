const fs = require('fs');
const path = require('path');

const files = [
    'auth.js',
    'script.js',
    'custom-fixes.js',
    path.join('dashboard', 'dashboard-engine.js')
];

files.forEach(f => {
    const code = fs.readFileSync(f, 'utf8');
    // Check for unguarded getElementById or querySelector with .addEventListener or property access
    const directAccessPatterns = [
        /document\.getElementById\(['"][^'"]+['"]\)\.(addEventListener|style|value|innerText|innerHTML|classList|getContext)/g,
        /document\.querySelector\(['"][^'"]+['"]\)\.(addEventListener|style|value|innerText|innerHTML|classList|getContext)/g
    ];

    console.log(`=== ${f} ===`);
    directAccessPatterns.forEach(pat => {
        let match;
        while ((match = pat.exec(code)) !== null) {
            console.log(`Unsafe access in ${f}: ${match[0]}`);
        }
    });
});
