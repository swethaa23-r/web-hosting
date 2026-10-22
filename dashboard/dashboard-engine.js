/**
 * Stackly Dashboard Engine (dashboard-engine.js)
 * Fully interactive engine for both Admin and User Dashboards.
 * Provides data persistence, real modal actions, receipt generation,
 * destructive confirmation dialogs, search/filter, and meaningful empty states.
 */

(function () {
    'use strict';

    if (window.__STACKLY_DASHBOARD_ENGINE_INITIALIZED__) {
        return;
    }
    window.__STACKLY_DASHBOARD_ENGINE_INITIALIZED__ = true;

    // ==========================================
    // 1. DATA STORES & SEED DATA (localStorage)
    // ==========================================

    const DEFAULT_CUSTOMERS = [
        { id: 'CUST-1001', name: 'Michael Chen', email: 'mike@example.com', plan: 'VPS Professional', status: 'Active', registered: 'Oct 2, 2025', websites: 4, spend: '$599.88' },
        { id: 'CUST-1002', name: 'Sarah Jenkins', email: 'sarah.j@techspark.io', plan: 'Shared Starter', status: 'Active', registered: 'Nov 14, 2025', websites: 1, spend: '$59.88' },
        { id: 'CUST-1003', name: 'TechCorp Inc.', email: 'admin@techcorp.com', plan: 'Dedicated Alpha', status: 'Active', registered: 'Jan 10, 2026', websites: 12, spend: '$2,388.00' },
        { id: 'CUST-1004', name: 'David Smith', email: 'david@smithdesigns.co', plan: 'WordPress Hosting', status: 'Suspended', registered: 'Feb 22, 2026', websites: 2, spend: '$179.88' },
        { id: 'CUST-1005', name: 'Elena Rostova', email: 'elena@vanguardia.org', plan: 'Cloud Scaled', status: 'Pending', registered: 'Mar 5, 2026', websites: 3, spend: '$340.00' }
    ];

    const DEFAULT_DOMAINS = [
        { domain: 'chenstudios.com', owner: 'Michael Chen', email: 'mike@example.com', registered: 'Oct 2, 2025', expiry: 'Oct 2, 2026', autoRenew: true, ssl: 'Secured', status: 'Active' },
        { domain: 'techspark.io', owner: 'Sarah Jenkins', email: 'sarah.j@techspark.io', registered: 'Nov 14, 2025', expiry: 'Nov 14, 2026', autoRenew: true, ssl: 'Secured', status: 'Active' },
        { domain: 'techcorp-enterprise.net', owner: 'TechCorp Inc.', email: 'admin@techcorp.com', registered: 'Jan 10, 2025', expiry: 'Jan 10, 2027', autoRenew: true, ssl: 'Secured', status: 'Active' },
        { domain: 'smithdesigns.co', owner: 'David Smith', email: 'david@smithdesigns.co', registered: 'Feb 22, 2025', expiry: 'Nov 1, 2026', autoRenew: false, ssl: 'Expiring', status: 'Expiring Soon' },
        { domain: 'mywebsite.com', owner: 'User Account', email: 'user@stackly.com', registered: 'Oct 2, 2025', expiry: 'Oct 2, 2027', autoRenew: true, ssl: 'Secured', status: 'Active' },
        { domain: 'app-dashboard.net', owner: 'User Account', email: 'user@stackly.com', registered: 'Aug 15, 2025', expiry: 'Aug 15, 2027', autoRenew: true, ssl: 'Secured', status: 'Active' }
    ];

    const DEFAULT_PLANS = [
        { id: 'plan-shared', name: 'Shared Starter', price: '$4.99', period: '/month', storage: '10 GB NVMe', bandwidth: '100 GB', websites: '1 Website', ssl: 'Free SSL', backup: 'Weekly', support: 'Standard 24/7', status: 'Active' },
        { id: 'plan-vps', name: 'VPS Professional', price: '$29.99', period: '/month', storage: '100 GB NVMe', bandwidth: '1 TB', websites: 'Unlimited', ssl: 'Free Wildcard SSL', backup: 'Daily Automated', support: 'Priority 24/7', status: 'Active' },
        { id: 'plan-cloud', name: 'Cloud Scale', price: '$59.99', period: '/month', storage: '250 GB NVMe', bandwidth: '5 TB', websites: 'Unlimited', ssl: 'Free Wildcard SSL', backup: 'Real-time Snapshots', support: 'Dedicated 24/7', status: 'Active' },
        { id: 'plan-dedicated', name: 'Dedicated Alpha', price: '$199.00', period: '/month', storage: '1 TB Enterprise NVMe', bandwidth: '10 TB', websites: 'Unlimited', ssl: 'Premium SSL', backup: 'Daily + Offsite', support: 'VIP Account Mgr', status: 'Active' }
    ];

    const DEFAULT_ORDERS = [
        { id: '#ORD-8923', customer: 'Michael Chen', email: 'mike@example.com', plan: 'VPS Professional', date: 'Oct 8, 2026', amount: '$29.99', status: 'Completed', paymentMethod: 'Visa ending in 4242' },
        { id: '#ORD-8922', customer: 'Sarah Jenkins', email: 'sarah.j@techspark.io', plan: 'Shared Starter', date: 'Oct 7, 2026', amount: '$4.99', status: 'Completed', paymentMethod: 'PayPal' },
        { id: '#ORD-8921', customer: 'TechCorp Inc.', email: 'admin@techcorp.com', plan: 'Dedicated Alpha', date: 'Oct 5, 2026', amount: '$199.00', status: 'Completed', paymentMethod: 'Wire Transfer' },
        { id: '#ORD-8920', customer: 'David Smith', email: 'david@smithdesigns.co', plan: 'WordPress Hosting', date: 'Oct 1, 2026', amount: '$14.99', status: 'Pending', paymentMethod: 'MasterCard ending in 8812' }
    ];

    const DEFAULT_INVOICES = [
        { id: 'INV-2042', customer: 'Michael Chen', email: 'mike@example.com', plan: 'VPS Professional', amount: '$29.99', date: 'Oct 2, 2026', dueDate: 'Nov 2, 2026', status: 'Paid', paymentMethod: 'Credit Card (Visa ****4242)' },
        { id: 'INV-2041', customer: 'Sarah Jenkins', email: 'sarah.j@techspark.io', plan: 'Shared Starter', amount: '$9.99', date: 'Sep 2, 2026', dueDate: 'Oct 2, 2026', status: 'Paid', paymentMethod: 'PayPal' },
        { id: 'INV-2040', customer: 'User Account', email: 'user@stackly.com', plan: 'Domain Registration (.com)', amount: '$9.99', date: 'Aug 2, 2026', dueDate: 'Aug 2, 2026', status: 'Paid', paymentMethod: 'Credit Card (Visa ****4242)' },
        { id: 'INV-2039', customer: 'TechCorp Inc.', email: 'admin@techcorp.com', plan: 'Dedicated Alpha', amount: '$199.00', date: 'Oct 5, 2026', dueDate: 'Nov 5, 2026', status: 'Pending', paymentMethod: 'Bank Wire' },
        { id: 'INV-2038', customer: 'David Smith', email: 'david@smithdesigns.co', plan: 'WordPress Hosting', amount: '$14.99', date: 'Oct 1, 2026', dueDate: 'Oct 15, 2026', status: 'Refunded', paymentMethod: 'Credit Card' }
    ];

    const DEFAULT_TICKETS = [
        {
            id: '#TKT-1042',
            customer: 'Sarah Jenkins',
            email: 'sarah.j@techspark.io',
            subject: 'SSL Certificate not installing',
            category: 'Technical',
            priority: 'High',
            status: 'Open',
            date: 'Today, 09:42 AM',
            messages: [
                { author: 'Sarah Jenkins', time: 'Today, 09:42 AM', text: 'Hi, I just bought the Shared Starter plan which includes a Free SSL, but my site is still saying Not Secure. Can you help install it?', isAdmin: false },
                { author: 'Support Agent', time: 'Today, 09:55 AM', text: 'Hello Sarah! I have initiated the AutoSSL certificate provisioning for your domain. It should be fully active within the next 15-30 minutes.', isAdmin: true }
            ]
        },
        {
            id: '#TKT-1041',
            customer: 'Michael Chen',
            email: 'mike@example.com',
            subject: 'PHP 8.3 extension missing',
            category: 'Hosting',
            priority: 'Medium',
            status: 'Pending',
            date: 'Oct 7, 2026',
            messages: [
                { author: 'Michael Chen', time: 'Oct 7, 2026 02:15 PM', text: 'Could you enable the imagick PHP 8.3 extension on my VPS node?', isAdmin: false },
                { author: 'Admin User', time: 'Oct 7, 2026 03:00 PM', text: 'We have queued the extension update in your CloudLinux environment.', isAdmin: true }
            ]
        },
        {
            id: '#TKT-1040',
            customer: 'TechCorp Inc.',
            email: 'admin@techcorp.com',
            subject: 'Invoice tax breakdown question',
            category: 'Billing',
            priority: 'Low',
            status: 'Resolved',
            date: 'Oct 5, 2026',
            messages: [
                { author: 'TechCorp Inc.', time: 'Oct 5, 2026 11:10 AM', text: 'Can we get an updated VAT receipt for invoice INV-2039?', isAdmin: false },
                { author: 'Support Agent', time: 'Oct 5, 2026 11:35 AM', text: 'Certainly! The updated receipt with corporate VAT details has been sent to your billing address.', isAdmin: true }
            ]
        }
    ];

    function getStore(key, defaultData) {
        try {
            const data = localStorage.getItem(key);
            if (!data) {
                localStorage.setItem(key, JSON.stringify(defaultData));
                return defaultData;
            }
            return JSON.parse(data);
        } catch (e) {
            return defaultData;
        }
    }

    function setStore(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Storage error:', e);
        }
    }

    // ==========================================
    // 2. CORE DIALOG & DOWNLOAD HELPERS
    // ==========================================

    function ensureStyles() {
        if (document.getElementById('engine-injected-styles')) return;
        const style = document.createElement('style');
        style.id = 'engine-injected-styles';
        style.innerHTML = `
            /* Universal Confirmation Modal */
            .confirm-modal-overlay {
                position: fixed; inset: 0; background: rgba(11, 21, 54, 0.75);
                display: flex; align-items: center; justify-content: center;
                z-index: 10000; padding: 20px; backdrop-filter: blur(4px);
                animation: fadeInModal 0.2s ease-out;
            }
            .confirm-modal-card {
                background: #ffffff; border-radius: 12px; max-width: 480px; width: 100%;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                overflow: hidden; animation: scaleUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .confirm-modal-header {
                padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
                display: flex; align-items: center; gap: 14px;
            }
            .confirm-icon-wrap {
                width: 42px; height: 42px; border-radius: 50%;
                background: #fee2e2; color: #ef4444; display: flex;
                align-items: center; justify-content: center; font-size: 20px;
            }
            .confirm-icon-wrap.info { background: #dbeafe; color: #2563eb; }
            .confirm-icon-wrap.success { background: #dcfce7; color: #10b981; }
            .confirm-modal-header h3 { font-size: 17px; font-weight: 600; color: #0b1536; margin: 0; }
            .confirm-modal-body { padding: 20px 24px; font-size: 14px; color: #4b5563; line-height: 1.6; }
            .confirm-modal-footer {
                padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9;
                display: flex; justify-content: flex-end; gap: 12px;
            }
            .btn-confirm-cancel {
                padding: 9px 18px; border-radius: 6px; border: 1px solid #d1d5db;
                background: #ffffff; color: #374151; font-size: 13px; font-weight: 500;
                cursor: pointer; transition: all 0.2s;
            }
            .btn-confirm-cancel:hover { background: #f3f4f6; }
            .btn-confirm-action {
                padding: 9px 18px; border-radius: 6px; border: none;
                background: #ef4444; color: #ffffff; font-size: 13px; font-weight: 500;
                cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
            }
            .btn-confirm-action:hover { background: #dc2626; }
            .btn-confirm-action.btn-primary { background: #2563eb; }
            .btn-confirm-action.btn-primary:hover { background: #1d4ed8; }

            /* Skeleton Shimmer Loading */
            .skeleton-shimmer {
                background: linear-gradient(90deg, #f0f3f8 25%, #e2e8f0 50%, #f0f3f8 75%);
                background-size: 200% 100%;
                animation: shimmerAnim 1.5s infinite;
                border-radius: 4px; color: transparent !important; pointer-events: none;
            }
            @keyframes shimmerAnim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            @keyframes fadeInModal { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUpModal { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

            /* Empty States */
            .empty-state-box {
                padding: 45px 20px; text-align: center; color: #64748b;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
            }
            .empty-state-box i { font-size: 44px; color: #cbd5e1; margin-bottom: 14px; }
            .empty-state-box h4 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 6px; }
            .empty-state-box p { font-size: 13px; max-width: 360px; margin-bottom: 18px; color: #64748b; }

            /* State Switcher Bar */
            .state-switcher-bar {
                display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
                background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
                padding: 6px 12px; margin-bottom: 15px; font-size: 12px;
            }
            .state-pill {
                padding: 4px 10px; border-radius: 20px; border: 1px solid #cbd5e1;
                background: #f8fafc; color: #475569; font-weight: 500; cursor: pointer;
                transition: all 0.2s;
            }
            .state-pill.active { background: #2563eb; color: #ffffff; border-color: #2563eb; }

            /* Universal Responsive Layout & Table Handling */
            html, body {
                max-width: 100vw !important;
                overflow-x: hidden !important;
            }
            .admin-layout {
                width: 100% !important;
                max-width: 100vw !important;
                min-height: 100vh;
                display: flex;
                overflow-x: hidden !important;
            }
            .main-content {
                flex: 1 1 0% !important;
                min-width: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
                overflow-x: hidden !important;
            }
            .dashboard-container {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                box-sizing: border-box !important;
            }
            .card {
                min-width: 0 !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
            }
            .table-responsive {
                width: 100% !important;
                max-width: 100% !important;
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch !important;
                display: block !important;
            }
            @media (max-width: 992px) {
                div[style*="grid-template-columns"] {
                    grid-template-columns: 1fr !important;
                }
                .dash-grid, .stats-grid, .resource-grid, .mgmt-grid, .settings-grid, .modal-grid {
                    grid-template-columns: 1fr !important;
                }
            }
            @media (max-width: 576px) {
                .dashboard-container {
                    padding: 15px 12px !important;
                }
                .card {
                    padding: 16px 14px !important;
                }
                .topbar {
                    padding: 0 12px !important;
                }
                .page-header {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 12px !important;
                }
            }

            /* Prototype Demo Badge */
            .demo-data-badge {
                display: flex;
                align-items: center;
                gap: 12px;
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                color: #1e40af;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 13px;
                margin-bottom: 20px;
                line-height: 1.5;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            .demo-data-badge i {
                font-size: 18px;
                color: #2563eb;
                flex-shrink: 0;
            }
            .demo-data-badge span {
                flex: 1;
            }

            /* Universal Table Pagination & Empty Filter Rows */
            .empty-filter-row td {
                background: #ffffff !important;
                border: none !important;
            }
            .pagination {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 14px 20px;
                border-top: 1px solid #e2e8f0;
                flex-wrap: wrap;
                gap: 12px;
                background: #ffffff;
            }
            .page-info {
                font-size: 13px;
                color: #64748b;
                font-weight: 500;
            }
            .pagination-controls {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .page-btn {
                padding: 6px 12px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
                background: #ffffff;
                color: #334155;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            .page-btn:hover:not(:disabled) {
                background: #f1f5f9;
                border-color: #cbd5e1;
            }
            .page-btn.active {
                background: #2563eb;
                border-color: #2563eb;
                color: #ffffff;
            }
            .page-btn:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            .sidebar-overlay {
                touch-action: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function confirmAction({ title, message, confirmText = 'Confirm', isDanger = true, onConfirm }) {
        ensureStyles();
        const overlay = document.createElement('div');
        overlay.className = 'confirm-modal-overlay';
        overlay.innerHTML = `
            <div class="confirm-modal-card">
                <div class="confirm-modal-header">
                    <div class="confirm-icon-wrap ${isDanger ? 'danger' : 'info'}">
                        <i class="fa-solid ${isDanger ? 'fa-triangle-exclamation' : 'fa-circle-question'}"></i>
                    </div>
                    <h3>${title}</h3>
                </div>
                <div class="confirm-modal-body">
                    ${message}
                </div>
                <div class="confirm-modal-footer">
                    <button class="btn-confirm-cancel" id="btn-modal-cancel">Cancel</button>
                    <button class="btn-confirm-action ${isDanger ? '' : 'btn-primary'}" id="btn-modal-proceed">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        function close() {
            overlay.remove();
            document.removeEventListener('keydown', onKeyDown);
        }

        function onKeyDown(e) {
            if (e.key === 'Escape') close();
        }

        overlay.querySelector('#btn-modal-cancel').addEventListener('click', close);
        overlay.querySelector('#btn-modal-proceed').addEventListener('click', () => {
            close();
            if (typeof onConfirm === 'function') onConfirm();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
        document.addEventListener('keydown', onKeyDown);
    }

    function downloadReceipt(order) {
        const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Official Invoice ${order.id || 'INV-2026'}</title>
<style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #f8fafc; }
    .invoice-box { max-width: 760px; margin: auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 25px; margin-bottom: 25px; }
    .brand { font-size: 26px; font-weight: 800; color: #2563eb; }
    .brand span { color: #0b1536; }
    .badge-paid { background: #dcfce7; color: #15803d; font-weight: 700; padding: 6px 14px; border-radius: 20px; font-size: 13px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 5px; }
    .val { font-size: 14px; color: #0f172a; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    th { background: #f8fafc; text-align: left; padding: 12px 16px; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .total-row { display: flex; justify-content: flex-end; margin-top: 10px; }
    .total-box { width: 260px; }
    .total-line { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #64748b; }
    .total-grand { display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; font-weight: 700; color: #0b1536; border-top: 2px solid #e2e8f0; margin-top: 6px; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
</style>
</head>
<body>
<div class="invoice-box">
    <div class="header">
        <div class="brand">Stackly<span>Hosting</span></div>
        <div class="badge-paid">${order.status || 'PAID'}</div>
    </div>
    <div class="grid">
        <div>
            <div class="label">Billed To</div>
            <div class="val"><strong>${order.customer || 'Valued Customer'}</strong></div>
            <div class="val">${order.email || 'customer@stackly.com'}</div>
            <div class="val">Stackly Web Hosting Client Account</div>
        </div>
        <div style="text-align: right;">
            <div class="label">Invoice Details</div>
            <div class="val"><strong>Invoice #:</strong> ${order.id || 'INV-2026'}</div>
            <div class="val"><strong>Date:</strong> ${order.date || new Date().toLocaleDateString()}</div>
            <div class="val"><strong>Payment Method:</strong> ${order.paymentMethod || 'Credit Card'}</div>
        </div>
    </div>
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Cycle</th>
                <th style="text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>${order.plan || 'VPS Hosting Plan'}</strong><br><span style="font-size: 12px; color: #64748b;">Enterprise Server & Network Allocation</span></td>
                <td>Monthly</td>
                <td style="text-align: right; font-weight: 600;">${order.amount || '$29.99'}</td>
            </tr>
        </tbody>
    </table>
    <div class="total-row">
        <div class="total-box">
            <div class="total-line"><span>Subtotal:</span><span>${order.amount || '$29.99'}</span></div>
            <div class="total-line"><span>Tax (0%):</span><span>$0.00</span></div>
            <div class="total-grand"><span>Total Paid:</span><span style="color: #2563eb;">${order.amount || '$29.99'}</span></div>
        </div>
    </div>
    <div class="footer">
        Thank you for hosting with Stackly Inc. For 24/7 technical support, visit stackly.com/support.
    </div>
</div>
</body>
</html>`;

        const blob = new Blob([invoiceHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Stackly-Invoice-${(order.id || 'INV').replace(/[^a-zA-Z0-9-]/g, '')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (window.showToast) window.showToast(`[Demo] Demonstration receipt ${order.id || ''} downloaded.`, 'success');
    }

    function downloadCSV(filename, headers, rows) {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += headers.join(',') + '\r\n';
        rows.forEach(r => {
            csvContent += r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\r\n';
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (window.showToast) window.showToast(`[Demo] CSV report exported to ${filename}.`, 'success');
    }

    // ==========================================
    // 3. ADMIN MODULE CONTROLLERS
    // ==========================================

    // A. admin-dashboard.html
    function initAdminDashboard() {
        const statsGrid = document.querySelector('.stats-grid');
        const dashGrid = document.querySelector('.dash-grid');
        const pageHeader = document.querySelector('.page-header');
        if (!statsGrid || !dashGrid) return;

        // Add Date Filter and State Switcher Toolbar
        if (!document.getElementById('dash-filter-toolbar') && pageHeader) {
            const toolbar = document.createElement('div');
            toolbar.id = 'dash-filter-toolbar';
            toolbar.style.cssText = 'display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 10px; width: 100%;';
            toolbar.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 6px 12px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 13px;">
                    <i class="fa-regular fa-calendar" style="color: var(--primary);"></i>
                    <span style="font-weight: 500; color: var(--text-dark);">Range:</span>
                    <select id="dash-range-select" style="border: none; background: transparent; outline: none; font-size: 13px; font-weight: 600; color: var(--primary); cursor: pointer;">
                        <option value="year" selected>This Year (2026)</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="7days">Last 7 Days</option>
                    </select>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 6px 12px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 13px; margin-left: auto;">
                    <span style="color: var(--text-light); font-size: 12px;">Telemetry State:</span>
                    <select id="telemetry-state-select" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-size: 12px; outline: none;">
                        <option value="normal" selected>🟢 Normal (Live)</option>
                        <option value="loading">⏳ Simulate Loading</option>
                        <option value="empty">⚪ Simulate Empty</option>
                        <option value="error">🔴 Simulate Error (503)</option>
                    </select>
                </div>
            `;
            pageHeader.parentNode.insertBefore(toolbar, pageHeader.nextSibling);

            // Connect Date Filter
            const rangeSelect = document.getElementById('dash-range-select');
            rangeSelect.addEventListener('change', function () {
                const val = this.value;
                const statValues = statsGrid.querySelectorAll('.value');
                if (val === '7days') {
                    if (statValues[0]) statValues[0].innerText = '142';
                    if (statValues[1]) statValues[1].innerText = '210';
                    if (statValues[2]) statValues[2].innerText = '390';
                    if (statValues[3]) statValues[3].innerText = '$4.8K';
                    if (statValues[4]) statValues[4].innerText = '2';
                } else if (val === '30days') {
                    if (statValues[0]) statValues[0].innerText = '680';
                    if (statValues[1]) statValues[1].innerText = '940';
                    if (statValues[2]) statValues[2].innerText = '1,820';
                    if (statValues[3]) statValues[3].innerText = '$18.5K';
                    if (statValues[4]) statValues[4].innerText = '6';
                } else if (val === '6months') {
                    if (statValues[0]) statValues[0].innerText = '1,940';
                    if (statValues[1]) statValues[1].innerText = '2,810';
                    if (statValues[2]) statValues[2].innerText = '5,400';
                    if (statValues[3]) statValues[3].innerText = '$31.2K';
                    if (statValues[4]) statValues[4].innerText = '9';
                } else {
                    if (statValues[0]) statValues[0].innerText = '2,845';
                    if (statValues[1]) statValues[1].innerText = '4,120';
                    if (statValues[2]) statValues[2].innerText = '8,350';
                    if (statValues[3]) statValues[3].innerText = '$45.2K';
                    if (statValues[4]) statValues[4].innerText = '14';
                }
                if (window.showToast) window.showToast(`Dashboard metrics updated for ${rangeSelect.options[rangeSelect.selectedIndex].text}.`, 'info');
            });

            // Connect Telemetry State Switcher
            const stateSelect = document.getElementById('telemetry-state-select');
            let errorContainer = null;
            let emptyContainer = null;

            stateSelect.addEventListener('change', function () {
                const state = this.value;
                if (errorContainer) errorContainer.remove();
                if (emptyContainer) emptyContainer.remove();

                const statCards = statsGrid.querySelectorAll('.stat-card');
                const charts = document.querySelectorAll('.card');

                if (state === 'loading') {
                    statCards.forEach(card => card.classList.add('skeleton-shimmer'));
                    charts.forEach(c => c.classList.add('skeleton-shimmer'));
                    if (window.showToast) window.showToast('Simulating live telemetry loading state...', 'info');
                    setTimeout(() => {
                        stateSelect.value = 'normal';
                        statCards.forEach(card => card.classList.remove('skeleton-shimmer'));
                        charts.forEach(c => c.classList.remove('skeleton-shimmer'));
                        if (window.showToast) window.showToast('Telemetry stream synchronized successfully.', 'success');
                    }, 2500);
                } else if (state === 'empty') {
                    statCards.forEach(card => card.classList.remove('skeleton-shimmer'));
                    charts.forEach(c => c.classList.remove('skeleton-shimmer'));
                    emptyContainer = document.createElement('div');
                    emptyContainer.className = 'card empty-state-box';
                    emptyContainer.style.gridColumn = '1 / -1';
                    emptyContainer.innerHTML = `
                        <i class="fa-solid fa-chart-line"></i>
                        <h4>No Telemetry Records Found</h4>
                        <p>There are no recorded active server nodes or traffic metrics for this filter configuration.</p>
                        <button class="btn-action primary" id="btn-reset-telemetry" style="padding: 8px 16px; font-size: 13px;">Reset Filter & Sync Nodes</button>
                    `;
                    dashGrid.parentNode.insertBefore(emptyContainer, dashGrid);
                    emptyContainer.querySelector('#btn-reset-telemetry').addEventListener('click', () => {
                        stateSelect.value = 'normal';
                        stateSelect.dispatchEvent(new Event('change'));
                    });
                } else if (state === 'error') {
                    statCards.forEach(card => card.classList.remove('skeleton-shimmer'));
                    charts.forEach(c => c.classList.remove('skeleton-shimmer'));
                    errorContainer = document.createElement('div');
                    errorContainer.className = 'card';
                    errorContainer.style.cssText = 'grid-column: 1 / -1; background: #fef2f2; border: 1px solid #f87171; padding: 25px; text-align: center; border-radius: 10px;';
                    errorContainer.innerHTML = `
                        <div style="font-size: 36px; color: #ef4444; margin-bottom: 10px;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                        <h3 style="color: #991b1b; font-size: 18px; margin-bottom: 6px;">Edge Telemetry Connection Error (HTTP 503)</h3>
                        <p style="color: #7f1d1d; font-size: 13px; max-width: 500px; margin: 0 auto 15px;">Unable to establish persistent WebSocket connection to primary cluster nodes. Metrics aggregation is temporarily suspended.</p>
                        <button class="btn-action" id="btn-retry-telemetry" style="background: #dc2626; margin: 0 auto; padding: 8px 18px; font-size: 13px;"><i class="fa-solid fa-rotate"></i> Retry Cluster Connection</button>
                    `;
                    dashGrid.parentNode.insertBefore(errorContainer, dashGrid);
                    errorContainer.querySelector('#btn-retry-telemetry').addEventListener('click', () => {
                        errorContainer.innerHTML = '<p style="color: #2563eb; font-weight: 500;"><i class="fa-solid fa-spinner fa-spin"></i> Re-establishing edge socket connection...</p>';
                        setTimeout(() => {
                            stateSelect.value = 'normal';
                            stateSelect.dispatchEvent(new Event('change'));
                            if (window.showToast) window.showToast('Cluster connection restored! Real-time metrics streaming.', 'success');
                        }, 1200);
                    });
                } else {
                    statCards.forEach(card => card.classList.remove('skeleton-shimmer'));
                    charts.forEach(c => c.classList.remove('skeleton-shimmer'));
                }
            });
        }

        // Connect Quick Action Buttons
        const quickBtns = document.querySelectorAll('.quick-actions .btn-action');
        quickBtns.forEach(btn => {
            const txt = btn.textContent.toLowerCase();
            if (txt.includes('customer')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'admin-customers.html';
                });
            } else if (txt.includes('plan')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'admin-hosting-plans.html';
                });
            } else if (txt.includes('ticket')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'admin-support.html';
                });
            }
        });
    }

    // B. admin-customers.html
    function initAdminCustomers() {
        const table = document.querySelector('table');
        if (!table) return;
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        let customers = getStore('stackly_customers', DEFAULT_CUSTOMERS);

        function renderRows() {
            tbody.innerHTML = '';
            customers.forEach((c, idx) => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-id', c.id);
                const initials = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                const primaryDomain = c.primaryDomain || (c.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com');
                tr.innerHTML = `
                    <td>
                        <div class="customer-identity">
                            <div class="customer-avatar">${initials}</div>
                            <div>
                                <strong>${c.name}</strong>
                                <span style="font-size: 12px; color: var(--text-light);">${c.email}</span>
                            </div>
                        </div>
                    </td>
                    <td>${c.id}</td>
                    <td>${c.plan}</td>
                    <td>${primaryDomain}</td>
                    <td><span class="badge ${c.status === 'Active' ? 'active' : (c.status === 'Suspended' ? 'suspended' : 'pending')}">${c.status}</span></td>
                    <td>${c.registered}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon view btn-view-cust" title="View Details"><i class="fa-solid fa-eye"></i></button>
                            <button class="btn-icon edit btn-edit-cust" title="Edit Customer"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon suspend btn-suspend-cust" title="${c.status === 'Active' ? 'Suspend' : 'Activate'}">
                                <i class="fa-solid ${c.status === 'Active' ? 'fa-ban' : 'fa-check'}"></i>
                            </button>
                            <button class="btn-icon delete btn-delete-cust" title="Delete"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            attachCustomerEvents();
            updateStats();
        }

        function updateStats() {
            const activeCount = customers.filter(c => c.status === 'Active').length;
            const suspendedCount = customers.filter(c => c.status === 'Suspended').length;
            const pendingCount = customers.filter(c => c.status === 'Pending').length;

            const statVals = document.querySelectorAll('.stats-grid .value');
            if (statVals[0]) statVals[0].innerText = customers.length.toLocaleString();
            if (statVals[1]) statVals[1].innerText = activeCount.toLocaleString();
            if (statVals[2]) statVals[2].innerText = suspendedCount.toLocaleString();
            if (statVals[3]) statVals[3].innerText = pendingCount.toLocaleString();
        }

        function attachCustomerEvents() {
            // View Details Modal
            tbody.querySelectorAll('.btn-view-cust').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.closest('tr').getAttribute('data-id');
                    const c = customers.find(x => x.id === id);
                    if (!c) return;

                    const modal = document.getElementById('customer-modal') || document.querySelector('.modal-overlay');
                    if (!modal) return;
                    const title = modal.querySelector('.modal-header h2');
                    if (title) title.innerText = `Customer Profile: ${c.name}`;

                    const body = modal.querySelector('.modal-body');
                    if (body) {
                        body.innerHTML = `
                            <div class="modal-grid">
                                <div class="detail-group">
                                    <h4>Primary Details</h4>
                                    <div class="detail-row"><span>Customer ID:</span> <span>${c.id}</span></div>
                                    <div class="detail-row"><span>Full Name:</span> <span>${c.name}</span></div>
                                    <div class="detail-row"><span>Email Address:</span> <span>${c.email}</span></div>
                                    <div class="detail-row"><span>Account Status:</span> <span class="badge ${c.status.toLowerCase()}">${c.status}</span></div>
                                </div>
                                <div class="detail-group">
                                    <h4>Hosting & Billing</h4>
                                    <div class="detail-row"><span>Current Plan:</span> <span>${c.plan}</span></div>
                                    <div class="detail-row"><span>Websites:</span> <span>${c.websites} Active Sites</span></div>
                                    <div class="detail-row"><span>Total Spend:</span> <span>${c.spend}</span></div>
                                    <div class="detail-row"><span>Member Since:</span> <span>${c.registered}</span></div>
                                </div>
                            </div>
                            <div class="activity-log">
                                <h4>Recent Verified Account Activity</h4>
                                <div class="log-item"><span>Control panel session active</span> <span>Today, 10:45 AM</span></div>
                                <div class="log-item"><span>Service tier: ${c.plan}</span> <span>${c.registered}</span></div>
                                <div class="log-item"><span>Automated backup verified</span> <span>Yesterday, 04:00 AM</span></div>
                            </div>
                        `;
                    }
                    modal.classList.add('active');
                });
            });

            // Edit Customer Modal
            tbody.querySelectorAll('.btn-edit-cust').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!verifyAdminClearance()) return;
                    const id = btn.closest('tr').getAttribute('data-id');
                    const c = customers.find(x => x.id === id);
                    if (!c) return;

                    const formHtml = `
                        <div style="display: flex; flex-direction: column; gap: 14px; padding: 10px 0;">
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Full Name</label>
                                <input type="text" id="edit-c-name" value="${c.name}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Email Address</label>
                                <input type="email" id="edit-c-email" value="${c.email}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div>
                                    <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Plan</label>
                                    <select id="edit-c-plan" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                                        <option value="Shared Starter" ${c.plan.includes('Shared') ? 'selected' : ''}>Shared Starter</option>
                                        <option value="VPS Professional" ${c.plan.includes('VPS') ? 'selected' : ''}>VPS Professional</option>
                                        <option value="WordPress Hosting" ${c.plan.includes('WordPress') ? 'selected' : ''}>WordPress Hosting</option>
                                        <option value="Dedicated Alpha" ${c.plan.includes('Dedicated') ? 'selected' : ''}>Dedicated Alpha</option>
                                        <option value="Cloud Scaled" ${c.plan.includes('Cloud') ? 'selected' : ''}>Cloud Scaled</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Status</label>
                                    <select id="edit-c-status" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                                        <option value="Active" ${c.status === 'Active' ? 'selected' : ''}>Active</option>
                                        <option value="Suspended" ${c.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                                        <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    `;

                    confirmAction({
                        title: `Edit Customer: ${c.name}`,
                        message: formHtml,
                        confirmText: 'Save Changes',
                        isDanger: false,
                        onConfirm: () => {
                            const newName = document.getElementById('edit-c-name').value.trim();
                            const newEmail = document.getElementById('edit-c-email').value.trim();
                            const newPlan = document.getElementById('edit-c-plan').value;
                            const newStatus = document.getElementById('edit-c-status').value;

                            if (!newName || !newEmail) {
                                if (window.showToast) window.showToast('Name and email cannot be empty.', 'error');
                                return;
                            }
                            c.name = newName;
                            c.email = newEmail;
                            c.plan = newPlan;
                            c.status = newStatus;
                            setStore('stackly_customers', customers);
                            renderRows();
                            if (window.showToast) window.showToast(`Customer ${c.name} updated successfully!`, 'success');
                        }
                    });
                });
            });

            // Suspend / Activate Toggle
            tbody.querySelectorAll('.btn-suspend-cust').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!verifyAdminClearance()) return;
                    const id = btn.closest('tr').getAttribute('data-id');
                    const c = customers.find(x => x.id === id);
                    if (!c) return;

                    const newStatus = c.status === 'Active' ? 'Suspended' : 'Active';
                    c.status = newStatus;
                    setStore('stackly_customers', customers);
                    renderRows();
                    if (window.showToast) window.showToast(`Customer ${c.name} is now ${newStatus}.`, 'info');
                });
            });

            // Delete Customer
            tbody.querySelectorAll('.btn-delete-cust').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!verifyAdminClearance()) return;
                    const id = btn.closest('tr').getAttribute('data-id');
                    const c = customers.find(x => x.id === id);
                    if (!c) return;

                    confirmAction({
                        title: 'Delete Customer Record',
                        message: `Are you sure you want to permanently delete customer <strong>${c.name}</strong> (${c.email})? All associated hosting containers, domain associations, and billing history will be terminated.`,
                        confirmText: 'Delete Customer',
                        isDanger: true,
                        onConfirm: () => {
                            customers = customers.filter(x => x.id !== id);
                            setStore('stackly_customers', customers);
                            renderRows();
                            if (window.showToast) window.showToast(`Customer ${c.name} has been removed.`, 'success');
                        }
                    });
                });
            });
        }

        // Add Customer Modal
        const btnAddCustomer = document.querySelector('.page-header .btn-action');
        if (btnAddCustomer) {
            btnAddCustomer.addEventListener('click', (e) => {
                e.preventDefault();
                if (!verifyAdminClearance()) return;
                const formHtml = `
                    <div style="display: flex; flex-direction: column; gap: 14px; padding: 10px 0;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Customer Name *</label>
                            <input type="text" id="add-c-name" placeholder="e.g. Alex Henderson" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Email Address *</label>
                            <input type="email" id="add-c-email" placeholder="e.g. alex@example.com" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Initial Plan</label>
                                <select id="add-c-plan" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                                    <option value="Shared Starter">Shared Starter ($4.99/mo)</option>
                                    <option value="VPS Professional" selected>VPS Professional ($29.99/mo)</option>
                                    <option value="WordPress Hosting">WordPress Hosting ($14.99/mo)</option>
                                    <option value="Dedicated Alpha">Dedicated Alpha ($199/mo)</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Initial Status</label>
                                <select id="add-c-status" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending Verification</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;

                confirmAction({
                    title: 'Add New Customer',
                    message: formHtml,
                    confirmText: 'Create Customer',
                    isDanger: false,
                    onConfirm: () => {
                        const name = document.getElementById('add-c-name').value.trim();
                        const email = document.getElementById('add-c-email').value.trim();
                        const plan = document.getElementById('add-c-plan').value;
                        const status = document.getElementById('add-c-status').value;

                        if (!name || !email || !email.includes('@')) {
                            if (window.showToast) window.showToast('Please enter a valid customer name and email address.', 'error');
                            return;
                        }

                        const newCust = {
                            id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
                            name: name,
                            email: email,
                            plan: plan,
                            status: status,
                            registered: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            websites: 1,
                            spend: '$29.99'
                        };
                        customers.unshift(newCust);
                        setStore('stackly_customers', customers);
                        renderRows();
                        if (window.showToast) window.showToast(`Customer account for ${name} provisioned successfully!`, 'success');
                    }
                });
            });
        }

        renderRows();
    }

    // C. admin-domains.html
    function initAdminDomains() {
        const table = document.querySelector('table');
        if (!table) return;
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        let domains = getStore('stackly_domains', DEFAULT_DOMAINS);

        function renderRows() {
            tbody.innerHTML = '';
            domains.forEach((d, idx) => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-domain', d.domain);
                const ext = '.' + d.domain.split('.').pop();
                tr.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fa-solid fa-globe" style="color: var(--primary);"></i>
                            <strong>${d.domain}</strong>
                        </div>
                    </td>
                    <td>
                        <div>
                            <strong>${d.owner}</strong>
                            <span style="font-size: 12px; color: var(--text-light); display: block;">${d.email}</span>
                        </div>
                    </td>
                    <td><span class="badge" style="background: rgba(37,99,235,0.1); color: var(--primary); font-weight: 600;">${ext}</span></td>
                    <td>${d.registered}</td>
                    <td>${d.expiry}</td>
                    <td><span class="badge ${d.status === 'Active' ? 'active' : (d.status.includes('Expiring') ? 'expiring' : 'expired')}">${d.status}</span></td>
                    <td>
                        <i class="fa-solid ${d.autoRenew ? 'fa-toggle-on text-green' : 'fa-toggle-off'} toggle-domain-renew" 
                           style="font-size: 18px; cursor: pointer; color: ${d.autoRenew ? 'var(--green)' : '#94a3b8'};"></i> 
                        <span style="font-size: 12px; margin-left: 4px;">${d.autoRenew ? 'ON' : 'OFF'}</span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon view btn-view-domain" title="Manage DNS"><i class="fa-solid fa-network-wired"></i></button>
                            <button class="btn-icon edit btn-renew-domain" title="Renew Domain (+1 Year)"><i class="fa-solid fa-rotate"></i></button>
                            <button class="btn-icon delete btn-delete-domain" title="Delete Domain"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            attachDomainEvents();
        }

        function attachDomainEvents() {
            // DNS Management Modal
            tbody.querySelectorAll('.btn-view-domain').forEach(btn => {
                btn.addEventListener('click', () => {
                    const domainName = btn.closest('tr').getAttribute('data-domain');
                    const dnsHtml = `
                        <div style="font-size: 13px;">
                            <p style="margin-bottom: 15px; color: #64748b;">Managing live DNS Zone for <strong>${domainName}</strong>. Global propagation in 15-30s.</p>
                            <table style="width: 100%; border: 1px solid #e2e8f0; margin-bottom: 15px;">
                                <tr style="background: #f8fafc; font-weight: 600;">
                                    <th style="padding: 8px;">Type</th>
                                    <th style="padding: 8px;">Host</th>
                                    <th style="padding: 8px;">Target Value</th>
                                    <th style="padding: 8px;">TTL</th>
                                </tr>
                                <tr>
                                    <td style="padding: 8px;"><span class="badge active">A</span></td>
                                    <td style="padding: 8px;">@</td>
                                    <td style="padding: 8px;">192.241.174.52</td>
                                    <td style="padding: 8px;">3600</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px;"><span class="badge active">CNAME</span></td>
                                    <td style="padding: 8px;">www</td>
                                    <td style="padding: 8px;">${domainName}</td>
                                    <td style="padding: 8px;">3600</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px;"><span class="badge active">MX</span></td>
                                    <td style="padding: 8px;">mail</td>
                                    <td style="padding: 8px;">mail.${domainName} (10)</td>
                                    <td style="padding: 8px;">14400</td>
                                </tr>
                            </table>
                            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                                <div style="font-weight: 600; margin-bottom: 8px; color: var(--dark-blue);">+ Add New DNS Record</div>
                                <div style="display: grid; grid-template-columns: 80px 100px 1fr; gap: 8px;">
                                    <select id="dns-type" style="padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px;"><option>A</option><option>CNAME</option><option>TXT</option><option>MX</option></select>
                                    <input type="text" id="dns-host" placeholder="subdomain" style="padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px;">
                                    <input type="text" id="dns-val" placeholder="IP or destination" style="padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px;">
                                </div>
                            </div>
                        </div>
                    `;

                    confirmAction({
                        title: `DNS Zone Editor: ${domainName}`,
                        message: dnsHtml,
                        confirmText: 'Save Record & Propagate',
                        isDanger: false,
                        onConfirm: () => {
                            if (window.showToast) window.showToast(`[Demo] DNS zone for ${domainName} updated in local session. (Production requires DNS server API)`, 'success');
                        }
                    });
                });
            });

            // Renew Domain (+1 Year)
            tbody.querySelectorAll('.btn-renew-domain').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!verifyAdminClearance()) return;
                    const domainName = btn.closest('tr').getAttribute('data-domain');
                    const d = domains.find(x => x.domain === domainName);
                    if (!d) return;

                    confirmAction({
                        title: `Renew Domain: ${d.domain}`,
                        message: `Extend registration for <strong>${d.domain}</strong> by 1 Year? This will update the expiration date from <strong>${d.expiry}</strong> to <strong>Oct 2, 2028</strong>.`,
                        confirmText: 'Renew Now ($12.99)',
                        isDanger: false,
                        onConfirm: () => {
                            d.expiry = 'Oct 2, 2028';
                            d.status = 'Active';
                            setStore('stackly_domains', domains);
                            renderRows();
                            if (window.showToast) window.showToast(`[Demo] ${d.domain} renewal simulated (+1 Year). (Production requires registrar API)`, 'success');
                        }
                    });
                });
            });

            // Toggle Auto-renew
            tbody.querySelectorAll('.toggle-domain-renew').forEach(icon => {
                icon.addEventListener('click', () => {
                    const domainName = icon.closest('tr').getAttribute('data-domain');
                    const d = domains.find(x => x.domain === domainName);
                    if (!d) return;
                    d.autoRenew = !d.autoRenew;
                    setStore('stackly_domains', domains);
                    renderRows();
                    if (window.showToast) window.showToast(`Auto-renewal for ${d.domain} is now ${d.autoRenew ? 'enabled' : 'disabled'}.`, 'info');
                });
            });

            // Delete Domain
            tbody.querySelectorAll('.btn-delete-domain').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!verifyAdminClearance()) return;
                    const domainName = btn.closest('tr').getAttribute('data-domain');
                    confirmAction({
                        title: 'Delete Domain from Registry',
                        message: `Are you sure you want to release <strong>${domainName}</strong> from active registry management? The DNS zone will be purged.`,
                        confirmText: 'Delete Domain',
                        isDanger: true,
                        onConfirm: () => {
                            domains = domains.filter(x => x.domain !== domainName);
                            setStore('stackly_domains', domains);
                            renderRows();
                            if (window.showToast) window.showToast(`Domain ${domainName} deleted.`, 'success');
                        }
                    });
                });
            });
        }

        // Add Domain Button
        const btnAddDomain = document.querySelector('.page-header .btn-action');
        if (btnAddDomain) {
            btnAddDomain.addEventListener('click', (e) => {
                e.preventDefault();
                if (!verifyAdminClearance()) return;
                const formHtml = `
                    <div style="display: flex; flex-direction: column; gap: 12px; padding: 10px 0;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Domain Name *</label>
                            <input type="text" id="add-d-name" placeholder="e.g. freshbrand.com" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Owner Full Name *</label>
                            <input type="text" id="add-d-owner" placeholder="e.g. Alex Henderson" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Owner Email *</label>
                            <input type="email" id="add-d-email" placeholder="e.g. alex@example.com" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                        </div>
                    </div>
                `;

                confirmAction({
                    title: 'Register New Domain Record',
                    message: formHtml,
                    confirmText: 'Register Domain',
                    isDanger: false,
                    onConfirm: () => {
                        const dName = document.getElementById('add-d-name').value.trim().toLowerCase();
                        const dOwner = document.getElementById('add-d-owner').value.trim();
                        const dEmail = document.getElementById('add-d-email').value.trim();

                        if (!dName || !dName.includes('.') || !dOwner || !dEmail) {
                            if (window.showToast) window.showToast('Please enter a valid domain (e.g. mycompany.com) and contact information.', 'error');
                            return;
                        }

                        const newDom = {
                            domain: dName,
                            owner: dOwner,
                            email: dEmail,
                            registered: 'Today',
                            expiry: 'Oct 16, 2027',
                            autoRenew: true,
                            ssl: 'Secured',
                            status: 'Active'
                        };
                        domains.unshift(newDom);
                        setStore('stackly_domains', domains);
                        renderRows();
                        if (window.showToast) window.showToast(`[Demo] ${dName} provisioned in prototype state. (Production requires EPP registrar API)`, 'success');
                    }
                });
            });
        }

        renderRows();
    }

    // D. admin-hosting-plans.html
    function initAdminHostingPlans() {
        let plans = getStore('stackly_plans', DEFAULT_PLANS);

        // Edit existing plan buttons in table or cards
        document.querySelectorAll('.btn-icon.edit, .plan-card .btn-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!verifyAdminClearance()) return;
                const card = btn.closest('.plan-card') || btn.closest('tr');
                const planName = card ? (card.querySelector('h3') ? card.querySelector('h3').innerText : card.children[0].innerText) : 'VPS Professional';
                const p = plans.find(x => x.name.toLowerCase().includes(planName.toLowerCase().split(' ')[0])) || plans[1];

                const editHtml = `
                    <div style="display: flex; flex-direction: column; gap: 12px; padding: 10px 0;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Plan Name</label>
                            <input type="text" id="hp-name" value="${p.name}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Monthly Price</label>
                                <input type="text" id="hp-price" value="${p.price}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">NVMe Storage</label>
                                <input type="text" id="hp-storage" value="${p.storage}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                            </div>
                        </div>
                    </div>
                `;

                confirmAction({
                    title: `Edit Hosting Plan: ${p.name}`,
                    message: editHtml,
                    confirmText: 'Save Plan Changes',
                    isDanger: false,
                    onConfirm: () => {
                        p.name = document.getElementById('hp-name').value.trim();
                        p.price = document.getElementById('hp-price').value.trim();
                        p.storage = document.getElementById('hp-storage').value.trim();
                        setStore('stackly_plans', plans);
                        if (window.showToast) window.showToast(`Hosting plan ${p.name} updated!`, 'success');
                    }
                });
            });
        });
    }

    // E. admin-orders.html & admin-billing.html
    function initAdminOrdersAndBilling() {
        const invoices = getStore('stackly_invoices', DEFAULT_INVOICES);

        // Download Receipt Buttons
        document.querySelectorAll('.btn-icon.download, .btn-download-invoice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tr = btn.closest('tr');
                const invId = tr ? (tr.children[0].innerText || 'INV-2042') : 'INV-2042';
                const inv = invoices.find(x => invId.includes(x.id)) || invoices[0];
                downloadReceipt(inv);
            });
        });

        // View Invoice Details Modal
        document.querySelectorAll('.btn-view-modal, .btn-icon.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tr = btn.closest('tr');
                if (!tr) return;
                const invId = tr.children[0].innerText.replace('#', '').trim();
                const inv = invoices.find(x => x.id === invId || invId.includes(x.id)) || invoices[0];

                const modal = document.querySelector('.modal-overlay') || document.getElementById('invoice-modal');
                if (modal) {
                    const header = modal.querySelector('.modal-header h2');
                    if (header) header.innerText = `Invoice Breakdown: ${inv.id}`;
                    modal.classList.add('active');
                }
            });
        });

        // Export Orders CSV Button
        const exportCsvBtn = document.querySelector('.page-header .btn-action');
        if (exportCsvBtn && exportCsvBtn.textContent.includes('CSV')) {
            exportCsvBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const orders = getStore('stackly_orders', DEFAULT_ORDERS);
                const headers = ['Order ID', 'Customer', 'Email', 'Plan', 'Date', 'Amount', 'Status', 'Payment Method'];
                const rows = orders.map(o => [o.id, o.customer, o.email, o.plan, o.date, o.amount, o.status, o.paymentMethod]);
                downloadCSV('Stackly-Orders-Export.csv', headers, rows);
                if (window.showToast) window.showToast('Orders exported successfully to CSV!', 'success');
            });
        }

        // Modal Action Buttons (Download PDF, Resend)
        document.querySelectorAll('.modal .btn-action, .modal-footer .btn-action').forEach(btn => {
            const txt = btn.textContent.toLowerCase();
            if (txt.includes('pdf') || txt.includes('download') || txt.includes('print')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    downloadReceipt(invoices[0]);
                });
            } else if (txt.includes('resend') || txt.includes('send')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.showToast) window.showToast('Invoice sent to customer billing email successfully!', 'success');
                });
            }
        });
    }

    // F. admin-reports.html
    function initAdminReports() {
        const exportCsvBtn = document.querySelector('button[data-format="csv"]') || document.querySelector('.export-actions button');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const headers = ['Period', 'Paid Revenue ($)', 'Pending Orders ($)', 'New Customers', 'Refund Rate (%)'];
                const rows = [
                    ['May 2026', '15000', '2000', '65', '1.2%'],
                    ['Jun 2026', '18000', '1500', '80', '0.8%'],
                    ['Jul 2026', '19500', '2500', '75', '1.4%'],
                    ['Aug 2026', '21000', '1800', '110', '1.0%'],
                    ['Sep 2026', '22500', '3000', '130', '0.9%'],
                    ['Oct 2026', '24500', '2200', '150', '0.7%']
                ];
                downloadCSV('Stackly-Revenue-Report-2026.csv', headers, rows);
            });
        }
    }

    // G. admin-support.html
    function initAdminSupport() {
        const tickets = getStore('stackly_tickets', DEFAULT_TICKETS);
        const replyBtn = document.querySelector('.reply-box .btn-action');
        const replyTextarea = document.querySelector('.reply-box textarea');
        const chatContainer = document.querySelector('.chat-container');

        if (replyBtn && replyTextarea && chatContainer) {
            replyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const text = replyTextarea.value.trim();
                if (!text) {
                    if (window.showToast) window.showToast('Please type your response message.', 'error');
                    return;
                }

                const msgDiv = document.createElement('div');
                msgDiv.className = 'chat-msg admin';
                msgDiv.innerHTML = `
                    <div class="author">Admin User (You) <span class="time">Just now</span></div>
                    <div class="text">${text}</div>
                `;
                chatContainer.insertBefore(msgDiv, replyTextarea.closest('.reply-box'));
                replyTextarea.value = '';
                if (window.showToast) window.showToast('Reply appended to ticket thread.', 'success');
            });
        }

        // Resolve Ticket
        const resolveBtn = document.querySelector('.reply-box button[style*="green"]');
        if (resolveBtn) {
            resolveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.showToast) window.showToast('Ticket marked as Resolved.', 'success');
                const modal = document.querySelector('.modal-overlay');
                if (modal) modal.classList.remove('active');
            });
        }

        // Close Ticket
        const closeTicketBtn = document.querySelector('.reply-box button[style*="red"]');
        if (closeTicketBtn) {
            closeTicketBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.showToast) window.showToast('Ticket #TKT-1042 closed.', 'info');
                const modal = document.querySelector('.modal-overlay');
                if (modal) modal.classList.remove('active');
            });
        }

        // Create Ticket Button
        const btnCreateTicket = document.querySelector('.page-header .btn-action');
        if (btnCreateTicket && btnCreateTicket.textContent.includes('Create Ticket')) {
            btnCreateTicket.addEventListener('click', (e) => {
                e.preventDefault();
                const formHtml = `
                    <div style="display: flex; flex-direction: column; gap: 12px; padding: 10px 0;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Customer Email *</label>
                            <input type="email" id="tkt-email" placeholder="customer@example.com" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Subject *</label>
                            <input type="text" id="tkt-sub" placeholder="Issue summary" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Category</label>
                                <select id="tkt-cat" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;"><option>Technical</option><option>Billing</option><option>Sales</option><option>DNS</option></select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px;">Priority</label>
                                <select id="tkt-pri" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;"><option>Medium</option><option>High</option><option>Low</option></select>
                            </div>
                        </div>
                    </div>
                `;
                confirmAction({
                    title: 'Create Internal Support Ticket',
                    message: formHtml,
                    confirmText: 'Open Ticket',
                    isDanger: false,
                    onConfirm: () => {
                        const email = document.getElementById('tkt-email').value.trim();
                        const sub = document.getElementById('tkt-sub').value.trim();
                        const cat = document.getElementById('tkt-cat').value;
                        const pri = document.getElementById('tkt-pri').value;
                        if (!email || !sub) {
                            if (window.showToast) window.showToast('Please enter both customer email and subject.', 'error');
                            return;
                        }
                        const newT = {
                            id: `#TKT-${Math.floor(1000 + Math.random() * 9000)}`,
                            customer: email.split('@')[0],
                            email: email,
                            subject: sub,
                            category: cat,
                            priority: pri,
                            status: 'Open',
                            date: 'Just now',
                            messages: [{ author: 'Admin User', time: 'Just now', text: sub, isAdmin: true }]
                        };
                        tickets.unshift(newT);
                        setStore('stackly_tickets', tickets);
                        if (window.showToast) window.showToast(`Ticket ${newT.id} created successfully!`, 'success');
                    }
                });
            });
        }
    }

    // ==========================================
    // 4. USER MODULE CONTROLLERS
    // ==========================================

    // A. user-hosting.html
    function initUserHosting() {
        // cPanel Management Modal & Actions
        document.querySelectorAll('.site-actions .btn-action, .site-actions .btn-outline').forEach(btn => {
            const text = btn.innerText.toLowerCase();
            if (text.includes('manage') || text.includes('cpanel')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    confirmAction({
                        title: 'cPanel Management Console',
                        message: `
                            <div style="font-size: 13px;">
                                <p style="color: #64748b; margin-bottom: 15px;">Single Sign-On (SSO) active for server node <strong>vps-node42.stackly.com</strong>.</p>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center;">
                                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;">
                                        <i class="fa-solid fa-folder-open" style="font-size: 24px; color: var(--primary); margin-bottom: 6px;"></i>
                                        <div style="font-weight: 600;">File Manager</div>
                                    </div>
                                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;">
                                        <i class="fa-solid fa-database" style="font-size: 24px; color: var(--yellow); margin-bottom: 6px;"></i>
                                        <div style="font-weight: 600;">phpMyAdmin</div>
                                    </div>
                                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;">
                                        <i class="fa-solid fa-lock" style="font-size: 24px; color: var(--green); margin-bottom: 6px;"></i>
                                        <div style="font-weight: 600;">SSL / TLS</div>
                                    </div>
                                </div>
                            </div>
                        `,
                        confirmText: 'Open Full cPanel',
                        isDanger: false,
                        onConfirm: () => {
                            if (window.showToast) window.showToast('[Demo] SSO launch token generated for server console.', 'info');
                        }
                    });
                });
            } else if (text.includes('backup')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    confirmAction({
                        title: 'Create Cloud Snapshot',
                        message: 'This will initiate a live snapshot of all WordPress files, MySQL databases, and server configurations.',
                        confirmText: 'Start Snapshot',
                        isDanger: false,
                        onConfirm: () => {
                            if (window.showToast) window.showToast('[Demo] Server snapshot simulated. (Production requires server daemon API)', 'success');
                        }
                    });
                });
            } else if (text.includes('settings')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const card = btn.closest('.website-card');
                    const domainName = card ? card.querySelector('h4').innerText : 'Website';
                    confirmAction({
                        title: `Settings: ${domainName}`,
                        message: `
                            <div style="font-size: 13px;">
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <div>
                                        <label style="display: block; font-weight: 500; margin-bottom: 5px;">PHP Engine Version</label>
                                        <select id="site-php-ver" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                                            <option value="8.3" selected>PHP 8.3 (Hardened & Optimized)</option>
                                            <option value="8.2">PHP 8.2 (Stable)</option>
                                            <option value="8.1">PHP 8.1 (LTS)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style="display: block; font-weight: 500; margin-bottom: 5px;">SSL Certificate Mode</label>
                                        <select id="site-ssl-mode" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                                            <option value="auto" selected>AutoSSL (Let's Encrypt Wildcard)</option>
                                            <option value="custom">Custom Commercial Certificate</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        `,
                        confirmText: 'Save Configuration',
                        isDanger: false,
                        onConfirm: () => {
                            const ver = document.getElementById('site-php-ver').value;
                            if (window.showToast) window.showToast(`[Demo] Server configured to PHP ${ver}. (Production requires cPanel API)`, 'success');
                        }
                    });
                });
            }
        });

        // Add New Website Action
        const addWebBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add New Website'));
        if (addWebBtn) {
            addWebBtn.addEventListener('click', (e) => {
                e.preventDefault();
                confirmAction({
                    title: 'Deploy New Website',
                    message: `
                        <div style="font-size: 13px;">
                            <p style="margin-bottom: 15px; color: #64748b;">Deploy a new domain or subdomain onto your allocated server partition:</p>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <div>
                                    <label style="display: block; font-weight: 500; margin-bottom: 5px;">Domain / Subdomain</label>
                                    <input type="text" id="new-site-domain" placeholder="e.g. store.mytechblog.com" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                                </div>
                                <div>
                                    <label style="display: block; font-weight: 500; margin-bottom: 5px;">Application Stack</label>
                                    <select id="new-site-app" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                                        <option value="WordPress 6.6" selected>WordPress 6.6 with LiteSpeed Cache</option>
                                        <option value="Node.js 20">Node.js 20 LTS Application</option>
                                        <option value="Laravel 11">Laravel 11 Cloud Container</option>
                                        <option value="Static HTML">Pure Static HTML/CSS</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    `,
                    confirmText: 'Deploy Website',
                    isDanger: false,
                    onConfirm: () => {
                        const d = document.getElementById('new-site-domain').value.trim();
                        if (!d) {
                            if (window.showToast) window.showToast('Please specify a domain or subdomain.', 'error');
                            return;
                        }
                        if (window.showToast) window.showToast(`[Demo] Website ${d} provisioned. (Production requires automated cPanel vhost API)`, 'success');
                    }
                });
            });
        }

        // Plan Summary Upgrade Button
        const planUpgradeBtn = document.querySelector('.plan-summary .btn-action');
        if (planUpgradeBtn) {
            planUpgradeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.showToast) window.showToast('[Demo] Hosting upgrade options displayed. Redirecting to billing overview...', 'info');
                setTimeout(() => {
                    window.location.href = 'user-billing.html';
                }, 800);
            });
        }
    }

    // B. user-domains.html
    function initUserDomains() {
        const searchBtn = document.getElementById('btn-search-domain');
        const searchInput = document.getElementById('domain-search-input');
        const searchExt = document.getElementById('domain-search-ext');

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const term = searchInput.value.trim().toLowerCase();
                const ext = searchExt ? searchExt.value : '.com';
                if (!term) {
                    if (window.showToast) window.showToast('Please enter a domain prefix to search.', 'error');
                    return;
                }

                const fullDomain = term.includes('.') ? term : term + ext;
                confirmAction({
                    title: `Domain Search: ${fullDomain}`,
                    message: `
                        <div style="text-align: center; padding: 15px 0;">
                            <div style="font-size: 38px; color: var(--green); margin-bottom: 8px;"><i class="fa-solid fa-circle-check"></i></div>
                            <h3 style="color: var(--dark-blue); font-size: 18px; margin-bottom: 5px;">${fullDomain} is Available!</h3>
                            <p style="color: #64748b; font-size: 13px; margin-bottom: 12px;">Standard 1-year registration with free Privacy Protection and DNSSEC.</p>
                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">$12.99 <span style="font-size: 13px; font-weight: normal; color: #64748b;">/year</span></div>
                        </div>
                    `,
                    confirmText: 'Register & Add to My Domains',
                    isDanger: false,
                    onConfirm: () => {
                        const domains = getStore('stackly_domains', DEFAULT_DOMAINS);
                        domains.unshift({
                            domain: fullDomain,
                            owner: localStorage.getItem('stacklyUsername') || 'Client Account',
                            email: localStorage.getItem('userEmail') || 'user@stackly.com',
                            registered: 'Today',
                            expiry: 'Oct 16, 2027',
                            autoRenew: true,
                            ssl: 'Secured',
                            status: 'Active'
                        });
                        setStore('stackly_domains', domains);
                        if (window.showToast) window.showToast(`[Demo] ${fullDomain} added to prototype portfolio. (Production requires registrar API)`, 'success');
                        setTimeout(() => window.location.reload(), 1200);
                    }
                });
            });
        }
    }

    // C. user-billing.html
    function initUserBilling() {
        const invoices = getStore('stackly_invoices', DEFAULT_INVOICES);

        // Download PDF / HTML receipts
        document.querySelectorAll('.table-responsive button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tr = btn.closest('tr');
                const invId = tr ? tr.children[0].innerText.replace('#', '').trim() : 'INV-2042';
                const inv = invoices.find(x => x.id === invId) || invoices[0];
                downloadReceipt(inv);
            });
        });

        // Update Payment Method Modal
        const updatePayBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Update Payment Method'));
        if (updatePayBtn) {
            updatePayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const payModalHtml = `
                    <div style="font-size: 13px;">
                        <p style="margin-bottom: 15px; color: #64748b;">Enter your updated card credentials below. (Demonstration mode: No live card charges will occur).</p>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 5px;">Cardholder Name</label>
                                <input type="text" id="pay-card-name" value="${localStorage.getItem('stacklyUsername') || 'Client Account'}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                            </div>
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 5px;">Card Number</label>
                                <input type="text" id="pay-card-num" placeholder="4242 •••• •••• 4242" maxlength="19" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div>
                                    <label style="display: block; font-weight: 500; margin-bottom: 5px;">Expiry Date</label>
                                    <input type="text" id="pay-card-exp" placeholder="MM/YY" maxlength="5" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                                </div>
                                <div>
                                    <label style="display: block; font-weight: 500; margin-bottom: 5px;">CVC / CVV</label>
                                    <input type="password" id="pay-card-cvc" placeholder="•••" maxlength="4" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-family: inherit;">
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 15px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; color: #64748b;">
                            <i class="fa-solid fa-shield-halved" style="color: var(--primary);"></i> <strong>Demo Notice:</strong> In production, payment forms must use PCI-DSS Level 1 compliant tokenization (e.g. Stripe Elements or PayPal Vault).
                        </div>
                    </div>
                `;
                confirmAction({
                    title: 'Update Payment Method',
                    message: payModalHtml,
                    confirmText: 'Save Payment Details',
                    isDanger: false,
                    onConfirm: () => {
                        const cardNum = document.getElementById('pay-card-num').value.trim();
                        const last4 = cardNum.length >= 4 ? cardNum.slice(-4) : '4242';
                        const cardHeader = document.querySelector('h4[style*="var(--dark-blue)"]');
                        if (cardHeader && cardHeader.innerText.includes('Visa')) {
                            cardHeader.innerText = `Visa ending in ${last4}`;
                        }
                        if (window.showToast) window.showToast(`[Demo] Payment method updated (ending in ${last4}). (Production requires Stripe API)`, 'success');
                    }
                });
            });
        }

        // Upgrade Plan Modal
        const upgradePlanBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Upgrade Plan'));
        if (upgradePlanBtn) {
            upgradePlanBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const upgradeHtml = `
                    <div style="font-size: 13px;">
                        <p style="margin-bottom: 15px; color: #64748b;">Select an enterprise tier to instantly scale your server resources:</p>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 2px solid var(--primary); border-radius: 8px; cursor: pointer; background: #eff6ff;">
                                <input type="radio" name="upgrade_tier" value="Cloud Enterprise ($79.99/mo)" checked>
                                <div>
                                    <strong style="color: var(--dark-blue);">Cloud Enterprise</strong> - $79.99/mo
                                    <div style="font-size: 12px; color: var(--text-light);">8 vCPU Cores, 32 GB RAM, 500 GB NVMe Storage</div>
                                </div>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
                                <input type="radio" name="upgrade_tier" value="Dedicated Alpha ($199.99/mo)">
                                <div>
                                    <strong style="color: var(--dark-blue);">Dedicated Alpha</strong> - $199.99/mo
                                    <div style="font-size: 12px; color: var(--text-light);">16 vCPU Cores, 64 GB RAM, 2 TB Enterprise NVMe</div>
                                </div>
                            </label>
                        </div>
                    </div>
                `;
                confirmAction({
                    title: 'Upgrade Hosting Subscription',
                    message: upgradeHtml,
                    confirmText: 'Confirm Upgrade',
                    isDanger: false,
                    onConfirm: () => {
                        const selected = document.querySelector('input[name="upgrade_tier"]:checked');
                        const tierName = selected ? selected.value : 'Cloud Enterprise';
                        if (window.showToast) window.showToast(`[Demo] Plan upgraded to ${tierName}. (Production requires billing proration API)`, 'success');
                    }
                });
            });
        }

        // Cancel Subscription Confirmation
        const cancelBtn = document.querySelector('button[style*="red"], .btn-outline[style*="fca5a5"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                confirmAction({
                    title: 'Cancel Hosting Subscription',
                    message: 'Are you sure you want to cancel your <strong>VPS Professional</strong> hosting subscription? Your websites will remain active until the end of the current billing cycle on <strong>Nov 2, 2026</strong>.',
                    confirmText: 'Confirm Cancellation',
                    isDanger: true,
                    onConfirm: () => {
                        if (window.showToast) window.showToast('[Demo] Subscription scheduled for cancellation at billing cycle end.', 'info');
                    }
                });
            });
        }
    }

    // D. user-support.html
    function handleUserTicketCreate(ticketData) {
        const tickets = getStore('stackly_tickets', DEFAULT_TICKETS);
        const newTicket = {
            id: `#TKT-${Math.floor(1000 + Math.random() * 9000)}`,
            customer: localStorage.getItem('stacklyUsername') || 'Client Account',
            email: localStorage.getItem('userEmail') || 'user@stackly.com',
            subject: ticketData.subject,
            category: ticketData.category,
            priority: ticketData.priority,
            status: 'Open',
            date: 'Just now',
            messages: [
                { author: 'You', time: 'Just now', text: ticketData.message, isAdmin: false }
            ]
        };
        tickets.unshift(newTicket);
        setStore('stackly_tickets', tickets);

        const tbody = document.querySelector('table tbody');
        if (tbody) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${newTicket.id}</strong></td>
                <td>${newTicket.subject}</td>
                <td>${newTicket.category}</td>
                <td><span class="badge active">Open</span></td>
                <td><span class="badge ${newTicket.priority === 'High' ? 'error' : 'pending'}">${newTicket.priority}</span></td>
                <td>Just now</td>
            `;
            tbody.insertBefore(tr, tbody.firstChild);
        }
        if (window.showToast) window.showToast(`Ticket ${newTicket.id} submitted successfully!`, 'success');
    }

    // E. user-profile.html
    function initUserProfile() {
        const allButtons = document.querySelectorAll('button');
        const btnDeleteAcc = Array.from(allButtons).find(btn => btn.textContent.includes('Delete Account'));
        if (btnDeleteAcc) {
            btnDeleteAcc.addEventListener('click', (e) => {
                e.preventDefault();
                confirmAction({
                    title: 'Delete Account Confirmation',
                    message: 'Are you sure you want to permanently delete your account? All hosting plans, domains, and data will be decommissioned.',
                    confirmText: 'Delete My Account',
                    isDanger: true,
                    onConfirm: () => {
                        if (window.AuthManager) {
                            window.AuthManager.logout(true);
                        } else {
                            localStorage.clear();
                            window.location.href = '../login.html';
                        }
                    }
                });
            });
        }
    }

    // ==========================================
    // 5. UNIVERSAL ENHANCERS & GUARDS
    // ==========================================

    function ensureSampleDataNotice() {
        // Disabled per user request - no prototype demo notices displayed
        return;
    }

    function verifyAdminClearance() {
        if (window.AuthManager) {
            const check = window.AuthManager.validateSession();
            if (!check.isValid || check.session.role !== 'Admin') {
                if (window.showToast) {
                    window.showToast('Access Denied: Administrative clearance required for this operation.', 'error');
                }
                setTimeout(() => {
                    window.location.href = '../login.html?error=unauthorized';
                }, 400);
                return false;
            }
        }
        return true;
    }

    function initMobileSidebarDrawer() {
        const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
        const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
        let overlay = document.getElementById('sidebar-overlay') || document.querySelector('.sidebar-overlay');

        if (!overlay && sidebar) {
            overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        if (!hamburger || !sidebar || !overlay) return;

        function openSidebar() {
            sidebar.classList.add('show');
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            hamburger.setAttribute('aria-expanded', 'true');
        }

        function closeSidebar() {
            sidebar.classList.remove('show');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
        }

        function toggleSidebar() {
            if (sidebar.classList.contains('show')) closeSidebar();
            else openSidebar();
        }

        // Drawer click handlers handled centrally in custom-fixes.js
        // to prevent double-toggle cancellation conflict

        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 992) closeSidebar();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('show')) {
                closeSidebar();
                hamburger.focus();
            }
        });
    }

    function initUniversalTableEnhancer() {
        const tables = document.querySelectorAll('table');
        if (!tables.length) return;

        tables.forEach(table => {
            const tbody = table.querySelector('tbody');
            if (!tbody) return;

            const searchInputs = document.querySelectorAll('.search-group input, .search-bar input, input[placeholder*="Search" i], input[type="search"]');
            const filterSelects = document.querySelectorAll('.filter-select, .filter-controls select');
            let paginationContainer = document.querySelector('.pagination');

            const pageSize = 5;
            let currentPage = 1;

            function applyFilterAndPagination() {
                let query = '';
                searchInputs.forEach(si => {
                    if (si && si.value.trim() && !si.closest('.support-hero')) {
                        query = si.value.trim().toLowerCase();
                    }
                });

                const activeFilterValues = [];
                filterSelects.forEach(fs => {
                    if (fs.value && fs.value !== '' && !fs.value.toLowerCase().includes('all') && !fs.value.toLowerCase().includes('sort')) {
                        activeFilterValues.push(fs.value.toLowerCase().trim());
                    }
                });

                const rows = Array.from(tbody.querySelectorAll('tr:not(.empty-filter-row):not(.no-results-row)'));
                if (!rows.length) return;

                const matchingRows = [];
                rows.forEach(tr => {
                    const rowText = tr.innerText.toLowerCase();
                    const matchesQuery = !query || rowText.includes(query);
                    let matchesFilter = true;
                    if (activeFilterValues.length > 0) {
                        matchesFilter = activeFilterValues.every(val => rowText.includes(val));
                    }

                    if (matchesQuery && matchesFilter) {
                        matchingRows.push(tr);
                    } else {
                        tr.style.display = 'none';
                    }
                });

                let emptyRow = tbody.querySelector('.empty-filter-row');
                if (matchingRows.length === 0) {
                    if (!emptyRow) {
                        emptyRow = document.createElement('tr');
                        emptyRow.className = 'empty-filter-row no-results-row';
                        const colCount = table.querySelectorAll('th').length || 6;
                        emptyRow.innerHTML = `
                            <td colspan="${colCount}" style="text-align: center; padding: 40px 20px; color: #64748b;">
                                <i class="fa-solid fa-magnifying-glass" style="font-size: 32px; color: #cbd5e1; margin-bottom: 12px; display: block;"></i>
                                <strong style="font-size: 15px; color: #1e293b; display: block; margin-bottom: 4px;">No matching records found</strong>
                                <span style="font-size: 13px; color: #64748b;">Try adjusting your search query or status filter.</span>
                            </td>
                        `;
                        tbody.appendChild(emptyRow);
                    }
                    emptyRow.style.display = '';
                } else if (emptyRow) {
                    emptyRow.style.display = 'none';
                }

                const totalMatching = matchingRows.length;
                const totalPages = Math.ceil(totalMatching / pageSize) || 1;
                if (currentPage > totalPages) currentPage = totalPages;
                if (currentPage < 1) currentPage = 1;

                matchingRows.forEach((tr, idx) => {
                    const startIdx = (currentPage - 1) * pageSize;
                    const endIdx = startIdx + pageSize;
                    if (idx >= startIdx && idx < endIdx) {
                        tr.style.display = '';
                    } else {
                        tr.style.display = 'none';
                    }
                });

                if (paginationContainer) {
                    const pageStart = totalMatching === 0 ? 0 : (currentPage - 1) * pageSize + 1;
                    const pageEnd = Math.min(currentPage * pageSize, totalMatching);

                    let pageInfo = paginationContainer.querySelector('.page-info') || paginationContainer.querySelector('div:first-child');
                    if (pageInfo) {
                        pageInfo.className = 'page-info';
                        pageInfo.innerText = `Showing ${pageStart} to ${pageEnd} of ${totalMatching} entries`;
                    }

                    let controls = paginationContainer.querySelector('.pagination-controls') || paginationContainer.querySelector('div:last-child');
                    if (!controls || controls === pageInfo) {
                        controls = document.createElement('div');
                        controls.className = 'pagination-controls';
                        paginationContainer.appendChild(controls);
                    }
                    controls.innerHTML = '';

                    const prevBtn = document.createElement('button');
                    prevBtn.className = 'page-btn';
                    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Previous';
                    prevBtn.disabled = (currentPage === 1);
                    prevBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                            currentPage--;
                            applyFilterAndPagination();
                        }
                    });
                    controls.appendChild(prevBtn);

                    for (let p = 1; p <= totalPages; p++) {
                        const pageNumBtn = document.createElement('button');
                        pageNumBtn.className = 'page-btn' + (p === currentPage ? ' active' : '');
                        pageNumBtn.innerText = p;
                        pageNumBtn.addEventListener('click', ((pageNum) => (e) => {
                            e.preventDefault();
                            currentPage = pageNum;
                            applyFilterAndPagination();
                        })(p));
                        controls.appendChild(pageNumBtn);
                    }

                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'page-btn';
                    nextBtn.innerHTML = 'Next <i class="fa-solid fa-chevron-right"></i>';
                    nextBtn.disabled = (currentPage === totalPages || totalMatching === 0);
                    nextBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                            currentPage++;
                            applyFilterAndPagination();
                        }
                    });
                    controls.appendChild(nextBtn);
                }
            }

            searchInputs.forEach(si => {
                si.addEventListener('input', () => {
                    currentPage = 1;
                    applyFilterAndPagination();
                });
            });

            filterSelects.forEach(fs => {
                fs.addEventListener('change', () => {
                    currentPage = 1;
                    applyFilterAndPagination();
                });
            });

            setTimeout(applyFilterAndPagination, 100);
        });
    }

    // ==========================================
    // 6. INITIALIZATION DISPATCHER
    // ==========================================

    function startEngine() {
        ensureStyles();
        ensureSampleDataNotice();
        initMobileSidebarDrawer();
        initUniversalTableEnhancer();

        const path = window.location.pathname.toLowerCase();

        if (path.includes('admin-dashboard')) initAdminDashboard();
        else if (path.includes('admin-customers')) initAdminCustomers();
        else if (path.includes('admin-domains')) initAdminDomains();
        else if (path.includes('admin-hosting-plans')) initAdminHostingPlans();
        else if (path.includes('admin-orders') || path.includes('admin-billing')) initAdminOrdersAndBilling();
        else if (path.includes('admin-reports')) initAdminReports();
        else if (path.includes('admin-support')) initAdminSupport();
        else if (path.includes('user-hosting')) initUserHosting();
        else if (path.includes('user-domains')) initUserDomains();
        else if (path.includes('user-billing')) initUserBilling();
        else if (path.includes('user-profile')) initUserProfile();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startEngine);
    } else {
        startEngine();
    }

    // Global Export
    window.DashboardEngine = {
        confirm: confirmAction,
        downloadReceipt: downloadReceipt,
        downloadCSV: downloadCSV,
        handleUserTicketCreate: handleUserTicketCreate,
        verifyAdminClearance: verifyAdminClearance,
        refreshTables: initUniversalTableEnhancer
    };

})();
