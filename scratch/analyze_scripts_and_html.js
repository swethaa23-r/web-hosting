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

const results = {};

function analyzeHtml(filePath, isDash) {
    const fullPath = isDash ? path.join('dashboard', filePath) : filePath;
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Find all <script src="...">
    const scriptSrcs = [];
    const scriptRegex = /<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = scriptRegex.exec(content)) !== null) {
        scriptSrcs.push(match[1]);
    }
    
    // Check inline scripts count
    const inlineScriptCount = (content.match(/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi) || []).length;
    
    // Check meta tags
    const hasMetaDesc = /<meta\s+name=["']description["']/i.test(content);
    const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';

    // Check images missing alt
    const imgTags = content.match(/<img\b[^>]*>/gi) || [];
    const imgsWithoutAlt = imgTags.filter(img => !/\balt=["'][^"']*["']/i.test(img));

    results[filePath] = {
        scripts: scriptSrcs,
        inlineScripts: inlineScriptCount,
        hasMetaDesc,
        title,
        totalImages: imgTags.length,
        imgsWithoutAlt: imgsWithoutAlt.length
    };
}

publicFiles.forEach(f => analyzeHtml(f, false));
dashboardFiles.forEach(f => analyzeHtml(f, true));

fs.writeFileSync('scratch/html_analysis.json', JSON.stringify(results, null, 2));
console.log('Analysis written to scratch/html_analysis.json');
