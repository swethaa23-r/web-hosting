/**
 * script.js - Centralized JavaScript for Stackly Web Hosting
 * All logic includes safe null checks to prevent console errors on pages where elements don't exist.
 */

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
        navbar.appendChild(overlay);
    }

    if (hamburger && navLinks && overlay) {
        function toggleMenu() {
            const isOpen = navLinks.classList.contains('active');
            if (isOpen) {
                navLinks.classList.remove('active');
                overlay.style.display = 'none';
                document.body.style.overflow = ''; // Restore scrolling
            } else {
                navLinks.classList.add('active');
                overlay.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
        }

        hamburger.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        
        // Close menu when a navigation link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

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
       6. Domain Search Validation
    =============================== */
    const domainForm = document.getElementById('domain-search-form');
    const domainInput = document.getElementById('domain-input');
    const domainResult = document.getElementById('domain-result');

    if (domainForm && domainInput && domainResult) {
        domainForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const val = domainInput.value.trim().toLowerCase();
            const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\\.[a-zA-Z]{2,})?$/;
            
            domainResult.style.display = 'block';
            domainResult.style.padding = '15px';
            domainResult.style.borderRadius = '5px';
            domainResult.style.marginTop = '20px';
            domainResult.style.fontWeight = '500';

            if (!val) {
                domainResult.style.backgroundColor = '#fee2e2';
                domainResult.style.color = '#991b1b';
                domainResult.style.border = '1px solid #f87171';
                domainResult.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please enter a domain name to search.';
            } else if (!domainRegex.test(val)) {
                domainResult.style.backgroundColor = '#fef3c7';
                domainResult.style.color = '#92400e';
                domainResult.style.border = '1px solid #fbbf24';
                domainResult.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Invalid format. Enter a valid name (e.g. yourdomain.com).';
            } else {
                domainResult.style.backgroundColor = '#dcfce7';
                domainResult.style.color = '#166534';
                domainResult.style.border = '1px solid #86efac';
                const finalDomain = val.includes('.') ? val : val + '.com';
                domainResult.innerHTML = `<i class="fa-solid fa-circle-check"></i> Great news! <strong>${finalDomain}</strong> is available.`;
            }
        });
    }

    /* ============================
       7. Newsletter Global Validation
    =============================== */
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    if (newsletterForms.length > 0) {
        newsletterForms.forEach(form => {
            // Prevent duplicate bindings if inline JS already handles it
            if(form.hasAttribute('onsubmit')) return; 

            const btn = form.querySelector('button');
            if(btn) btn.type = 'submit';
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const input = form.querySelector('input[type="email"]');
                const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                
                if (input && emailRegex.test(input.value.trim())) {
                    const originalPlaceholder = input.placeholder;
                    input.value = '';
                    input.placeholder = 'Subscribed successfully!';
                    input.style.border = '2px solid #10b981';
                    
                    setTimeout(() => {
                        input.placeholder = originalPlaceholder;
                        input.style.border = '';
                    }, 3000);
                } else if (input) {
                    input.style.border = '2px solid #ef4444';
                    setTimeout(() => {
                        input.style.border = '';
                    }, 3000);
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
            
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            const phoneRegex = /^[+]?[\\d\\s()-]{10,15}$/;
            
            document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
            document.querySelectorAll('.invalid-feedback').forEach(el => el.style.display = 'none');
            
            if(name && name.value.trim() === '') { name.classList.add('is-invalid'); document.getElementById('err-name').style.display = 'block'; isValid = false; }
            if(email && !emailRegex.test(email.value.trim())) { email.classList.add('is-invalid'); document.getElementById('err-email').style.display = 'block'; isValid = false; }
            if(phone && !phoneRegex.test(phone.value.trim().replace(/[\\s()-]/g, ''))) { phone.classList.add('is-invalid'); document.getElementById('err-phone').style.display = 'block'; isValid = false; }
            if(subject && subject.value.trim() === '') { subject.classList.add('is-invalid'); document.getElementById('err-subject').style.display = 'block'; isValid = false; }
            if(message && message.value.trim().length < 10) { message.classList.add('is-invalid'); document.getElementById('err-message').style.display = 'block'; isValid = false; }
            
            if(isValid) {
                successMsg.style.display = 'block';
                contactForm.reset();
                setTimeout(() => { successMsg.style.display = 'none'; }, 5000);
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

});
