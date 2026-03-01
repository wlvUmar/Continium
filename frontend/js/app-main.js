import './api.js';
import './auth.js';
import './route-protection.js';
import './ui-utilities.js';
import './router.js';
import './auth-pages.js';
import './layout.js';
import './statistics.js';
import './goals-list.js';

const appContainer = document.getElementById('app');
window.appContainer = appContainer;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (authService && authService.isAuthed()) {
        authService.fetchUser().catch(err => {
            console.error('Failed to fetch user:', err);
        });
    }
});

// Register all routes
router.on('/login', () => {
    renderLogin();
});

router.on('/register', () => {
    renderRegister();
});

router.on('/verify', () => {
    renderVerification();
});

router.on('/forgot-password', () => {
    renderForgotPassword();
});

router.on('/app', protectedRoute(() => {
    renderDashboard();
}));

router.on('/projects', protectedRoute(() => {
    renderProjects();
}));

router.on('/add-goal', protectedRoute(() => {
    renderAddGoal();
}));

router.on('/statistics', protectedRoute(() => {
    renderStatistics();
}));

router.on('/completed', protectedRoute(() => {
    renderCompleted();
}));

router.on('/project/:id', protectedRoute((params) => {
    renderProjectDetail(params.id);
}));

router.on('/goal/:id', protectedRoute((params) => {
    renderGoal(params.id);
}));

// Default route
router.on('/', () => {
    if (authService && authService.isAuthed()) {
        router.navigate('/app');
    } else {
        router.navigate('/login');
    }
});

// Handle the current route now that all routes are registered
router.handleRoute();