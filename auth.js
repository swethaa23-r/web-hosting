/**
 * ============================================================================
 * Stackly Web Hosting - Client-Side Authentication & Session Manager (DEMO MODE)
 * ============================================================================
 * 
 * ARCHITECTURAL AUDIT & PRODUCTION SECURITY NOTICE:
 * This script provides a FRONTEND DEMO SIMULATION of user authentication,
 * role-based navigation, and session handling for evaluation and UI prototyping.
 * 
 * ⚠️ CRITICAL SECURITY WARNING:
 * Client-side password checks, LocalStorage values, browser SHA-256 hashes,
 * and JavaScript role checks DO NOT constitute production-grade security.
 * In any client-side JavaScript execution environment, source code, memory,
 * and browser storage are fully accessible to and modifiable by the end user.
 * A hardcoded salt or key in frontend JavaScript cannot guarantee confidentiality.
 * 
 * REQUIREMENTS FOR A PRODUCTION-READY IMPLEMENTATION:
 * 1. Backend Authentication API:
 *    - All credential checks must occur on a hardened backend server (Node.js/Go/Python/Java).
 * 2. Server-Side Password Hashing:
 *    - Passwords must be hashed using Argon2id or BCrypt with individual cryptographically
 *      random salts (min 16 bytes) and appropriate cost/memory parameters.
 * 3. Secure Session Management:
 *    - Use server-issued, cryptographically random session identifiers transmitted solely
 *      via HttpOnly, Secure, SameSite=Strict cookies to protect against XSS and CSRF.
 * 4. Server-Side Role-Based Access Control (RBAC):
 *    - Authorization must be strictly enforced on every API route and server endpoint.
 *    - Client-side navigation guards are strictly for UX routing and never replace server RBAC.
 * 5. Secure Password Recovery:
 *    - Time-limited (15-min TTL), single-use cryptographic tokens generated on the server
 *      and dispatched through a dedicated transactional email service (e.g., SES, Resend, SendGrid).
 * 6. Rate Limiting & Abuse Prevention:
 *    - Implement IP and account-based rate limiting on login/signup endpoints to protect
 *      against brute-force and credential-stuffing attacks.
 * ============================================================================
 */

