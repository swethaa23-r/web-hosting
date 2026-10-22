const fs = require('fs');
const path = require('path');

const publicFiles = [
    'index.html', 'about.html', 'services.html', 'hosting.html', 'domain.html',
    'blog.html', 'blog-details.html', 'contact.html', 'login.html', 'signup.html',
    'forgot-password.html', '404.html'
];

const dashboardFiles = [
    'admin-dashboard.html', 'admin-customers.html', 'admin-orders.html', 'admin-hosting-plans.html',
    'admin-domains.html', 'admin-billing.html', 'admin-reports.html', 'admin-support.html', 'admin-settings.html',
    'user-dashboard.html', 'user-hosting.html', 'user-domains.html', 'user-billing.html', 'user-profile.html', 'user-support.html'
];

function checkHtml(file, isDash) {
    const fullPath = isDash ? path.join('dashboard', file) : file;
    const content = fs.readFileSync(fullPath, 'utf8');
    const scripts = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi) || [];
    
    scripts.forEach((s, idx) => {
        const directAccessPatterns = [
            /document\.getElementById\(['"][^'"]+['"]\)\.(addEventListener|style|value|innerText|innerHTML|classList|getContext)/g,
            /document\.querySelector\(['"][^'"]+['"]\)\.(addEventListener|style|value|innerText|innerHTML|classList|getContext)/g
        ];
        directAccessPatterns.forEach(pat => {
            let match;
            while ((match = pat.exec(s)) !== null) {
                console.log(`Unsafe in ${file} script #${idx + 1}: ${match[0]}`);
            }
        });
    });
}

publicFiles.forEach(f => checkHtml(f, false));
dashboardFiles.forEach(f => checkHtml(f, true));
