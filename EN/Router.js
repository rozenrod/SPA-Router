/**
 * SPA Router v1.0.1
 * -----------------
 * Lightweight Single Page Application router with support for:
 * - History and hash modes
 * - Route parameters and query parameters
 * - Link delegation and scroll restoration
 *
 * Usage:
 *   Router.config({ mode: 'history', root: '/' }).listen().delegateLinks();
 *
 * Author: Rozenrod (https://github.com/rozenrod)
 * License: MIT
 */

const Router = {
    routes: [], // List of routes (pattern + handler)
    mode: 'history', // Mode: 'history' or 'hash'
    root: '/', // Application root

    // Router configuration
    config({ mode = 'hash', root = '/' } = {}) {
        const cleanRoot = '/' + this.clearSlashes(root) + '/';
        // Use history API if supported and mode is 'history'
        this.mode = (mode === 'history' && history.pushState) ? 'history' : 'hash';
        // Prevent absolute URLs (e.g., http://...)
        this.root = cleanRoot.startsWith('http') ? '/' : cleanRoot;
        return this;
    },

    // Removes leading and trailing slashes from a path
    clearSlashes(path) {
        return path.toString().replace(/^\/+|\/+$/g, '');
    },

    // Gets the current fragment (part of the URL after root or after #)
    getFragment() {
        let fragment = '';
        if (this.mode === 'history') {
            fragment = decodeURI(location.pathname + location.search);
            fragment = fragment.replace(this.root, '').split('?')[0];
        } else {
            fragment = location.hash.slice(1).split('?')[0];
        }
        return this.clearSlashes(fragment);
    },

    // Extracts query parameters from the URL
    getParams() {
        let query = this.mode === 'history' ? location.search : location.hash.split('?')[1] || '';
        const params = {};
        new URLSearchParams(query).forEach((v, k) => params[k] = v);
        return params;
    },

    // Adds a new route
    add(re, handler, options) {
        if (typeof re === 'function') {
            handler = re;
            re = '';
        }
        this.routes.push({ re, handler, options });
        return this;
    },

    // Removes a route by handler or pattern
    remove(param) {
        this.routes = this.routes.filter(r =>
            r.handler !== param && r.re.toString() !== param.toString()
        );
        return this;
    },

    // Clears all routes and resets mode
    flush() {
        this.routes = [];
        this.mode = 'hash';
        this.root = '/';
        return this;
    },

    // Checks the fragment and calls the corresponding route handler
    check(fragment = this.getFragment()) {
        const query = this.getParams();
        for (const { re, handler } of this.routes) {
            const match = (fragment || 'home').match(re);
            if (match) {
                handler.apply({ query }, match.slice(1));

                // Scroll to element with id if there is a #hash
                if (location.hash.length > 1) {
                    const el = document.getElementById(location.hash.slice(1));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }

                return this;
            }
        }
        return this;
    },

    // Listens for URL changes
    listen() {
        const onChange = (e) => {
            this.check();

            // Restore scroll position from history state
            const pos = e?.state?.scroll;
            if (pos) {
                setTimeout(() => {
                    window.scrollTo(pos.x, pos.y);
                }, 50);
            }
        };
        if (this.mode === 'history') {
            window.addEventListener('popstate', onChange);
        } else {
            window.addEventListener('hashchange', onChange);
        }
        return this;
    },

    // Delegates clicks on links with data-route
    delegateLinks() {
        window.addEventListener('click', (e) => {
            const target = e.target.closest('[data-route]');
            if (!target || !target.href) return;

            const path = target.href.replace(location.origin, '');
            if (path === this.getFragment()) return;

            e.preventDefault();
            this.navigate(path); // Triggers navigation without page reload
        });
        return this;
    },

    // Navigates to a new path (push or replace)
    navigate(path = '', push = true) {
        const scroll = { x: window.scrollX, y: window.scrollY };
        history.replaceState({ scroll }, '', location.href);

        if (this.mode === 'history') {
            const url = new URL(path, location.origin);
            const relativePath = url.pathname + url.search + url.hash;
            history[push ? 'pushState' : 'replaceState']({}, '', relativePath);
        } else {
            location.hash = this.clearSlashes(path);
        }

        if(push == true) {
            window.scrollTo(0, 0); // Reset scroll on navigation
            this.check();
        }
        return this;
    },

    // Updates a query parameter in the current URL
    update(key, value) {
        const params = new URLSearchParams(location.search);
        params.set(key, value);
        const newUrl = location.origin + location.pathname + '?' + params.toString();
        history.replaceState({ position: window.pageYOffset }, '', newUrl);
    }
};