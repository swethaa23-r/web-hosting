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

const allHtml = [
    ...publicFiles.map(f => ({ file: f, dir: '.' })),
    ...dashboardFiles.map(f => ({ file: f, dir: 'dashboard' }))
];

const missingAssets = [];
const brokenLinks = [];
const totalAssetsChecked = { count: 0 };
const totalLinksChecked = { count: 0 };

allHtml.forEach(({ file, dir }) => {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. Assets: <img src="...">, <script src="...">, <link href="...">
    const assetRegex = /<(?:img|script|source)\b[^>]*(?:src|srcset)=["']([^"']+)["']|<link\b[^>]*href=["']([^"']+)["']/gi;
    let match;
    while ((match = assetRegex.exec(content)) !== null) {
        const assetUrl = match[1] || match[2];
        if (!assetUrl) continue;
        // Skip external CDNs, data URIs, mailto, tel, javascript:
        if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://') || 
            assetUrl.startsWith('data:') || assetUrl.startsWith('//')) {
            continue;
        }

        totalAssetsChecked.count++;
        // Clean query/hash
        const cleanUrl = assetUrl.split('?')[0].split('#')[0];
        const resolvedPath = path.resolve(dir, cleanUrl);
        if (!fs.existsSync(resolvedPath)) {
            missingAssets.push({ file: filePath, assetUrl, resolvedPath });
        }
    }

    // 2. Links: <a href="...">
    const linkRegex = /<a\b[^>]*href=["']([^"']+)["']/gi;
    while ((match = linkRegex.exec(content)) !== null) {
        const linkHref = match[1];
        if (!linkHref) continue;
        if (linkHref.startsWith('http://') || linkHref.startsWith('https://') || 
            linkHref.startsWith('mailto:') || linkHref.startsWith('tel:') || 
            linkHref.startsWith('javascript:') || linkHref === '#') {
            continue;
        }

        totalLinksChecked.count++;
        // If it starts with # on same page, check if ID exists
        if (linkHref.startsWith('#')) {
            const targetId = linkHref.substring(1);
            if (targetId && !content.includes(`id="${targetId}"`) && !content.includes(`id='${targetId}'`)) {
                brokenLinks.push({ file: filePath, linkHref, reason: `Anchor #${targetId} not found in same page` });
            }
            continue;
        }

        // Relative link to another file (clean query parameters)
        const withoutQuery = linkHref.split('?')[0];
        const [targetFile, hash] = withoutQuery.split('#');
        if (!targetFile) continue;
        const resolvedTarget = path.resolve(dir, targetFile);
        if (!fs.existsSync(resolvedTarget)) {
            brokenLinks.push({ file: filePath, linkHref, resolvedTarget, reason: 'Destination file does not exist' });
        } else if (hash) {
            const targetContent = fs.readFileSync(resolvedTarget, 'utf8');
            if (!targetContent.includes(`id="${hash}"`) && !targetContent.includes(`id='${hash}'`)) {
                brokenLinks.push({ file: filePath, linkHref, resolvedTarget, reason: `Anchor #${hash} not found in destination` });
            }
        }
    }
});

console.log('=== AUDIT ASSETS & LINKS SUMMARY ===');
console.log(`Total local assets checked: ${totalAssetsChecked.count}`);
console.log(`Missing assets found: ${missingAssets.length}`);
if (missingAssets.length > 0) {
    console.log(JSON.stringify(missingAssets, null, 2));
}

console.log(`Total internal links checked: ${totalLinksChecked.count}`);
console.log(`Broken links found: ${brokenLinks.length}`);
if (brokenLinks.length > 0) {
    console.log(JSON.stringify(brokenLinks, null, 2));
}
fs.writeFileSync('scratch/asset_link_audit.json', JSON.stringify({ missingAssets, brokenLinks }, null, 2));
