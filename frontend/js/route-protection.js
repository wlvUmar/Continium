/**
 * Route Protection
 * Prevents unauthorized access to app routes
 */

// Check if user should access this route
function checkAuth(routePath) {
    const isAuthenticated = authService.isAuthed();

    console.log('--- CHECK AUTH ---');
    console.log('Route:', routePath);
    console.log('Token:', localStorage.getItem('access_token'));
    console.log('isAuthed():', isAuthenticated);
    console.log('Current hash:', window.location.hash);

    const publicRoutes = ['/login', '/register', '/forgot-password', '/verify'];
    const isPublicRoute = publicRoutes.includes(routePath);

    // If not logged in and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
        console.log('Access denied - redirecting to login');
        router.navigate('/login');
        return false;
    }

    // If logged in and trying to access login/register
    if (isAuthenticated && (routePath === '/login' || routePath === '/register')) {
        console.log('Already logged in - redirecting to app');
        router.navigate('/app');
        return false;
    }

    return true;
}

// Wrap route handlers with auth check
function protectedRoute(handler) {
    return function (params) {
        const currentPath = window.location.hash.slice(1) || '/';

        if (checkAuth(currentPath)) {
            handler(params);
        }
    };
}

// Logout helper
function handleLogout() {
    authService.logout().finally(() => {
        if (window.router) {
            window.router.navigate('/login');
        } else {
            window.location.hash = '#/login';
        }
    });
}

window.protectedRoute = protectedRoute;
window.handleLogout = handleLogout;
