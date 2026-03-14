/**
 * Layout Component - Sidebar + main container wrapper
 * Shared across all protected pages
 */

// ============================================
// SIDEBAR
// ============================================

function createSidebar() {
  const user = authService.getUser();
  const userName = user
    ? user.full_name || user.fullName || "Username"
    : "Username";

  return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="user-profile-header user-profile-header--clickable" onclick="openProfileModal()" title="View profile">
                    <div class="user-avatar-header">
                        <img src="assets/icons/si_user-fill.svg" alt="User" style="width:28px;height:28px;filter:brightness(0) invert(1);">
                    </div>
                    <div class="user-info-header">
                        <p class="username-header">${userName}</p>
                    </div>
                    <button class="header-logout-btn" onclick="event.stopPropagation(); handleLogout()" title="Logout">
                        <img src="assets/icons/exit_vector.svg" alt="Logout" style="width:24px;height:24px;">
                    </button>
                </div>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section">
                    <!-- Projects: text area navigates, arrow toggles dropdown -->
                    <div class="nav-item nav-item-dropdown">
                        <span class="nav-icon nav-target" onclick="router.navigate('/projects')">
                            <img src="assets/icons/material-symbols_border-all-rounded.svg" alt="Projects" class="icon">
                        </span>
                        <span class="nav-text nav-target" onclick="router.navigate('/projects')">Projects</span>
                        <button class="dropdown-arrow dropdown-arrow-btn" id="projectsArrow" onclick="toggleProjectsDropdown()">
                            <img src="assets/icons/ARROW Frame.svg" alt="▼" class="dropdown-icon">
                        </button>
                    </div>
                    <div class="projects-dropdown projects-dropdown--closed" id="projectsDropdown">
                        <div id="sidebarProjectsList">
                            <div class="sidebar-projects-state">Loading...</div>
                        </div>
                    </div>
                </div>

                <button class="nav-item" style="background: none; border: none; padding: 0; cursor: pointer; width: 100%; text-align: left;" onclick="openAddGoalModal()">
                    <span class="nav-icon">
                        <img src="assets/icons/carbon_add-filled.svg" alt="Add Goal" class="icon">
                    </span>
                    <span class="nav-text">Add goal</span>
                </button>

                <a href="#/statistics" class="nav-item" data-route="/statistics">
                    <span class="nav-icon">
                        <img src="assets/icons/solar_chart-bold.svg" alt="Statistics" class="icon">
                    </span>
                    <span class="nav-text">Statistics</span>
                </a>

                <a href="#/completed" class="nav-item" data-route="/completed">
                    <span class="nav-icon">
                        <img src="assets/icons/checkmark_icon.svg" alt="Completed" class="icon">
                    </span>
                    <span class="nav-text">Completed</span>
                </a>
            </nav>

            <div class="sidebar-footer">
            </div>
        </aside>
    `;
}

// Toggle projects dropdown (arrow button only)
window.toggleProjectsDropdown = function () {
  const dropdown = document.getElementById("projectsDropdown");
  const arrowImg = document.querySelector("#projectsArrow .dropdown-icon");
  const isOpen = dropdown.classList.contains("projects-dropdown--open");

  if (isOpen) {
    dropdown.classList.remove("projects-dropdown--open");
    dropdown.classList.add("projects-dropdown--closed");
    if (arrowImg) arrowImg.style.transform = "rotate(0deg)";
  } else {
    dropdown.classList.remove("projects-dropdown--closed");
    dropdown.classList.add("projects-dropdown--open");
    if (arrowImg) arrowImg.style.transform = "rotate(180deg)";
    loadSidebarProjects();
  }
};

// Load real projects into sidebar dropdown
window.loadSidebarProjects = async function () {
  const listEl = document.getElementById("sidebarProjectsList");
  if (!listEl) return;
  try {
    const goals = await goalsService.fetchGoals();
    const active = goals.filter(
      (g) => !g.is_complete && g.status !== "completed",
    );
    if (!active.length) {
      listEl.innerHTML = `<div class="sidebar-projects-state">No projects yet</div>`;
      return;
    }
    const storedColors = JSON.parse(localStorage.getItem("goalColors") || "{}");
    listEl.innerHTML = active
      .map((g) => {
        const color =
          g.color || storedColors[g.id] || storedColors[g.title] || "#00BCD4";
        const durationMin = g.duration_min || 0;
        const h = Math.floor(durationMin / 60);
        const m = durationMin % 60;
        const timeStr = `0h 00m / ${h}h ${String(m).padStart(2, "0")}m`;
        return `
                <div class="project-item" onclick="router.navigate('/project/${g.id}')">
                    <div class="sidebar-project-row">
                        <button class="sidebar-play-btn" onclick="event.stopPropagation(); router.navigate('/project/${g.id}')" title="Start">
                            <img src="assets/icons/play_vector.svg" alt="Play">
                        </button>
                        <span class="project-name">${g.title || "Untitled"}</span>
                        <img src="assets/icons/next_vector.svg" class="project-next-icon" alt="">
                    </div>
                    <div class="project-progress">
                        <span class="project-progress-text">${timeStr}</span>
                        <div class="project-progress-bar">
                            <div class="project-progress-fill" style="width:0; background:${color};"></div>
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");
  } catch (err) {
    if (listEl)
      listEl.innerHTML = `<div class="sidebar-projects-state">Failed to load</div>`;
  }
};

// Toggle light/dark theme
window.toggleTheme = function () {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  const lightBtn = document.querySelector(".theme-opt-light");
  const darkBtn = document.querySelector(".theme-opt-dark");
  if (lightBtn) lightBtn.classList.toggle("active", !isDark);
  if (darkBtn) darkBtn.classList.toggle("active", isDark);
};

// ============================================
// LAYOUT WRAPPER
// ============================================

function createLayout(content, currentRoute = "/projects") {
  const isDark = document.body.classList.contains("dark-mode");
  return `
        <div class="app-layout">
            ${createSidebar(currentRoute)}
            <main class="main-container">
                ${content}
            </main>
        </div>
        <div class="theme-toggle-pill">
            <button class="theme-opt theme-opt-light ${isDark ? "" : "active"}" onclick="toggleTheme()" title="Light mode">
                <img src="assets/icons/Light.svg" alt="Light">
            </button>
            <button class="theme-opt theme-opt-dark ${isDark ? "active" : ""}" onclick="toggleTheme()" title="Dark mode">
                <img src="assets/icons/Dark.svg" alt="Dark">
            </button>
        </div>
    `;
}

function attachNavigationListeners() {
  document
    .querySelectorAll(".nav-item:not(.nav-item-dropdown)")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const route = item.getAttribute("data-route");
        if (!route) return;
        router.navigate(route);
      });
    });
}

window.createLayout = createLayout;
window.attachNavigationListeners = attachNavigationListeners;
window.createSidebar = createSidebar;
