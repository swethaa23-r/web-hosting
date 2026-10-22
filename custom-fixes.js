if (window.__STACKLY_CUSTOM_FIXES_INITIALIZED__) {
    // Already initialized
} else {
    window.__STACKLY_CUSTOM_FIXES_INITIALIZED__ = true;
    document.addEventListener('DOMContentLoaded', function() {
    
    // Global Toast Notification Helper
    function showToast(message, type = 'success') {
        let toast = document.getElementById('global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                padding: 14px 22px;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                z-index: 10000;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                transform: translateY(20px);
                opacity: 0;
                display: flex;
                align-items: center;
                gap: 12px;
                max-width: 420px;
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }
        
        toast.style.backgroundColor = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#2563eb');
        toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info')}" style="font-size: 18px;"></i> <span>${message}</span>`;
        
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        
        if (window._toastTimeout) clearTimeout(window._toastTimeout);
        window._toastTimeout = setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
        }, 3500);
    }
    window.showToast = showToast;

    const pathLower = window.location.pathname.toLowerCase();
    const isInsideDashboard = pathLower.includes('/dashboard/') || pathLower.includes('\\dashboard\\');

    // Remove any demo notices
    document.querySelectorAll('.demo-data-badge, .auth-security-notice').forEach(el => el.remove());

    // Intercept Forgot Password clicks -> 404.html
    document.querySelectorAll('.forgot-password, a[href*="forgot-password"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = (isInsideDashboard ? '../' : '') + '404.html';
        });
    });

    // 1. Suppress default HTML5 validation tooltips
    document.querySelectorAll('form').forEach(form => form.setAttribute('novalidate', true));

    // 1b. Mobile View Topbar Fixes (Only Hamburger + Logo linking to Home)
    const topbarLeft = document.querySelector('.topbar > div:first-child');
    if (topbarLeft && !document.querySelector('.mobile-topbar-brand')) {
        const mobileBrand = document.createElement('a');
        mobileBrand.href = (isInsideDashboard ? '../' : '') + 'index.html';
        mobileBrand.className = 'mobile-topbar-brand';
        mobileBrand.setAttribute('aria-label', 'Stackly Home');
        mobileBrand.innerHTML = `<img src="${(isInsideDashboard ? '../' : '')}logo.webp" class="mobile-topbar-logo brand-logo" alt="Stackly" decoding="async"/>`;
        topbarLeft.appendChild(mobileBrand);
        
        const style = document.createElement('style');
        style.innerHTML = `
            .mobile-topbar-brand { display: none; }
            @media (max-width: 992px) {
                .mobile-topbar-brand { 
                    display: flex !important; 
                    align-items: center !important;
                    justify-content: center !important;
                    position: absolute !important;
                    left: 50% !important;
                    top: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    z-index: 100 !important;
                    cursor: pointer !important;
                    text-decoration: none !important;
                }
                .mobile-topbar-logo { 
                    display: block !important; 
                    height: 46px !important; 
                    width: auto !important; 
                    mix-blend-mode: multiply !important; 
                    cursor: pointer !important;
                }
                .topbar-right { display: none !important; }
                .topbar > div:first-child .search-bar { display: none !important; }
                .topbar { padding: 0 15px !important; position: sticky !important; top: 0 !important; z-index: 900 !important; }
                
                .hamburger {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: none !important;
                    border: none !important;
                    font-size: 24px !important;
                    cursor: pointer !important;
                    color: var(--text-dark, #1f2937) !important;
                    padding: 8px !important;
                    z-index: 101 !important;
                }

                .sidebar {
                    transform: translateX(-100%) !important;
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    height: 100vh !important;
                    width: 270px !important;
                    z-index: 2000 !important;
                    background-color: var(--dark-blue, #0b1536) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    box-shadow: 10px 0 30px rgba(0,0,0,0.4) !important;
                }
                .sidebar.show {
                    transform: translateX(0) !important;
                    display: flex !important;
                    visibility: visible !important;
                }
                .sidebar-overlay {
                    position: fixed !important;
                    inset: 0 !important;
                    background: rgba(11, 21, 54, 0.7) !important;
                    z-index: 1999 !important;
                    backdrop-filter: blur(2px) !important;
                    display: none;
                }
                .sidebar-overlay.show, .sidebar-overlay[style*="display: block"] {
                    display: block !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 1c. Public Websites navigation in dashboard sidebar (stays 100% inside dashboard)
    const sidebarNav = document.querySelector('.sidebar-nav');
    const isAdmin = pathLower.includes('admin-');
    const websitesTarget = isAdmin ? 'admin-websites.html' : 'user-websites.html';
    
    // Ensure sidebar-brand ALWAYS points to Home page (index.html)
    document.querySelectorAll('.sidebar-brand, a:has(.brand-logo)').forEach(link => {
        link.href = (isInsideDashboard ? '../' : '') + 'index.html';
    });
    // Public Websites link in sidebar
    document.querySelectorAll('.sidebar-nav a[href*="index.html"]').forEach(link => {
        if (!link.classList.contains('sidebar-brand') && !link.querySelector('.brand-logo')) {
            link.href = websitesTarget;
        }
    });

    if (sidebarNav && !sidebarNav.querySelector('a[href*="websites.html"]')) {
        const publicLink = document.createElement('a');
        publicLink.href = websitesTarget;
        publicLink.className = 'nav-item public-site-link' + (pathLower.includes('websites.html') ? ' active' : '');
        publicLink.innerHTML = '<i class="fa-solid fa-globe"></i> Public Websites';
        sidebarNav.appendChild(publicLink);
    }

    // 1d. Session Authentication & Role Protection Guard
    if (window.AuthManager) {
        const path = window.location.pathname.toLowerCase();
        const isAdminPage = path.includes('admin-');
        const isUserPage = path.includes('user-');
        
        if (isAdminPage) {
            window.AuthManager.protectPage('Admin');
        } else if (isUserPage) {
            window.AuthManager.protectPage('User');
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('denied') === 'admin_only') {
            setTimeout(() => {
                showToast('Access Denied: Super Administrator clearance required for that section.', 'error');
            }, 300);
        }

        // Global Logout Interceptor
        document.querySelectorAll('#btn-logout, .btn-logout, a.nav-item[href*="login.html"]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.AuthManager.logout();
            });
        });
    }

    // 2. Profile Icon & Email/Name in Topbar Header
    const profileBlocks = document.querySelectorAll('.profile');
    const authSession = window.AuthManager ? window.AuthManager.validateSession() : null;
    const activeUser = (authSession && authSession.isValid) ? authSession.session : null;
    
    const userEmail = activeUser ? activeUser.email : (localStorage.getItem('currentUserEmail') || localStorage.getItem('userEmail') || 'user@stackly.com');
    const userName = activeUser ? (activeUser.fullname || activeUser.username) : (localStorage.getItem('currentUserName') || localStorage.getItem('stacklyUsername') || (userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)));
    const userRole = activeUser ? activeUser.role : (localStorage.getItem('userRole') || (userEmail.toLowerCase().includes('admin') ? 'Admin' : 'User'));
    
    profileBlocks.forEach(profile => {
        const idAttr = userRole === 'Admin' ? 'id="admin-name"' : 'id="user-name"';
        profile.innerHTML = `
            <i class="fa-solid fa-user-circle" style="font-size: 35px; color: var(--primary);"></i>
            <div class="profile-info">
                <span class="name" ${idAttr} style="font-size: 13px; font-weight: 600; color: var(--dark-blue);">${userName}</span>
                <span class="role" style="font-size: 11px; color: var(--text-light);">${userEmail}</span>
            </div>
        `;
    });

    // Also update any standalone profile name / email elements
    const nameEls = document.querySelectorAll('#admin-name, #user-name, .profile-info .name');
    nameEls.forEach(el => { el.textContent = userName; });
    const profUserEl = document.getElementById('prof-username');
    if (profUserEl) profUserEl.textContent = userName;
    const profEmailEl = document.getElementById('prof-email');
    if (profEmailEl) profEmailEl.textContent = userEmail;
    const iName = document.getElementById('i-name');
    if (iName && !iName.value) iName.value = userName;
    const iEmail = document.getElementById('i-email');
    if (iEmail && !iEmail.value) iEmail.value = userEmail;

    // Add orig-idx for sorting
    document.querySelectorAll('table tbody tr:not(.no-results-row)').forEach((tr, index) => {
        tr.setAttribute('data-orig-idx', index);
    });

    // 3. Topbar Search Bar Validation & Redirect
    document.querySelectorAll('.search-bar').forEach(bar => {
        const input = bar.querySelector('input');
        const icon = bar.querySelector('i');
        if (!input) return;

        function submitSearch() {
            const query = input.value.trim();
            if (query === '') {
                // Inline Script Validation Error
                bar.style.transition = 'all 0.2s ease';
                bar.style.border = '1.5px solid #ef4444';
                bar.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';
                showToast('Please enter search details before submitting.', 'error');
                input.focus();
            } else {
                // Details entered -> redirect to 404
                bar.style.border = '';
                bar.style.boxShadow = '';
                window.location.href = (isInsideDashboard ? '../' : '') + '404.html';
            }
        }

        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                bar.style.border = '';
                bar.style.boxShadow = '';
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitSearch();
            }
        });

        if (icon) {
            icon.style.cursor = 'pointer';
            icon.addEventListener('click', function(e) {
                e.preventDefault();
                submitSearch();
            });
        }

        const form = input.closest('form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                submitSearch();
            });
        }
    });

    // 3b. Notifications Bell Icon -> 404
    document.querySelectorAll('.notifications').forEach(notif => {
        notif.style.cursor = 'pointer';
        notif.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = (isInsideDashboard ? '../' : '') + '404.html';
        });
    });

    document.querySelectorAll('.search-group input:not(.search-bar input)').forEach(input => {
        input.addEventListener('input', filterTable);
    });

    document.querySelectorAll('.filter-select, .filter-controls select').forEach(select => {
        select.addEventListener('change', filterTable);
    });

    function filterTable() {
        const table = document.querySelector('table');
        if(!table) return;
        const tbody = table.querySelector('tbody');
        if(!tbody) return;

        const searchInput = document.querySelector('.search-group input:not(.search-bar input)');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const selects = document.querySelectorAll('.filter-select, .filter-controls select');
        const activeFilters = [];
        let sortMode = 'newest';
        
        selects.forEach(sel => {
            if (!sel.options || sel.selectedIndex < 0) return;
            let text = sel.options[sel.selectedIndex].text.toLowerCase();
            if (text.includes('sort:')) {
                if (text.includes('oldest')) sortMode = 'oldest';
                else if (text.includes('name')) sortMode = 'name';
                else sortMode = 'newest';
            } else if (sel.value && sel.value !== '') {
                if(text.includes(':')) text = text.split(':')[1].trim();
                activeFilters.push(text);
            }
        });

        // Sort rows
        const rows = Array.from(tbody.querySelectorAll('tr:not(.no-results-row)'));
        rows.sort((a, b) => {
            if (sortMode === 'name') {
                const aName = a.children && a.children[0] ? a.children[0].innerText.toLowerCase() : '';
                const bName = b.children && b.children[0] ? b.children[0].innerText.toLowerCase() : '';
                return aName.localeCompare(bName);
            } else if (sortMode === 'oldest') {
                return parseInt(b.getAttribute('data-orig-idx') || 0) - parseInt(a.getAttribute('data-orig-idx') || 0);
            } else { // newest
                return parseInt(a.getAttribute('data-orig-idx') || 0) - parseInt(b.getAttribute('data-orig-idx') || 0);
            }
        });
        
        // Re-append sorted rows
        rows.forEach(tr => tbody.appendChild(tr));

        let visibleCount = 0;
        rows.forEach(tr => {
            const text = tr.innerText.toLowerCase();
            
            let matchesSearch = query === '' || text.includes(query);
            let matchesFilters = true;
            activeFilters.forEach(f => {
                if(!text.includes(f)) matchesFilters = false;
            });

            if(matchesSearch && matchesFilters) {
                tr.style.display = '';
                visibleCount++;
            } else {
                tr.style.display = 'none';
            }
        });
        
        let noResults = tbody.querySelector('.no-results-row');
        if(visibleCount === 0) {
            if(!noResults) {
                let msg = 'No records available';
                const path = window.location.pathname.toLowerCase();
                if(path.includes('customer')) msg = 'This customer is not available';
                else if(path.includes('domain')) msg = 'This domain is not available';
                else if(path.includes('order')) msg = 'This order is not available';
                else if(path.includes('ticket') || path.includes('support')) msg = 'This ticket is not available';
                
                const colCount = table.querySelectorAll('th').length || 6;
                noResults = document.createElement('tr');
                noResults.className = 'no-results-row empty-filter-row';
                noResults.innerHTML = `<td colspan="${colCount}" style="text-align: center; padding: 30px; color: var(--text-light); font-weight: 500;">${msg}</td>`;
                tbody.appendChild(noResults);
            }
            noResults.style.display = '';
        } else if (noResults) {
            noResults.style.display = 'none';
        }
    }

    // 4. Toggle switches handler (fa-toggle-on / fa-toggle-off)
    document.querySelectorAll('.fa-toggle-on, .fa-toggle-off').forEach(btn => {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (btn.classList.contains('fa-toggle-on')) {
                btn.classList.remove('fa-toggle-on');
                btn.classList.add('fa-toggle-off');
                btn.style.color = '#94a3b8';
                showToast('Auto-renewal feature has been disabled.', 'info');
            } else {
                btn.classList.remove('fa-toggle-off');
                btn.classList.add('fa-toggle-on');
                btn.style.color = '#10b981';
                showToast('Auto-renewal feature enabled successfully!', 'success');
            }
        });
    });
    
    // Support Search Intercept in user-support.html
    const supportSearchInput = document.querySelector('.support-hero input[type="text"]');
    if (supportSearchInput) {
        const supportSearchIcon = document.querySelector('.support-hero .fa-magnifying-glass');
        if (supportSearchIcon) {
            const newIcon = supportSearchIcon.cloneNode(true);
            supportSearchIcon.parentNode.replaceChild(newIcon, supportSearchIcon);
            
            newIcon.style.cursor = 'pointer';
            newIcon.addEventListener('click', function(e) {
                const q = supportSearchInput.value.trim();
                if(!q) {
                    showToast('Please enter a topic or keyword to search.', 'error');
                } else {
                    showToast(`Found 8 helpful articles matching "${q}".`, 'success');
                }
            });
            
            supportSearchInput.addEventListener('keypress', function(e) {
                if(e.key === 'Enter') {
                    newIcon.click();
                }
            });
        }
    }

    // 8. Dynamic Dashboard Engine Loader (Fallback if not directly loaded)
    if (!window.DashboardEngine && !document.querySelector('script[src*="dashboard-engine.js"]') && (pathLower.includes('admin-') || pathLower.includes('user-'))) {
        const engineScript = document.createElement('script');
        engineScript.src = (isInsideDashboard ? '' : 'dashboard/') + 'dashboard-engine.js';
        document.body.appendChild(engineScript);
    }
    // Global Form Validation Engine
    function validateFormOrContainer(container) {
        if (!container) return { isValid: true, emptyCount: 0 };

        // Exclude hidden inputs, topbar search inputs, and pure checkboxes/radios
        const inputs = Array.from(container.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), select, textarea'))
            .filter(el => !el.closest('.search-bar'));

        if (inputs.length === 0) return { isValid: true, emptyCount: 0 };

        let isValid = true;
        let firstInvalid = null;
        let emptyCount = 0;

        inputs.forEach(input => {
            let fieldValid = true;
            let errMsg = '';
            const val = input.value.trim();
            const type = (input.getAttribute('type') || '').toLowerCase();
            const id = (input.id || '').toLowerCase();
            const name = (input.name || '').toLowerCase();

            const formGroup = input.closest('.form-group') || input.parentElement;
            const labelText = formGroup?.querySelector('label')?.innerText || '';
            
            // Determine if field is required:
            const isExplicitRequired = input.hasAttribute('required') || labelText.includes('*');
            const isKeyField = id.includes('company') || id.includes('website') || 
                               id.includes('name') || id.includes('email') || 
                               id.includes('pass') || id.includes('subject') || 
                               id.includes('message') || id.startsWith('p-') ||
                               id === 'host-storage' || id === 'host-bandwidth' ||
                               id === 'tax-gst' || id === 'payment-reminder';

            const mustValidate = isExplicitRequired || isKeyField;

            if (mustValidate && val === '') {
                fieldValid = false;
                emptyCount++;
                errMsg = labelText ? `${labelText.replace('*', '').trim()} is required.` : 'This field is required.';
            } else if (val !== '') {
                // Email format check
                if (type === 'email' || id.includes('email') || name.includes('email')) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(val)) {
                        fieldValid = false;
                        errMsg = 'Please enter a valid email address.';
                    }
                }
                // URL format check
                else if (type === 'url' || id.includes('website') || id.includes('url')) {
                    if (!val.includes('.') || val.length < 4) {
                        fieldValid = false;
                        errMsg = 'Please enter a valid website URL.';
                    }
                }
                // Password confirmation check
                else if (id.includes('conf') || id === 'i-pass2' || id === 'sec-conf-pass') {
                    const passInput = container.querySelector('#sec-new-pass, #i-pass, input[type="password"]:not([id*="conf"]):not(#i-pass2)');
                    if (passInput && val !== passInput.value.trim()) {
                        fieldValid = false;
                        errMsg = 'Passwords do not match.';
                    }
                }
                // Password min length check
                else if (type === 'password' || id.includes('pass')) {
                    if (val.length < 6) {
                        fieldValid = false;
                        errMsg = 'Password must be at least 6 characters long.';
                    }
                }
                // Number check
                else if (type === 'number') {
                    const num = parseFloat(val);
                    const min = input.getAttribute('min');
                    if (isNaN(num) || (min !== null && num < parseFloat(min)) || num <= 0) {
                        fieldValid = false;
                        errMsg = 'Please enter a valid positive number.';
                    }
                }
            }

            // Find feedback element if present
            const errFeedback = formGroup?.querySelector('.error-msg, .invalid-feedback') ||
                                document.getElementById(input.id + '-error') ||
                                document.getElementById('err-' + input.id) ||
                                (id === 'sec-new-pass' ? document.getElementById('pass-error') : null) ||
                                (id === 'sec-conf-pass' ? document.getElementById('conf-pass-error') : null);

            if (!fieldValid) {
                isValid = false;
                if (!firstInvalid) firstInvalid = input;

                input.classList.add('error', 'is-invalid');
                input.style.borderColor = '#ef4444';
                input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';

                if (errFeedback) {
                    if (errMsg) errFeedback.innerText = errMsg;
                    errFeedback.style.display = 'block';
                    errFeedback.style.color = '#ef4444';
                }

                // Clear error on input
                const clearFn = () => {
                    input.classList.remove('error', 'is-invalid');
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                    if (errFeedback) errFeedback.style.display = 'none';
                    input.removeEventListener('input', clearFn);
                    input.removeEventListener('change', clearFn);
                };
                input.addEventListener('input', clearFn);
                input.addEventListener('change', clearFn);
            } else {
                input.classList.remove('error', 'is-invalid');
                input.style.borderColor = '';
                input.style.boxShadow = '';
                if (errFeedback) errFeedback.style.display = 'none';
            }
        });

        return { isValid, firstInvalid, emptyCount };
    }
    window.validateFormOrContainer = validateFormOrContainer;

    // Helper to persist form data across various settings forms
    function persistFormData(formOrCard) {
        if (!formOrCard) return;
        const formGen = document.getElementById('form-general');
        if (formGen && (formOrCard === formGen || formGen.contains(formOrCard))) {
            ['gen-company', 'gen-website', 'gen-email', 'gen-phone', 'gen-address', 'gen-timezone', 'gen-currency'].forEach(id => {
                const el = document.getElementById(id);
                if (el && el.value) localStorage.setItem(id, el.value);
            });
        }
        const formHost = document.getElementById('form-hosting');
        if (formHost && (formOrCard === formHost || formHost.contains(formOrCard))) {
            ['host-plan', 'host-region', 'host-storage', 'host-bandwidth', 'host-backup'].forEach(id => {
                const el = document.getElementById(id);
                if (el && el.value) localStorage.setItem(id, el.value);
            });
        }
        const formNotif = document.getElementById('form-notifications');
        if (formNotif && (formOrCard === formNotif || formNotif.contains(formOrCard))) {
            ['notif-customer', 'notif-order', 'notif-payment', 'notif-expiry', 'notif-ticket', 'notif-security'].forEach(id => {
                const el = document.getElementById(id);
                if (el) localStorage.setItem(id, el.checked);
            });
        }
        const iName = document.getElementById('i-name');
        const iEmail = document.getElementById('i-email');
        if (iName && iEmail && (formOrCard.contains(iName) || formOrCard.id === 'btn-save-prof')) {
            if (iName.value.trim()) localStorage.setItem('stacklyUsername', iName.value.trim());
            if (iEmail.value.trim()) localStorage.setItem('userEmail', iEmail.value.trim());
        }
    }

    // ========================================================
    // Universal Dashboard Interceptor (Capture Phase)
    // Form fields are validated FIRST:
    // - If invalid: Show script errors, DO NOT redirect!
    // - If valid: Save data, redirect to 404.html!
    // Standalone buttons without inputs redirect to 404.html.
    // Sidebar nav & breadcrumbs stay functional.
    // Logout clears session and redirects to login.html.
    // ========================================================
    if (isInsideDashboard) {
        document.addEventListener('click', function(e) {
            // A. Logout button / link -> login.html
            const logoutTarget = e.target.closest('#btn-logout, #btn-logout-sidebar, #btn-logout-main, .btn-logout, a[href*="login.html"]');
            if (logoutTarget) {
                e.preventDefault();
                e.stopPropagation();
                if (window.AuthManager) {
                    window.AuthManager.logout(true);
                } else {
                    window.location.href = '../login.html';
                }
                return;
            }

            // A0. Any Logo click -> ALWAYS redirect to Home page (index.html)
            const logoTarget = e.target.closest('.sidebar-brand, .mobile-topbar-brand, .mobile-topbar-logo, .brand-logo, a:has(.brand-logo)');
            if (logoTarget) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = (isInsideDashboard ? '../' : '') + 'index.html';
                return;
            }

            // B. Mobile Hamburger Toggle -> Robust Sidebar Drawer Toggle
            const hamburgerTarget = e.target.closest('#hamburger, .hamburger');
            if (hamburgerTarget) {
                e.preventDefault();
                e.stopPropagation();
                const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
                let overlay = document.getElementById('sidebar-overlay') || document.querySelector('.sidebar-overlay');
                if (!overlay && sidebar) {
                    overlay = document.createElement('div');
                    overlay.id = 'sidebar-overlay';
                    overlay.className = 'sidebar-overlay';
                    document.body.appendChild(overlay);
                }
                if (sidebar) {
                    const isOpening = !sidebar.classList.contains('show');
                    if (isOpening) {
                        sidebar.classList.add('show');
                        if (overlay) {
                            overlay.classList.add('show');
                            overlay.style.display = 'block';
                        }
                        document.body.style.overflow = 'hidden';
                        hamburgerTarget.setAttribute('aria-expanded', 'true');
                    } else {
                        sidebar.classList.remove('show');
                        if (overlay) {
                            overlay.classList.remove('show');
                            overlay.style.display = 'none';
                        }
                        document.body.style.overflow = '';
                        hamburgerTarget.setAttribute('aria-expanded', 'false');
                    }
                }
                return;
            }

            // B2. Overlay click -> close sidebar drawer
            const overlayTarget = e.target.closest('#sidebar-overlay, .sidebar-overlay');
            if (overlayTarget) {
                e.preventDefault();
                e.stopPropagation();
                const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('show');
                overlayTarget.classList.remove('show');
                overlayTarget.style.display = 'none';
                document.body.style.overflow = '';
                const h = document.getElementById('hamburger') || document.querySelector('.hamburger');
                if (h) h.setAttribute('aria-expanded', 'false');
                return;
            }

            // B3. Close mobile sidebar drawer when a navigation item is clicked
            const navLinkItem = e.target.closest('.sidebar-nav .nav-item, .sidebar .nav-item');
            if (navLinkItem && window.innerWidth <= 992) {
                const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
                const overlay = document.getElementById('sidebar-overlay') || document.querySelector('.sidebar-overlay');
                if (sidebar) sidebar.classList.remove('show');
                if (overlay) {
                    overlay.classList.remove('show');
                    overlay.style.display = 'none';
                }
                document.body.style.overflow = '';
            }

            // D. Sidebar Navigation & Breadcrumbs -> Allow page/subpage navigation
            const navTarget = e.target.closest('.sidebar a, .sidebar-nav a, .sidebar-menu a, .breadcrumb a, .public-site-link');
            if (navTarget) {
                const href = navTarget.getAttribute('href') || '';
                if (href.includes('index.html')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const isAdmin = window.location.pathname.toLowerCase().includes('admin-');
                    window.location.href = isAdmin ? 'admin-websites.html' : 'user-websites.html';
                    return;
                }
                return;
            }

            // E. Notifications Bell Icon -> 404.html
            const notifTarget = e.target.closest('.notifications');
            if (notifTarget) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '../404.html';
                return;
            }

            // F. Topbar Search Bar -> Processed by search bar handler
            const searchBarTarget = e.target.closest('.search-bar');
            if (searchBarTarget) {
                return;
            }

            // G. Modal Controls (Close/Cancel buttons must close modal, not redirect)
            const modalCloseTarget = e.target.closest('.btn-close, .modal-close, #close-modal, #modal-cancel');
            if (modalCloseTarget) {
                const modal = modalCloseTarget.closest('.modal-overlay');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                return;
            }

            // H. Modal Proceed/Confirm Button -> 404.html
            const modalConfirmTarget = e.target.closest('#modal-confirm');
            if (modalConfirmTarget) {
                e.preventDefault();
                e.stopPropagation();
                const modal = modalConfirmTarget.closest('.modal-overlay');
                if (modal) modal.classList.remove('active');
                window.location.href = '../404.html';
                return;
            }

            // I. System Action Buttons that open modal -> allow modal opening
            if (e.target.closest('button[onclick*="handleSystemAction"], .btn-view-modal')) {
                return;
            }

            // J. Toggle Switch Controls -> allow toggling
            if (e.target.closest('.switch, .switch input, .fa-toggle-on, .fa-toggle-off')) {
                return;
            }

            // K. Domain search button in user-domains.html -> allow local validation
            if (e.target.closest('#btn-search-domain')) {
                return;
            }

            // L. Any Action Button or Submit Button
            const actionTarget = e.target.closest('button, .btn, .btn-action, .btn-primary, .btn-secondary, .btn-outline, .btn-danger, .btn-icon, .page-btn, .table-action, .action-btn');
            if (actionTarget) {
                // Check if this button is inside a form or card with text inputs
                const formOrCard = actionTarget.closest('form') || actionTarget.closest('.card, .settings-card, .search-domain-form, .modal, .form-container');
                const hasTextInputs = formOrCard && formOrCard.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea').length > 0;

                if (hasTextInputs) {
                    // VALIDATE FORM FIRST!
                    const result = validateFormOrContainer(formOrCard);
                    if (!result.isValid) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (result.firstInvalid) result.firstInvalid.focus();
                        showToast('Please fill out all required fields before saving.', 'error');
                        return; // DO NOT REDIRECT!
                    }

                    // Valid! Persist data and redirect to 404.html
                    e.preventDefault();
                    e.stopPropagation();
                    persistFormData(formOrCard);
                    showToast('Settings saved successfully!', 'success');
                    window.location.href = '../404.html';
                    return;
                }

                // If standalone button without inputs (e.g. View Details, Delete, Renew, Manage, Edit, etc.)
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '../404.html';
                return;
            }
        }, true);

        // Intercept form submissions inside dashboard pages (Enter key or form.submit())
        document.addEventListener('submit', function(e) {
            const form = e.target;
            if (form.closest('.search-bar') || form.id === 'login-form' || form.id === 'signup-form' || form.id === 'reset-form') return;

            e.preventDefault();
            e.stopPropagation();

            const result = validateFormOrContainer(form);
            if (!result.isValid) {
                if (result.firstInvalid) result.firstInvalid.focus();
                showToast('Please fill out all required fields before saving.', 'error');
                return; // DO NOT REDIRECT!
            }

            persistFormData(form);
            showToast('Settings saved successfully!', 'success');
            window.location.href = '../404.html';
        }, true);
    }
});
}
