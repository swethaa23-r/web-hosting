/**
 * script.js - Centralized JavaScript for Stackly Web Hosting
 * All logic includes safe null checks to prevent console errors on pages where elements don't exist.
 */

if (window.__STACKLY_SCRIPT_INITIALIZED__) {
    // Already initialized
} else {
    window.__STACKLY_SCRIPT_INITIALIZED__ = true;
    document.addEventListener('DOMContentLoaded', function() {
    
    /* ============================
       1. AOS Animation Initialization
    =============================== */
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true,
            offset: 50,
            duration: 800,
            easing: 'ease-in-out'
        });
    }

    /* ============================
       2. Navbar Scroll Effect
    =============================== */
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                navbar.style.padding = '15px 0';
            } else {
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                navbar.style.padding = '20px 0';
            }
        });
    }

    /* ============================
       3. Mobile Hamburger Menu
    =============================== */
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    // Dynamically create overlay if it doesn't exist but hamburger does
    let overlay = document.querySelector('.mobile-menu-overlay');
    if (hamburger && navLinks && !overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        if (navbar) navbar.appendChild(overlay);
        else document.body.appendChild(overlay);
    }

    if (hamburger && navLinks) {
        // Ensure Login is present right below Contact in mobile hamburger
        if (!navLinks.querySelector('.mobile-nav-login')) {
            const contactLink = navLinks.querySelector('a[href*="contact.html"]');
            const loginLink = document.createElement('a');
            loginLink.className = 'mobile-nav-login';
            loginLink.href = 'login.html';
            loginLink.textContent = 'Login';
            if (contactLink && contactLink.nextSibling) {
                navLinks.insertBefore(loginLink, contactLink.nextSibling);
            } else {
                navLinks.appendChild(loginLink);
            }
        }
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
        hamburger.setAttribute('aria-expanded', 'false');

        function openMobileMenu() {
            navLinks.classList.add('active');
            if (overlay) overlay.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            document.body.classList.add('mobile-nav-open');
            hamburger.setAttribute('aria-expanded', 'true');
            hamburger.setAttribute('aria-label', 'Close navigation menu');
            hamburger.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        }

        function closeMobileMenu() {
            navLinks.classList.remove('active');
            if (overlay) overlay.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
            document.body.classList.remove('mobile-nav-open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Toggle navigation menu');
            hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }

        function toggleMenu() {
            const isOpen = navLinks.classList.contains('active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }

        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        if (overlay) {
            overlay.addEventListener('click', closeMobileMenu);
        }
        
        // Close menu when a navigation link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    closeMobileMenu();
                }
            });
        });

        // Close menu on Escape key press (WCAG 2.2 accessible dismissal)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMobileMenu();
                hamburger.focus();
            }
        });

        // Close menu on window resize back to desktop width
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992 && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // Dashboard mobile sidebar Escape key dismissal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            if (sidebar && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                if (overlay) overlay.style.display = 'none';
                document.body.style.overflow = '';
                const dashBurger = document.getElementById('hamburger');
                if (dashBurger) dashBurger.focus();
            }
        }
    });

    /* ============================
       4. Pricing Monthly/Yearly Toggle
    =============================== */
    const billingSwitch = document.getElementById('billing-switch');
    const amounts = document.querySelectorAll('.amount');
    
    if (billingSwitch && amounts.length > 0) {
        billingSwitch.addEventListener('change', function() {
            const isYearly = this.checked;
            
            amounts.forEach(amount => {
                amount.style.opacity = '0';
                amount.style.transition = 'opacity 0.2s ease';
                
                setTimeout(() => {
                    if (isYearly) {
                        const yearlyVal = amount.getAttribute('data-yearly');
                        if (yearlyVal) amount.textContent = yearlyVal;
                    } else {
                        const monthlyVal = amount.getAttribute('data-monthly');
                        if (monthlyVal) amount.textContent = monthlyVal;
                    }
                    amount.style.opacity = '1';
                }, 200);
            });

            const periods = document.querySelectorAll('.price .period');
            periods.forEach(p => {
                p.textContent = isYearly ? '/yr' : '/mo';
            });

            const notes = document.querySelectorAll('.billing-note');
            notes.forEach(note => {
                note.textContent = isYearly ? 'Billed annually (2 months free)' : 'Billed monthly, cancel anytime';
            });
        });
    }

    /* ============================
       5. FAQ Accordion Logic
    =============================== */
    const faqItems = document.querySelectorAll('.accordion-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            if (header) {
                header.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    const content = item.querySelector('.accordion-content');
                    const icon = item.querySelector('.icon') || item.querySelector('i');
                    
                    // Close all items safely
                    faqItems.forEach(otherItem => {
                        otherItem.classList.remove('active');
                        const otherContent = otherItem.querySelector('.accordion-content');
                        const otherIcon = otherItem.querySelector('.icon') || otherItem.querySelector('i');
                        if (otherContent) otherContent.style.display = 'none';
                        if (otherIcon && otherIcon.classList.contains('fa-minus')) {
                            otherIcon.classList.remove('fa-minus');
                            otherIcon.classList.add('fa-plus');
                        }
                    });
                    
                    // If it wasn't active before, open it
                    if (!isActive) {
                        item.classList.add('active');
                        if (content) content.style.display = 'block';
                        if (icon && icon.classList.contains('fa-plus')) {
                            icon.classList.remove('fa-plus');
                            icon.classList.add('fa-minus');
                        }
                    }
                });
            }
        });
    }

    /* ============================
       6. Domain Search Validation & Interactive Ticker
    =============================== */
    const domainForm = document.getElementById('domain-search-form');
    const domainInput = document.getElementById('domain-input');
    const domainResult = document.getElementById('domain-result');
    const currentExt = document.querySelector('.domain-ext');

    // Make the ticker price items interactive
    const priceItems = document.querySelectorAll('.domain-prices-marquee-track .price-item');
    if (priceItems.length > 0 && domainInput) {
        priceItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.setAttribute('title', 'Click to select extension');
            item.addEventListener('click', function() {
                const extEl = this.querySelector('.ext');
                const ext = extEl ? extEl.innerText.trim() : '.com';
                if (currentExt) {
                    currentExt.innerHTML = `${ext} <i class="fa-solid fa-chevron-down text-sm"></i>`;
                }
                const currentVal = domainInput.value.trim();
                if (currentVal) {
                    const cleanName = currentVal.replace(/\.[a-zA-Z0-9]+$/, '');
                    domainInput.value = cleanName + ext;
                } else {
                    domainInput.value = 'mybrand' + ext;
                }
                domainInput.focus();
            });
        });
    }

    if (domainForm && domainInput && domainResult) {
        domainForm.setAttribute('novalidate', 'true');
        domainForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const val = domainInput.value.trim().toLowerCase();
            
            domainResult.style.display = 'block';
            domainResult.style.padding = '15px';
            domainResult.style.borderRadius = '8px';
            domainResult.style.marginTop = '20px';
            domainResult.style.fontWeight = '500';

            if (!val) {
                // Script-based inline error message (NOT browser default HTML popup)
                domainResult.style.backgroundColor = '#fee2e2';
                domainResult.style.color = '#991b1b';
                domainResult.style.border = '1px solid #f87171';
                domainResult.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please enter a domain name to search.';
                domainInput.style.border = '2px solid #ef4444';
                domainInput.focus();
            } else {
                domainInput.style.border = '';
                const cleanExt = currentExt ? currentExt.innerText.trim().replace(/[^a-zA-Z.]/g, '') : '.com';
                const finalDomain = val.includes('.') ? val : val + (cleanExt || '.com');
                domainResult.style.backgroundColor = '#dcfce7';
                domainResult.style.color = '#166534';
                domainResult.style.border = '1px solid #86efac';
                domainResult.innerHTML = `<i class="fa-solid fa-circle-check"></i> Great news! <strong>${finalDomain}</strong> is available.`;
            }
        });
    }

    /* ============================
       7. Newsletter Global Validation & Feedback
    =============================== */
    const newsletterForms = document.querySelectorAll('.newsletter-form, .newsletter-form-cta, #newsletter-form, form[action*="newsletter"], form[action*="subscribe"]');
    if (newsletterForms.length > 0) {
        newsletterForms.forEach(form => {
            form.setAttribute('novalidate', 'true');
            // Remove any inline onsubmit attribute if still present
            form.removeAttribute('onsubmit');
            const btn = form.querySelector('button');
            if (btn && !btn.type) btn.type = 'submit';
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const input = form.querySelector('input[type="email"]') || form.querySelector('input');
                let msgEl = form.querySelector('.newsletter-msg');
                if (!msgEl) {
                    msgEl = document.createElement('div');
                    msgEl.className = 'newsletter-msg';
                    msgEl.style.fontSize = '14px';
                    msgEl.style.marginTop = '12px';
                    msgEl.style.fontWeight = '500';
                    msgEl.style.width = '100%';
                    form.appendChild(msgEl);
                }
                
                const emailVal = input ? input.value.trim() : '';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (!emailVal) {
                    if (input) {
                        input.style.borderColor = '#ef4444';
                        input.focus();
                    }
                    msgEl.style.display = 'block';
                    msgEl.style.color = '#ef4444';
                    msgEl.style.background = '#fef2f2';
                    msgEl.style.border = '1px solid #fecaca';
                    msgEl.style.padding = '10px 14px';
                    msgEl.style.borderRadius = '6px';
                    msgEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please enter your email address to subscribe.';
                } else if (!emailRegex.test(emailVal)) {
                    if (input) {
                        input.style.borderColor = '#ef4444';
                        input.focus();
                    }
                    msgEl.style.display = 'block';
                    msgEl.style.color = '#ef4444';
                    msgEl.style.background = '#fef2f2';
                    msgEl.style.border = '1px solid #fecaca';
                    msgEl.style.padding = '10px 14px';
                    msgEl.style.borderRadius = '6px';
                    msgEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address (e.g. user@example.com).';
                } else {
                    if (input) {
                        input.style.borderColor = '#10b981';
                        input.value = '';
                    }
                    msgEl.style.display = 'block';
                    msgEl.style.color = '#15803d';
                    msgEl.style.background = '#dcfce7';
                    msgEl.style.border = '1px solid #86efac';
                    msgEl.style.padding = '12px 16px';
                    msgEl.style.borderRadius = '6px';
                    msgEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you for subscribing! You will receive our latest updates soon.';
                }
            });
        });
    }

    /* ============================
       8. Contact Form Global Validation
    =============================== */
    const contactForm = document.getElementById('main-contact-form');
    const successMsg = document.getElementById('contact-success-msg');
    
    // Only bind if the inline validation script from contact.html isn't present
    // We check this by seeing if it's already being handled (or we just add it, it's safe if we prevent default)
    if (contactForm && successMsg && !window.contactFormInitialized) {
        window.contactFormInitialized = true;
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const name = document.getElementById('c-name');
            const email = document.getElementById('c-email');
            const phone = document.getElementById('c-phone');
            const subject = document.getElementById('c-subject');
            const message = document.getElementById('c-message');
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[+]?[\d\s()-]{10,15}$/;
            
            document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
            document.querySelectorAll('.invalid-feedback').forEach(el => el.style.display = 'none');
            
            const showErr = (id) => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'block';
            };
            
            if(name && name.value.trim() === '') { name.classList.add('is-invalid'); showErr('err-name'); isValid = false; }
            if(email && !emailRegex.test(email.value.trim())) { email.classList.add('is-invalid'); showErr('err-email'); isValid = false; }
            if(phone && !phoneRegex.test(phone.value.trim().replace(/[\s()-]/g, ''))) { phone.classList.add('is-invalid'); showErr('err-phone'); isValid = false; }
            if(subject && subject.value.trim() === '') { subject.classList.add('is-invalid'); showErr('err-subject'); isValid = false; }
            if(message && message.value.trim().length < 10) { message.classList.add('is-invalid'); showErr('err-message'); isValid = false; }
            
            if(isValid) {
                window.location.href = '404.html';
            }
        });
    }

    /* ============================
       9. Interactive Tabs
    =============================== */
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    /* ============================
       10. Blog Category Filter & Search
    =============================== */
    const categoryFilters = document.querySelector('.category-filters');
    const blogCards = document.querySelectorAll('.blog-card');
    const blogSearchForm = document.querySelector('.search-widget');
    const blogSearchInput = blogSearchForm ? blogSearchForm.querySelector('input') : null;

    if (categoryFilters && blogCards.length > 0) {
        const filterButtons = categoryFilters.querySelectorAll('button');
        
        function filterArticles(category, searchKeyword) {
            let visibleCount = 0;
            const normalizedCat = category.toLowerCase().trim();
            const normalizedKeyword = searchKeyword ? searchKeyword.toLowerCase().trim() : '';

            blogCards.forEach(card => {
                const catBadge = card.querySelector('.blog-cat-badge');
                const cardCategory = catBadge ? catBadge.innerText.trim().toLowerCase() : '';
                const title = card.querySelector('.blog-title') ? card.querySelector('.blog-title').innerText.toLowerCase() : '';
                const excerpt = card.querySelector('.blog-excerpt') ? card.querySelector('.blog-excerpt').innerText.toLowerCase() : '';
                
                const matchesCategory = (normalizedCat === 'all' || cardCategory.includes(normalizedCat));
                const matchesSearch = (!normalizedKeyword || title.includes(normalizedKeyword) || excerpt.includes(normalizedKeyword));
                
                if (matchesCategory && matchesSearch) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Manage accessible empty state when 0 articles match
            let emptyState = document.getElementById('blog-empty-state');
            const grid = document.querySelector('.blog-grid');
            if (visibleCount === 0) {
                if (!emptyState && grid) {
                    emptyState = document.createElement('div');
                    emptyState.id = 'blog-empty-state';
                    emptyState.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);';
                    emptyState.innerHTML = `
                        <div style="font-size: 40px; color: #94a3b8; margin-bottom: 15px;"><i class="fa-solid fa-magnifying-glass"></i></div>
                        <h3 style="font-size: 20px; color: var(--dark-blue); margin-bottom: 8px; font-weight: 700;">No Matching Articles Found</h3>
                        <p style="color: var(--text-light); font-size: 14px; margin-bottom: 20px;">We couldn't find any articles matching your search criteria. Try another keyword or reset the category filter.</p>
                        <button class="btn btn-primary btn-reset-blog" style="padding: 10px 22px; font-size: 14px;"><i class="fa-solid fa-rotate-left"></i> Reset All Filters</button>
                    `;
                    grid.appendChild(emptyState);
                    emptyState.querySelector('.btn-reset-blog').addEventListener('click', () => {
                        filterButtons.forEach(b => b.classList.remove('active'));
                        filterButtons[0].classList.add('active');
                        if (blogSearchInput) blogSearchInput.value = '';
                        filterArticles('all', '');
                    });
                } else if (emptyState) {
                    emptyState.style.display = 'block';
                }
            } else if (emptyState) {
                emptyState.style.display = 'none';
            }
        }
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const cat = this.innerText.trim().toLowerCase();
                const kw = blogSearchInput ? blogSearchInput.value.trim().toLowerCase() : '';
                filterArticles(cat, kw);
            });
        });
        
        if (blogSearchForm && blogSearchInput) {
            blogSearchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const activeBtn = categoryFilters.querySelector('button.active');
                const cat = activeBtn ? activeBtn.innerText.trim().toLowerCase() : 'all';
                const kw = blogSearchInput.value.trim().toLowerCase();
                filterArticles(cat, kw);
            });
            
            blogSearchInput.addEventListener('input', function() {
                const activeBtn = categoryFilters.querySelector('button.active');
                const cat = activeBtn ? activeBtn.innerText.trim().toLowerCase() : 'all';
                const kw = this.value.trim().toLowerCase();
                filterArticles(cat, kw);
            });
        }
    }

    /* ============================
       11. Blog Comments Submission (Demo)
    =============================== */
    const commentForm = document.getElementById('comment-form') || document.querySelector('.comment-form form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const authorInput = this.querySelector('input[type="text"]');
            const commentInput = this.querySelector('textarea');
            const name = authorInput ? authorInput.value.trim() : 'Guest Reader';
            const text = commentInput ? commentInput.value.trim() : '';

            if (!text) return;

            let feedback = document.getElementById('comment-demo-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.id = 'comment-demo-feedback';
                feedback.style.cssText = 'padding: 14px 18px; border-radius: 8px; background: #dcfce7; color: #166534; border: 1px solid #86efac; margin-top: 15px; font-size: 13px; font-weight: 500;';
                this.appendChild(feedback);
            }
            feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you, <strong>${name}</strong>! Your comment has been submitted to the moderation queue. (Frontend demonstration state)`;
            feedback.style.display = 'block';

            if (commentInput) commentInput.value = '';
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 6000);
        });
    }

    /* ===================================================
       12. Animated Number Counters for Trust Metrics Bar
    ====================================================== */
    const counterElements = document.querySelectorAll('.trust-metrics-bar [data-counter]');
    if (counterElements.length > 0) {
        const animateCounter = (el) => {
            const target = parseFloat(el.getAttribute('data-counter'));
            const prefix = el.getAttribute('data-prefix') || '';
            const suffix = el.getAttribute('data-suffix') || '';
            const isDecimal = target % 1 !== 0;
            const decimals = isDecimal ? (target.toString().split('.')[1] || '').length : 0;
            const duration = 2000;
            const startTime = performance.now();

            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 4);
                const currentVal = ease * target;

                if (isDecimal) {
                    el.innerText = prefix + currentVal.toFixed(decimals) + suffix;
                } else {
                    el.innerText = prefix + Math.floor(currentVal).toLocaleString() + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    if (isDecimal) {
                        el.innerText = prefix + target.toFixed(decimals) + suffix;
                    } else {
                        el.innerText = prefix + target.toLocaleString() + suffix;
                    }
                }
            };

            requestAnimationFrame(updateCount);
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counterElements.forEach(el => animateCounter(el));
                    observer.disconnect();
                }
            });
        }, { threshold: 0.25 });

        const bar = document.querySelector('.trust-metrics-bar');
        if (bar) counterObserver.observe(bar);
    }


    /* ==========================================================================
       Expert Profile Cards Toggle (Touch & Click Interaction)
       ========================================================================== */
    const expertCards = document.querySelectorAll('.expert-card');
    if (expertCards.length > 0) {
        expertCards.forEach(card => {
            const infoBtn = card.querySelector('.expert-card__info-btn');
            const closeBtn = card.querySelector('.expert-card__close-btn');

            if (infoBtn) {
                infoBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Close others
                    expertCards.forEach(c => { if (c !== card) c.classList.remove('is-active'); });
                    card.classList.toggle('is-active');
                });
            }

            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    card.classList.remove('is-active');
                });
            }

            card.addEventListener('click', (e) => {
                if (e.target.closest('a') || e.target.closest('button')) return;
                if (window.innerWidth <= 992) {
                    expertCards.forEach(c => { if (c !== card) c.classList.remove('is-active'); });
                    card.classList.toggle('is-active');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.expert-card')) {
                expertCards.forEach(c => c.classList.remove('is-active'));
            }
        });
    }

});
}

