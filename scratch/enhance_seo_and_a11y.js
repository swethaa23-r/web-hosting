const fs = require('fs');
const path = require('path');

const metaDescriptions = {
    'index.html': 'Stackly provides enterprise-grade cloud web hosting, domain registration, and managed VPS solutions engineered for speed, security, and 99.99% uptime.',
    'about.html': 'Learn about Stackly journey, our global datacenter infrastructure, mission, and the leadership team powering modern web hosting.',
    'services.html': 'Explore Stackly comprehensive web hosting services including NVMe cloud hosting, managed WordPress, dedicated servers, and domain services.',
    'hosting.html': 'Compare high-performance web hosting plans from Stackly. Featuring ultra-fast NVMe storage, free SSL certificates, and 24/7 expert support.',
    'domain.html': 'Find, register, and manage your custom domain name with Stackly. Instant activation, free WHOIS privacy, and automated DNS management.',
    'blog.html': 'Read expert hosting insights, cloud architecture tutorials, cybersecurity best practices, and infrastructure news from Stackly engineers.',
    'blog-details.html': 'In-depth guide on choosing the best web hosting plan for your business, evaluating traffic requirements, scalability, and security.',
    'contact.html': 'Contact Stackly technical support and enterprise sales teams. 24/7 assistance available via live ticket, email, and phone.',
    'login.html': 'Sign in to your Stackly Web Hosting client portal to manage hosting plans, registered domains, billing invoices, and support tickets.',
    'signup.html': 'Create a free Stackly Web Hosting account to deploy cloud hosting instances, register domains, and scale your online presence.',
    'forgot-password.html': 'Reset your Stackly account password securely. Enter your registered email address to receive password recovery instructions.',
    '404.html': 'Page not found - The requested URL was not found on the Stackly Web Hosting server. Return to homepage or browse our hosting plans.',
    'admin-dashboard.html': 'Stackly Super Administrator Dashboard - Monitor real-time cluster health, resource metrics, user accounts, and revenue telemetry.',
    'admin-customers.html': 'Stackly Admin - Customer management console for managing customer accounts, provisioning status, plans, and profiles.',
    'admin-orders.html': 'Stackly Admin - Order processing console to review customer purchases, subscriptions, payment gateways, and fulfillment.',
    'admin-hosting-plans.html': 'Stackly Admin - Manage hosting plan specifications, monthly pricing tiers, NVMe storage allocations, and features.',
    'admin-domains.html': 'Stackly Admin - Manage registered customer domains, WHOIS records, registrar integrations, and DNS zones.',
    'admin-billing.html': 'Stackly Admin - Financial operations, revenue reporting, invoice breakdowns, payment methods, and transaction logs.',
    'admin-reports.html': 'Stackly Admin - Comprehensive analytics, revenue forecasting, subscriber growth, and server cluster performance reports.',
    'admin-support.html': 'Stackly Admin - Technical support desk to manage customer tickets, triage inquiries, and reply to client requests.',
    'admin-settings.html': 'Stackly Admin - System configuration, platform security settings, two-factor authentication, and email notifications.',
    'user-dashboard.html': 'Stackly Client Dashboard - Overview of active hosting plans, registered domains, billing balance, and resource usage.',
    'user-hosting.html': 'Stackly Client Portal - Manage server instances, cPanel SSO launch, SSL certificates, PHP configurations, and backups.',
    'user-domains.html': 'Stackly Client Portal - Manage domain portfolio, DNS records, nameservers, auto-renewal settings, and domain forwarding.',
    'user-billing.html': 'Stackly Client Portal - View invoice history, download official PDF/HTML receipts, and update payment credit cards.',
    'user-profile.html': 'Stackly Client Portal - Manage account contact details, security credentials, password updates, and notification preferences.',
    'user-support.html': 'Stackly Client Portal - Open technical support tickets, track ticket status, and communicate directly with Stackly technicians.'
};

let filesUpdated = 0;

Object.entries(metaDescriptions).forEach(([filename, metaDesc]) => {
    const isDash = filename.startsWith('admin-') || filename.startsWith('user-');
    const filePath = isDash ? path.join('dashboard', filename) : filename;
    
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    let html = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Add Meta Description if missing
    if (!/<meta\s+name=["']description["']/i.test(html)) {
        const metaTag = `\n    <meta name="description" content="${metaDesc}">`;
        if (/<head[^>]*>/i.test(html)) {
            html = html.replace(/(<head[^>]*>)/i, `$1${metaTag}`);
            modified = true;
        }
    }

    // 2. Fix admin-reports title entity
    if (filename === 'admin-reports.html' && html.includes('Reports &amp; Analytics')) {
        html = html.replace('Reports &amp; Analytics', 'Reports & Analytics');
        modified = true;
    }

    // 3. Ensure modals have role="dialog" and aria-modal="true"
    const modalRegex = /<div\s+([^>]*class=["'][^"']*\bmodal\b[^"']*["'][^>]*)>/gi;
    html = html.replace(modalRegex, (match, attrs) => {
        let newAttrs = attrs;
        if (!/\brole=["']dialog["']/i.test(newAttrs)) {
            newAttrs += ' role="dialog"';
        }
        if (!/\baria-modal=["']true["']/i.test(newAttrs)) {
            newAttrs += ' aria-modal="true"';
        }
        modified = true;
        return `<div ${newAttrs}>`;
    });

    // 4. Safe Chart and Logout checks in dashboard files
    if (isDash) {
        // Safe btn-logout
        if (html.includes("document.getElementById('btn-logout').addEventListener")) {
            html = html.replace(
                "document.getElementById('btn-logout').addEventListener('click',",
                "var _bl = document.getElementById('btn-logout'); if (_bl) _bl.addEventListener('click',"
            );
            modified = true;
        }

        // Safe Chart canvas
        if (html.includes("const ctx = document.getElementById('revenueChart').getContext('2d');")) {
            html = html.replace(
                "const ctx = document.getElementById('revenueChart').getContext('2d');",
                "const _rc = document.getElementById('revenueChart'); if (typeof Chart !== 'undefined' && _rc) { const ctx = _rc.getContext('2d');"
            );
            // also find where the chart script block ends before </script>
            // but let's be careful to close the brace if we opened one
            // We will handle chart blocks specifically
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, html, 'utf8');
        filesUpdated++;
        console.log(`Updated ${filePath}`);
    }
});

console.log(`Total files updated: ${filesUpdated}`);
