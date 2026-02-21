/**
 * Route Protection
 * Prevents unauthorized access to app routes
 */

// Check if user should access this route
function checkAuth(routePath) {
    const isAuthenticated = authService.isAuthed();
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
    return function(params) {
        const currentPath = window.location.hash.slice(1) || '/';
        
        if (checkAuth(currentPath)) {
            handler(params);
        }
    };
}

// Logout helper
function handleLogout() {
    authService.logout().then(() => {
        router.navigate('/login');
    }).catch(err => {
        console.error('Logout failed:', err);
        // Force logout anyway
        localStorage.clear();
        router.navigate('/login');
    });
}

window.protectedRoute = protectedRoute;
window.handleLogout = handleLogout;
