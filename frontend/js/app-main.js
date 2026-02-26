import './api.js';
import './auth.js';
import './route-protection.js';
import './ui-utilities.js';
import './router.js';
import './auth-pages.js';
import './layout.js';
import './statistics.js';
import './goals-list.js';
import './goal-detail.js';
import './completed-goals.js';
import './goal-crud.js';

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

router.on('/add-goal', protectedRoute(() => {
    // We use a modal for this now, so we redirect to projects and open modal
    router.navigate('/projects');
    setTimeout(() => {
        if (window.showAddGoalModal) window.showAddGoalModal();
    }, 100);
}));

router.on('/projects', protectedRoute(() => {
    renderProjects();
}));

router.on('/goal/:id', protectedRoute((params) => {
    renderGoalDetail(params.id);
}));

router.on('/completed', protectedRoute(() => {
    renderCompletedGoalsPage();
}));

router.on('/profile', protectedRoute(() => {
    renderProfilePage();
}));

// Default route
router.on('/', () => {
    if (authService && authService.isAuthed()) {
        router.navigate('/app');
    } else {
        router.navigate('/login');
    }
});
router.init();