(function(window) {
    'use strict';

    // Demo simulation salt used exclusively for local UI state demonstration
    const DEMO_SIMULATION_SALT = 'STACKLY_CLIENT_DEMO_SIMULATION_SALT_DO_NOT_USE_IN_PRODUCTION';

    // Fast, lightweight, zero-dependency SHA-256 implementation
    function sha256(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }
        const mathPow = Math.pow;
        const maxWord = mathPow(2, 32);
        let lengthProperty = 'length';
        let i, j;
        let result = '';
        const words = [];
        const asciiBitLength = ascii[lengthProperty] * 8;
        
        let hash = sha256.h = sha256.h || [];
        const k = sha256.k = sha256.k || [];
        let primeCounter = k[lengthProperty];

        const isComposite = {};
        for (let candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (i = 0; i < 300; i += candidate) {
                    isComposite[i] = candidate;
                }
                hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
            }
        }
        
        ascii += '\x80';
        while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
        for (i = 0; i < ascii[lengthProperty]; i++) {
            j = ascii.charCodeAt(i);
            if (j >> 8) return; // only ASCII
            words[i >> 2] |= j << ((3 - i % 4) * 8);
        }
        words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
        words[words[lengthProperty]] = (asciiBitLength | 0);
        
        for (j = 0; j < words[lengthProperty];) {
            const w = words.slice(j, j += 16);
            const oldHash = hash;
            hash = hash.slice(0, 8);
            
            for (i = 0; i < 64; i++) {
                const i2 = i + j;
                const w15 = w[i - 15], w2 = w[i - 2];
                const a = hash[0], e = hash[4];
                const temp1 = hash[7]
                    + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                    + ((e & hash[5]) ^ ((~e) & hash[6]))
                    + k[i]
                    + (w[i] = (i < 16) ? w[i] : (
                            w[i - 16]
                            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                            + w[i - 7]
                            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                        ) | 0
                    );
                const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                    + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
                
                hash = [(temp1 + temp2) | 0].concat(hash);
                hash[4] = (hash[4] + temp1) | 0;
            }
            
            for (i = 0; i < 8; i++) {
                hash[i] = (hash[i] + oldHash[i]) | 0;
            }
        }
        
        for (i = 0; i < 8; i++) {
            for (j = 3; j + 1; j--) {
                const b = (hash[i] >> (j * 8)) & 255;
                result += ((b < 16) ? 0 : '') + b.toString(16);
            }
        }
        return result;
    }

    // Helper to format a nice display name from an email address
    function formatNameFromEmail(email) {
        if (!email) return 'User';
        const namePart = email.split('@')[0];
        const cleaned = namePart.replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
        if (!cleaned) return namePart.charAt(0).toUpperCase() + namePart.slice(1);
        return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }

    // Default Seed Accounts
    const DEFAULT_ACCOUNTS = [
        {
            id: 'usr_admin_01',
            fullname: 'System Administrator',
            username: 'admin',
            email: 'admin@stackly.com',
            passwordHash: sha256('admin123' + DEMO_SIMULATION_SALT),
            role: 'Admin',
            phone: '+1 (555) 987-6543'
        },
        {
            id: 'usr_client_01',
            fullname: 'Alex Morgan',
            username: 'alexm',
            email: 'user@stackly.com',
            passwordHash: sha256('user123' + DEMO_SIMULATION_SALT),
            role: 'User',
            phone: '+1 (555) 123-4567'
        }
    ];

    const AuthManager = {
        // Initialize User Database in LocalStorage
        init: function() {
            try {
                if (!localStorage.getItem('stackly_users_db')) {
                    localStorage.setItem('stackly_users_db', JSON.stringify(DEFAULT_ACCOUNTS));
                }
            } catch (e) {
                console.warn('Storage unavailable:', e);
            }
        },

        // Get All Users (Seed + Registered)
        getUsers: function() {
            this.init();
            try {
                const raw = localStorage.getItem('stackly_users_db');
                return raw ? JSON.parse(raw) : DEFAULT_ACCOUNTS;
            } catch (e) {
                return DEFAULT_ACCOUNTS;
            }
        },

        // Hash a password using browser SHA-256 + demo simulation salt
        hashPassword: function(plain) {
            return sha256(plain + DEMO_SIMULATION_SALT);
        },

        // Generate a demonstration signature for local UI session integrity checking
        generateSessionToken: function(email, role, timestamp) {
            return sha256([email.toLowerCase(), role, timestamp, DEMO_SIMULATION_SALT].join('::'));
        },

        // Validate an active session & detect client-side tampering
        validateSession: function() {
            let session = null;
            let source = null;

            try {
                const sessionRaw = sessionStorage.getItem('stackly_auth_session');
                const localRaw = localStorage.getItem('stackly_auth_session');
                
                if (sessionRaw) {
                    session = JSON.parse(sessionRaw);
                    source = 'session';
                } else if (localRaw) {
                    session = JSON.parse(localRaw);
                    source = 'local';
                }
            } catch (e) {
                return { isValid: false, reason: 'corrupted' };
            }

            if (!session) {
                return { isValid: false, reason: 'no_session' };
            }

            // Expiration check (24 hours default)
            const now = Date.now();
            if (session.expiresAt && now > session.expiresAt) {
                this.logout(false);
                return { isValid: false, reason: 'expired' };
            }

            // Verify signature against payload
            const expectedToken = this.generateSessionToken(session.email, session.role, session.createdAt);
            if (session.token !== expectedToken) {
                console.error('[Security Guard] Tampered session signature detected! Discarding credentials.');
                this.logout(false);
                return { isValid: false, reason: 'tampered' };
            }

            // Verify role matches legacy localStorage keys if set
            const legacyRole = localStorage.getItem('userRole');
            if (legacyRole && legacyRole !== session.role) {
                console.error('[Security Guard] Mismatched localStorage role detected! Invalidate session.');
                this.logout(false);
                return { isValid: false, reason: 'tampered' };
            }

            return { isValid: true, session: session, source: source };
        },

        // Authenticate User Credentials
        authenticate: function(email, password, rememberMe, explicitRole = null) {
            this.init();
            let users = this.getUsers();
            const cleanEmail = email.trim().toLowerCase();
            const cleanPass = password.trim();

            if (!cleanPass || cleanPass.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters.' };
            }

            let user = users.find(u => u.email.toLowerCase() === cleanEmail);
            const chosenRole = explicitRole || (cleanEmail.includes('admin') ? 'Admin' : 'User');

            if (!user) {
                // Dynamically create and save new user
                const role = chosenRole;
                const fullname = formatNameFromEmail(cleanEmail);
                user = {
                    id: 'usr_' + Date.now().toString(36),
                    fullname: fullname,
                    username: cleanEmail.split('@')[0],
                    email: cleanEmail,
                    passwordHash: this.hashPassword(cleanPass),
                    role: role,
                    phone: ''
                };
                users.push(user);
                try {
                    localStorage.setItem('stackly_users_db', JSON.stringify(users));
                } catch (e) {
                    console.warn('Storage save failed:', e);
                }
            } else {
                // Accept any valid password with length >= 6 and update role & hash
                user.role = chosenRole;
                user.passwordHash = this.hashPassword(cleanPass);
                try {
                    localStorage.setItem('stackly_users_db', JSON.stringify(users));
                } catch (e) {}
            }

            // Create signed session
            const now = Date.now();
            const expires = now + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
            const token = this.generateSessionToken(user.email, user.role, now);

            const sessionData = {
                userId: user.id,
                fullname: user.fullname || formatNameFromEmail(user.email),
                username: user.username || user.email.split('@')[0],
                email: user.email,
                role: user.role,
                createdAt: now,
                expiresAt: expires,
                token: token
            };

            // Store session
            sessionStorage.setItem('stackly_auth_session', JSON.stringify(sessionData));
            if (rememberMe) {
                localStorage.setItem('stackly_auth_session', JSON.stringify(sessionData));
            } else {
                localStorage.removeItem('stackly_auth_session');
            }

            // Sync user data for dashboards and topbar
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('currentUserEmail', user.email);
            localStorage.setItem('stacklyUsername', sessionData.fullname);
            localStorage.setItem('currentUserName', sessionData.fullname);
            localStorage.setItem('userRole', user.role);

            const pathLower = window.location.pathname.toLowerCase();
            const isInsideDashboard = pathLower.includes('/dashboard/') || pathLower.includes('\\dashboard\\');
            const dashPrefix = isInsideDashboard ? '' : 'dashboard/';

            return { 
                success: true, 
                role: user.role, 
                targetDashboard: dashPrefix + (user.role === 'Admin' ? 'admin-dashboard.html' : 'user-dashboard.html'),
                user: sessionData 
            };
        },

        // Register a New User Account
        register: function(userData) {
            this.init();
            const users = this.getUsers();
            const cleanEmail = userData.email.trim().toLowerCase();
            const cleanUsername = userData.username.trim().toLowerCase();

            // Check if email already exists
            if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
                return { success: false, error: 'An account with this email address is already registered.' };
            }

            // Check if username already exists
            if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
                return { success: false, error: 'This username is already taken. Please choose another.' };
            }

            const newUser = {
                id: 'usr_' + Date.now().toString(36),
                fullname: userData.fullname.trim(),
                username: userData.username.trim(),
                email: userData.email.trim(),
                passwordHash: this.hashPassword(userData.password),
                role: userData.role || 'User',
                phone: userData.phone ? userData.phone.trim() : ''
            };

            users.push(newUser);
            try {
                localStorage.setItem('stackly_users_db', JSON.stringify(users));
            } catch (e) {
                return { success: false, error: 'Storage quota exceeded. Cannot register user.' };
            }

            return { success: true, user: newUser };
        },

        // Request Password Reset
        requestPasswordReset: function(email) {
            this.init();
            const cleanEmail = email.trim().toLowerCase();
            const users = this.getUsers();
            const user = users.find(u => u.email.toLowerCase() === cleanEmail);

            // Generate reset token
            const resetToken = 'rst_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            const resetRequests = JSON.parse(localStorage.getItem('stackly_reset_requests') || '{}');
            
            resetRequests[cleanEmail] = {
                token: resetToken,
                createdAt: Date.now(),
                expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
            };
            
            localStorage.setItem('stackly_reset_requests', JSON.stringify(resetRequests));

            return {
                success: true,
                email: cleanEmail,
                token: resetToken,
                userFound: !!user
            };
        },

        // Apply Password Reset
        applyPasswordReset: function(email, newPassword) {
            this.init();
            const cleanEmail = email.trim().toLowerCase();
            const users = this.getUsers();
            const user = users.find(u => u.email.toLowerCase() === cleanEmail);

            if (!user) {
                return { success: false, error: 'Account not found for password reset.' };
            }

            user.passwordHash = this.hashPassword(newPassword);
            localStorage.setItem('stackly_users_db', JSON.stringify(users));

            // Clean up reset requests
            const resetRequests = JSON.parse(localStorage.getItem('stackly_reset_requests') || '{}');
            delete resetRequests[cleanEmail];
            localStorage.setItem('stackly_reset_requests', JSON.stringify(resetRequests));

            return { success: true };
        },

        // Terminate Session & Logout
        logout: function(redirect = true) {
            sessionStorage.removeItem('stackly_auth_session');
            localStorage.removeItem('stackly_auth_session');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('stacklyUsername');
            localStorage.removeItem('currentUserName');
            localStorage.removeItem('userRole');

            if (redirect) {
                const pathLower = window.location.pathname.toLowerCase();
                const isInsideDashboard = pathLower.includes('/dashboard/') || pathLower.includes('\\dashboard\\');
                window.location.href = (isInsideDashboard ? '../' : '') + 'login.html';
            }
        },

        // Route Protection Guard for Protected Pages
        protectPage: function(requiredRole = null) {
            const check = this.validateSession();
            const pathLower = window.location.pathname.toLowerCase();
            const isInsideDashboard = pathLower.includes('/dashboard/') || pathLower.includes('\\dashboard\\');
            const loginPath = (isInsideDashboard ? '../' : '') + 'login.html';

            if (!check.isValid) {
                let reasonParam = check.reason || 'unauthorized';
                const currentFile = window.location.pathname.replace(/\\/g, '/').split('/').pop();
                const redirectParam = (isInsideDashboard ? 'dashboard/' : '') + currentFile;
                window.location.href = `${loginPath}?error=${reasonParam}&redirect=${encodeURIComponent(redirectParam)}`;
                return false;
            }

            const currentRole = check.session.role;

            // If an Admin page requires Admin clearance
            if (requiredRole === 'Admin' && currentRole !== 'Admin') {
                console.warn('[Security Guard] Standard user attempted admin route access.');
                const userDashPath = (isInsideDashboard ? '' : 'dashboard/') + 'user-dashboard.html?denied=admin_only';
                window.location.href = userDashPath;
                return false;
            }

            // Sync user UI details if header elements exist
            const nameEl = document.getElementById('admin-name') || document.querySelector('.profile-info .name');
            if (nameEl && check.session.fullname) {
                nameEl.innerText = check.session.fullname;
            }

            return true;
        },

        // Update Active Profile Session
        updateProfile: function(newName, newEmail) {
            const check = this.validateSession();
            if (!check.isValid) return false;

            const session = check.session;
            session.fullname = newName;
            session.username = newName;
            session.email = newEmail;
            session.token = this.generateSessionToken(newEmail, session.role, session.createdAt);

            if (check.source === 'local' || check.source === 'localStorage') {
                localStorage.setItem('stackly_auth_session', JSON.stringify(session));
            }
            sessionStorage.setItem('stackly_auth_session', JSON.stringify(session));

            localStorage.setItem('stacklyUsername', newName);
            localStorage.setItem('userEmail', newEmail);
            return true;
        }
    };

    // Auto-initialize
    AuthManager.init();

    // Export globally
    window.AuthManager = AuthManager;

})(window);
