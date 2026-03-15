/**
 * Layout Component - Sidebar + main container wrapper
 * Shared across all protected pages
 */

// ============================================
// SIDEBAR
// ============================================

function createSidebar(currentRoute = "/projects") {
  const user = authService.getUser();
  const userName = user
    ? user.full_name || user.fullName || "Username"
    : "Username";
  const isProjectsActive =
    currentRoute === "/projects" || currentRoute.startsWith("/project/");

  return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="user-profile-header user-profile-header--clickable" onclick="router.navigate('/profile')" title="View profile">
                    <div class="user-avatar-header">
                        <img src="assets/icons/si_user-fill.svg" alt="User" style="width:28px;height:28px;filter:brightness(0) invert(1);">
                    </div>
                    <div class="user-info-header">
                        <p class="username-header">${userName}</p>
                    </div>
                    <button class="notification-btn" onclick="event.stopPropagation(); toggleNotifications(this)">
                        <img src="assets/icons/basil_notification-on-solid.svg" alt="Notifications" class="notification-icon">
                    </button>
                </div>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section">
                    <!-- Projects: text area navigates, arrow toggles dropdown -->
                    <div class="nav-item nav-item-dropdown ${isProjectsActive ? "active" : ""}">
                        <span class="nav-icon" onclick="router.navigate('/projects')" style="cursor:pointer;">
                            <img src="assets/icons/material-symbols_border-all-rounded.svg" alt="Projects" class="icon">
                        </span>
                        <span class="nav-text" onclick="router.navigate('/projects')" style="cursor:pointer; flex:1;">Projects</span>
                        <button class="dropdown-arrow" id="projectsArrow" onclick="toggleProjectsDropdown(this)" style="background:none;border:none;cursor:pointer;padding:4px;">
                            <img src="assets/icons/ARROW Frame.svg" alt="▼" class="dropdown-icon">
                        </button>
                    </div>
                    <div class="projects-dropdown" id="projectsDropdown" style="display:none;">
                        <div id="sidebarProjectsList">
                            <div style="padding:8px 12px; color:#aaa; font-size:13px;">Loading...</div>
                        </div>
                    </div>
                </div>

                <a href="#/add-goal" class="nav-item ${currentRoute === "/add-goal" ? "active" : ""}" data-route="/add-goal">
                    <span class="nav-icon">
                        <img src="assets/icons/carbon_add-filled.svg" alt="Add Goal" class="icon">
                    </span>
                    <span class="nav-text">Add goal</span>
                </a>

                <a href="#/statistics" class="nav-item ${currentRoute === "/statistics" ? "active" : ""}" data-route="/statistics">
                    <span class="nav-icon">
                        <img src="assets/icons/solar_chart-bold.svg" alt="Statistics" class="icon">
                    </span>
                    <span class="nav-text">Statistics</span>
                </a>

                <a href="#/completed" class="nav-item ${currentRoute === "/completed" ? "active" : ""}" data-route="/completed">
                    <span class="nav-icon">
                        <img src="assets/icons/checkmark_icon.svg" alt="Completed" class="icon">
                    </span>
                    <span class="nav-text">Completed</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <button class="nav-item help-btn" onclick="openHelpCenter()">
                    <span class="nav-icon help-icon-circle">?</span>
                    <span class="nav-text">Help</span>
                </button>
                <button class="nav-item logout-btn" onclick="handleLogout()">
                    <span class="nav-icon">
                        <img src="assets/icons/exit_vector.svg" alt="Logout" class="icon">
                    </span>
                    <span class="nav-text">Logout</span>
                </button>
            </div>
        </aside>
    `;
}

// Toggle projects dropdown (arrow button only)
window.toggleProjectsDropdown = function (btn) {
  const dropdown = document.getElementById("projectsDropdown");
  const arrowImg = document.querySelector("#projectsArrow .dropdown-icon");
  const isOpen =
    dropdown.style.display !== "none" && dropdown.style.display !== "";
  if (isOpen) {
    dropdown.style.display = "none";
    if (arrowImg) arrowImg.style.transform = "rotate(0deg)";
  } else {
    dropdown.style.display = "block";
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
      listEl.innerHTML = `<div style="padding:8px 12px; color:#aaa; font-size:13px;">No projects yet</div>`;
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
                            <div class="project-progress-fill" style="width:0%; background:${color};"></div>
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");
  } catch (err) {
    if (listEl)
      listEl.innerHTML = `<div style="padding:8px 12px; color:#aaa; font-size:13px;">Failed to load</div>`;
  }
};

// Toggle notification icon on/off
window.toggleNotifications = function (btn) {
  const img = btn.querySelector(".notification-icon");
  if (img.src.includes("notification-on")) {
    img.src = "assets/icons/basil_notification-off-solid.svg";
    img.alt = "Notifications off";
  } else {
    img.src = "assets/icons/basil_notification-on-solid.svg";
    img.alt = "Notifications on";
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
        document
          .querySelectorAll(".nav-item")
          .forEach((n) => n.classList.remove("active"));
        item.classList.add("active");
        router.navigate(route);
      });
    });
}

window.createLayout = createLayout;
window.attachNavigationListeners = attachNavigationListeners;
window.createSidebar = createSidebar;
