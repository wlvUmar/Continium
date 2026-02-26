/**
 * Simple Hash Router
 * Handles routing for #/login, #/app, #/goal/:id
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;

    }

    on(path, handler) {
        this.routes[path] = handler;
    }

    navigate(path) {
        window.location.hash = path;
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        let hash = window.location.hash.slice(1) || '/';

        // Normalize trailing slashes (e.g., /projects/ -> /projects)
        if (hash.length > 1 && hash.endsWith('/')) {
            hash = hash.slice(0, -1);
        }

        // Prevent double execution on same route
        if (this.currentRoute === hash) return;

        // Infinite loop prevention guard
        if (this._lastRedirect === hash && Date.now() - (this._lastRedirectTime || 0) < 500) {
            console.error('Infinite redirect loop detected to:', hash);
            return;
        }

        console.log('CURRENT HASH:', hash);

        const matchedRoute = this.matchRoute(hash);

        if (matchedRoute) {
            this.currentRoute = hash;
            matchedRoute.handler(matchedRoute.params);
        } else {
            console.warn('Unknown route:', hash);
            this._lastRedirect = hash;
            this._lastRedirectTime = Date.now();

            // Minimal 404 state instead of blind redirect
            if (window.appContainer) {
                window.appContainer.innerHTML = `
                    <div style="text-align: center; padding: 100px 20px;">
                        <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">🔍</div>
                        <h2 style="font-size: 24px; color: #333; margin-bottom: 12px;">Page Not Found</h2>
                        <p style="color: #666; margin-bottom: 24px;">The page you are looking for doesn't exist.</p>
                        <button onclick="window.history.back()" style="padding: 10px 20px; background: #00BCD4; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Go Back</button>
                    </div>
                `;
            }
        }
    }

    matchRoute(hash) {
        for (const [path, handler] of Object.entries(this.routes)) {
            const params = this.extractParams(path, hash);
            if (params !== null) {
                return { handler, params };
            }
        }
        return null;
    }

    extractParams(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};

        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                const paramName = patternParts[i].slice(1);
                params[paramName] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }

        return params;
    }
}

const router = new Router();
window.router = router;
export default router;
