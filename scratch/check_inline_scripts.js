const fs = require('fs');
const path = require('path');

const dashboardFiles = [
    'admin-dashboard.html', 'admin-customers.html', 'admin-orders.html', 'admin-hosting-plans.html',
    'admin-domains.html', 'admin-billing.html', 'admin-reports.html', 'admin-support.html', 'admin-settings.html',
    'user-dashboard.html', 'user-hosting.html', 'user-domains.html', 'user-billing.html', 'user-profile.html', 'user-support.html'
];

dashboardFiles.forEach(f => {
    const content = fs.readFileSync(path.join('dashboard', f), 'utf8');
    const inlineScripts = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi) || [];
    console.log(`=== ${f} (${inlineScripts.length} inline scripts) ===`);
    inlineScripts.forEach((s, idx) => {
        const cleaned = s.replace(/<\/?script[^>]*>/gi, '').trim();
        const firstFewLines = cleaned.split('\n').slice(0, 10).join('\n');
        console.log(`-- Script ${idx + 1} preview: --\n${firstFewLines}\n... (${cleaned.length} chars)\n`);
    });
});
