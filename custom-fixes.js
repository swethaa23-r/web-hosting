document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Suppress HTML5 validation tooltips to allow script-wise validation
    document.querySelectorAll('form').forEach(form => form.setAttribute('novalidate', true));

    // 1b. Mobile View Topbar Fixes (Only Hamburger + Logo)
    const topbarLeft = document.querySelector('.topbar > div:first-child');
    if (topbarLeft && !document.querySelector('.mobile-topbar-logo')) {
        const mobileLogo = document.createElement('img');
        mobileLogo.src = 'logo.webp';
        mobileLogo.className = 'mobile-topbar-logo brand-logo';
        mobileLogo.alt = 'Stackly';
        
        topbarLeft.appendChild(mobileLogo);
        
        const style = document.createElement('style');
        style.innerHTML = `
            .mobile-topbar-logo { display: none; }
            @media (max-width: 992px) {
                .mobile-topbar-logo { 
                    display: block !important; 
                    height: 50px !important; 
                    width: auto !important; 
                    mix-blend-mode: multiply; 
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }
                .topbar-right { display: none !important; }
                .topbar > div:first-child .search-bar { display: none !important; }
                .topbar { padding: 0 20px !important; position: sticky; }
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Profile Icon & Email Replacement (Header)
    const profileBlocks = document.querySelectorAll('.profile');
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const userRole = localStorage.getItem('userRole') || 'User';
    
    profileBlocks.forEach(profile => {
        profile.innerHTML = `
            <i class="fa-solid fa-user-circle" style="font-size: 35px; color: var(--primary);"></i>
            <div class="profile-info">
                <span class="name" style="font-size: 13px; font-weight: 600; color: var(--dark-blue);">${userEmail}</span>
                <span class="role" style="font-size: 11px; color: var(--text-light);">${userRole === 'Admin' ? 'Super Admin' : 'Client Account'}</span>
            </div>
        `;
    });

    
    // Add orig-idx for sorting
    document.querySelectorAll('table tbody tr:not(.no-results-row)').forEach((tr, index) => {
        tr.setAttribute('data-orig-idx', index);
    });

    // 3. Search Bar & Table Filters

    document.querySelectorAll('.search-bar input, .topbar input').forEach(input => {
        if(input.closest('form')) {
            input.closest('form').addEventListener('submit', function(e) {
                e.preventDefault();
                if(input.value.trim() !== '') window.location.href = '404.html';
            });
        } else {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.value.trim() !== '') window.location.href = '404.html';
                }
            });
        }
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
                const aName = a.children[0].innerText.toLowerCase();
                const bName = b.children[0].innerText.toLowerCase();
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
                
                const colCount = table.querySelectorAll('th').length;
                noResults = document.createElement('tr');
                noResults.className = 'no-results-row';
                noResults.innerHTML = `<td colspan="${colCount}" style="text-align: center; padding: 30px; color: var(--text-light); font-weight: 500;">${msg}</td>`;
                tbody.appendChild(noResults);
            }
            noResults.style.display = '';
        } else if (noResults) {
            noResults.style.display = 'none';
        }
    }


    // 4. Generic Dashboard Buttons & Links -> 404
    const selectors = [
        '.main-content button', 
        '.main-content .btn', 
        '.main-content a.btn', 
        '.main-content .btn-action', 
        '.main-content a.btn-action',
        '.main-content .action',
        '.main-content .action-btn',
        '.main-content a.action-btn',
        '.main-content .btn-outline',
        '.main-content .btn-primary',
        '.mgmt-card',
        '.fa-toggle-on',
        '.fa-toggle-off'
    ];
    
    document.querySelectorAll(selectors.join(', ')).forEach(btn => {
        // Exclude form submit buttons as they are handled by form submit events
        if (btn.closest('form') && (btn.tagName === 'BUTTON' || btn.type === 'submit')) return;

        // Exclude specific functional buttons that we don't want to redirect
        if (btn.id && (btn.id.includes('save') || btn.id.includes('logout') || btn.id.includes('close'))) return;
        if (btn.classList.contains('page-btn') || btn.classList.contains('hamburger') || btn.classList.contains('btn-view-modal')) return;
        if (btn.hasAttribute('data-format')) return;

        // Exclude inline onclick that does scrollIntoView (e.g. Create Ticket button)
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes('scrollIntoView')) return;
        
        // Exclude specific search button in domains (handled separately)
        if (btn.id === 'btn-search-domain') return;

        // Override inline onclick
        btn.removeAttribute('onclick');
        btn.onclick = null;

        // Use capture phase (true) to intercept the click before inline scripts trigger
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); 
            window.location.href = '404.html';
        }, true);
    });

    // 5. Generic Form Validation for Dashboard Forms -> 404
    document.querySelectorAll('.main-content form').forEach(form => {
        if (form.classList.contains('search-bar') || form.closest('.search-bar') || form.closest('.search-group')) return;
        if (form.id === 'prof-form' || form.id === 'sec-form' || form.id === 'form-general' || form.id === 'form-hosting' || form.id === 'form-security' || form.id === 'ticketForm' || form.id === 'planForm') return;

        // Create generic error div if not present
        let errDiv = form.querySelector('.generic-err-msg');
        if (!errDiv) {
            errDiv = document.createElement('div');
            errDiv.className = 'generic-err-msg';
            errDiv.style.display = 'none';
            errDiv.style.padding = '10px';
            errDiv.style.backgroundColor = '#fee2e2';
            errDiv.style.color = '#b91c1c';
            errDiv.style.border = '1px solid #f87171';
            errDiv.style.borderRadius = '5px';
            errDiv.style.marginBottom = '15px';
            errDiv.style.fontSize = '13px';
            form.insertBefore(errDiv, form.firstChild);
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ef4444';
                } else if (input.hasAttribute('required')) {
                    input.style.borderColor = '';
                }
            });

            if (!isValid) {
                errDiv.style.display = 'block';
                errDiv.innerText = 'Error: Please fill in all required fields before submitting.';
            } else {
                window.location.href = '404.html';
            }
        });
    });

    // 6. Special intercept for "Check Availability" div pseudo-form in user-domains.html
    const btnSearchDomain = document.getElementById('btn-search-domain');
    const domainSearchInput = document.getElementById('domain-search-input');
    if (btnSearchDomain && domainSearchInput) {
        btnSearchDomain.addEventListener('click', function(e) {
            if (domainSearchInput.value.trim() === '') {
                // Let the inline script run (don't stop propagation, don't prevent default)
                // so the user sees the error message.
            } else {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '404.html';
            }
        }, true);
    }
    
    // Support Search Fake-Form Intercept
    // The support page search doesn't have a strict form tag around it, it's a div.
    const supportSearchInput = document.querySelector('.support-hero input[type="text"]');
    if (supportSearchInput) {
        // The search icon acts as the button
        const supportSearchIcon = document.querySelector('.support-hero .fa-magnifying-glass');
        if (supportSearchIcon) {
            // Remove previous event listeners by cloning
            const newIcon = supportSearchIcon.cloneNode(true);
            supportSearchIcon.parentNode.replaceChild(newIcon, supportSearchIcon);
            
            newIcon.style.cursor = 'pointer';
            newIcon.addEventListener('click', function(e) {
                if(supportSearchInput.value.trim() === '') {
                    // Show error
                    let err = document.getElementById('support-search-err');
                    if(!err) {
                        err = document.createElement('div');
                        err.id = 'support-search-err';
                        err.style.color = '#fca5a5';
                        err.style.fontSize = '13px';
                        err.style.marginTop = '10px';
                        err.innerText = 'Error: Please enter a search query.';
                        supportSearchInput.parentNode.parentNode.appendChild(err);
                    }
                    err.style.display = 'block';
                } else {
                    window.location.href = '404.html';
                }
            });
            
            supportSearchInput.addEventListener('keypress', function(e) {
                if(e.key === 'Enter') {
                    newIcon.click();
                }
            });
        }
    }

    // 7. Explicit Script-wise Form Validation for User Profile
    if(window.location.pathname.includes('user-profile.html')) {
        const btnSaveProf = document.getElementById('btn-save-prof');
        const profMsg = document.getElementById('prof-msg');
        
        if(btnSaveProf) {
            btnSaveProf.onclick = null; 
            btnSaveProf.addEventListener('click', function(e) {
                e.preventDefault();
                const phone = document.getElementById('i-phone').value.trim();
                const address = document.getElementById('i-address').value.trim();
                const name = document.getElementById('i-name').value.trim();
                const email = document.getElementById('i-email').value.trim();
                
                if(!name || !email || !phone || !address) {
                    profMsg.style.display = 'block';
                    profMsg.style.backgroundColor = '#fee2e2';
                    profMsg.style.color = '#b91c1c';
                    profMsg.style.border = '1px solid #f87171';
                    profMsg.innerText = 'Error: Please enter all details including Phone and Address.';
                } else {
                    window.location.href = '404.html';
                }
            });
        }

        const btnSaveSec = document.getElementById('btn-save-sec');
        let secMsg = document.getElementById('sec-msg');
        if(!secMsg && btnSaveSec) {
            secMsg = document.createElement('div');
            secMsg.id = 'sec-msg';
            secMsg.style.display = 'none';
            secMsg.style.padding = '10px';
            secMsg.style.borderRadius = '6px';
            secMsg.style.fontSize = '12px';
            secMsg.style.marginTop = '10px';
            btnSaveSec.parentNode.insertBefore(secMsg, btnSaveSec.nextSibling);
        }

        if(btnSaveSec) {
            btnSaveSec.onclick = null;
            btnSaveSec.addEventListener('click', function(e) {
                e.preventDefault();
                const pass = document.getElementById('i-pass').value.trim();
                if(!pass) {
                    secMsg.style.display = 'block';
                    secMsg.style.backgroundColor = '#fee2e2';
                    secMsg.style.color = '#b91c1c';
                    secMsg.style.border = '1px solid #f87171';
                    secMsg.innerText = 'Error: Please enter the password.';
                } else {
                    window.location.href = '404.html';
                }
            });
        }
    }
});
