const fs = require('fs');
const path = require('path');

const chartPages = ['admin-dashboard.html', 'admin-billing.html', 'admin-reports.html', 'user-dashboard.html'];

chartPages.forEach(p => {
    const content = fs.readFileSync(path.join('dashboard', p), 'utf8');
    const chartMatches = content.match(/new\s+Chart\s*\([\s\S]*?\);/g) || [];
    console.log(`=== ${p}: ${chartMatches.length} Chart instances ===`);
    chartMatches.forEach((cm, i) => {
        console.log(`-- Chart ${i + 1} snippet: --\n${cm.slice(0, 150)}...\n`);
    });
});
