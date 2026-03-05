/**
 * Overall Statistics Component
 * Issue #60 - Statistics page, API integration, Charts rendering
 */

// ============================================
// STATISTICS API SERVICE - Issue #85
// ============================================

const statsService = {
    // Fetch overall statistics
    async fetchOverallStats() {
        try {
            const stats = await api.get('/stats/overall');
            return stats;
        } catch (err) {
            console.error('Failed to fetch overall stats:', err);
            throw err;
        }
    },

    // Fetch breakdown statistics by goal type
    async fetchBreakdown(type) {
        try {
            const breakdown = await api.get(`/stats/overall-by-type?type=${type}`);
            return breakdown;
        } catch (err) {
            console.error('Failed to fetch breakdown:', err);
            throw err;
        }
    }
};


// ============================================
// CHART UTILITIES - Issue #86
// ============================================

// Bar Chart Renderer
function renderBarChart(canvasId, data, labels) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data || !labels || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2; // Retina
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const padding = 40;
    const chartWidth = width / 2 - padding * 2;
    const chartHeight = height / 2 - padding * 2;
    const barWidth = chartWidth / data.length;
    const maxValue = Math.max(...data, 1);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw bars
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * barWidth + barWidth * 0.2;
        const y = padding + chartHeight - barHeight;
        const width = barWidth * 0.6;

        // Bar
        ctx.fillStyle = '#00BCD4';
        ctx.fillRect(x, y, width, barHeight);

        // Label
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + width / 2, padding + chartHeight + 20);

        // Value on top
        if (value > 0) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(formatHours(value), x + width / 2, y - 5);
        }
    });

    // Draw axes
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#999';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const y = padding + chartHeight - (chartHeight / 4) * i;
        const value = (maxValue / 4) * i;
        ctx.fillText(formatHours(value), padding - 10, y + 4);
        
        // Grid line
        ctx.strokeStyle = '#F0F0F0';
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
    }
}

// Circular Chart (Pie/Donut)
function renderCircularChart(canvasId, percentage, label) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || percentage == null) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const centerX = width / 4;
    const centerY = height / 4;
    const radius = Math.min(width, height) / 4 - 20;
    const lineWidth = 15;

    ctx.clearRect(0, 0, width, height);

    // Background circle
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Progress arc
    const angle = (percentage / 100) * 2 * Math.PI;
    ctx.strokeStyle = '#00BCD4';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + angle);
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, centerX, centerY);
}

// Format seconds to hours
function formatHours(seconds) {
    if (!seconds) return '0h';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`;
    }
    return `${minutes}m`;
}

// Format time for display
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}


// ============================================
// STATISTICS PAGE LAYOUT - Issue #84
// ============================================

function createStatisticsPageHTML() {
    return `
        <div class="page-header">
            <h1>Statistics</h1>
        </div>

        <div class="search-bar-full">
            <input type="text" class="search-input-pill" placeholder="Search projects...">
        </div>

        <div id="statisticsContainer" class="statistics-content">
            <div class="loading-state">
                <div class="spinner-large"></div>
                <p>Loading statistics...</p>
            </div>
        </div>
    `;
}

function createStatisticsContentHTML(insightsData, breakdownData) {
    return `
        <div class="stats-cards">
            <!-- Insights Card -->
            <div class="stat-card-large">
                <h3>Insights</h3>
                <div class="insights-tabs">
                    <button class="tab-btn" onclick="changeInsightsPeriod('day')">Day</button>
                    <button class="tab-btn active" onclick="changeInsightsPeriod('week')">Week</button>
                    <button class="tab-btn" onclick="changeInsightsPeriod('month')">Month</button>
                </div>
                <p class="stat-date" id="insightsDateRange">${insightsData.dateRange || 'Feb1 - Feb7, 2026'}</p>
                <div class="stat-summary">
                    <div>
                        <span class="stat-label">Total</span>
                        <span class="stat-value" id="insightsTotal">${formatTime(insightsData.total || 0)}</span>
                    </div>
                    <div>
                        <span class="stat-label">Average</span>
                        <span class="stat-value" id="insightsAverage">${formatTime(insightsData.average || 0)}</span>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="insightsBarChart" style="width: 100%; height: 200px;"></canvas>
                </div>
            </div>
            
            <!-- Breakdown Card -->
            <div class="stat-card-large">
                <h3>Breakdown</h3>
                <div class="insights-tabs">
                    <button class="tab-btn active" onclick="changeBreakdownPeriod('day')">Day</button>
                    <button class="tab-btn" onclick="changeBreakdownPeriod('week')">Week</button>
                    <button class="tab-btn" onclick="changeBreakdownPeriod('month')">Month</button>
                </div>
                <p class="stat-date" id="breakdownDate">${breakdownData.date || 'Feb 2, 2026'}</p>
                <div class="circular-chart">
                    <canvas id="breakdownCircularChart" style="width: 200px; height: 200px;"></canvas>
                </div>
                <div class="project-breakdown" id="projectBreakdown">
                    ${renderProjectBreakdown(breakdownData.projects || [])}
                </div>
            </div>
        </div>
    `;
}

function renderProjectBreakdown(projects) {
    if (!projects || projects.length === 0) {
        return '<p class="empty-message">No project data available</p>';
    }

    const colors = ['#4CAF50', '#9C27B0', '#CDDC39', '#FF9800', '#2196F3'];
    
    return projects.map((project, index) => {
        const color = colors[index % colors.length];
        return `
            <div class="breakdown-item">
                <span class="breakdown-color" style="background: ${color};"></span>
                <span class="breakdown-name">${project.name || `Project ${index + 1}`}</span>
                <div class="breakdown-bar-container">
                    <div class="breakdown-bar" style="width: ${project.percentage || 0}%; background: ${color};"></div>
                </div>
                <span class="breakdown-value">${formatTime(project.timeSpent || 0)}</span>
            </div>
        `;
    }).join('');
}


// ============================================
// STATISTICS PAGE CONTROLLER
// ============================================

let currentInsightsPeriod = 'week';
let currentBreakdownPeriod = 'day';

/**
 * Transform OverallOut {total_stats: {goal_name: minutes}} into display-ready shape.
 * formatTime/formatHours expect seconds, so multiply minutes by 60.
 */
function transformOverallOut(apiResponse) {
    const totalStats = (apiResponse && apiResponse.total_stats) || {};
    const entries = Object.entries(totalStats); // [[name, minutes], ...]
    const totalMinutes = entries.reduce((sum, [, m]) => sum + m, 0);
    const totalSeconds = totalMinutes * 60;
    const averageSeconds = entries.length > 0 ? Math.round(totalSeconds / 7) : 0;

    const projects = entries.map(([name, minutes]) => ({
        name,
        timeSpent: minutes * 60,
        percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
    }));

    return { totalSeconds, averageSeconds, projects };
}

async function loadStatisticsPage() {
    const container = document.getElementById('statisticsContainer');
    if (!container) return;

    try {
        // Fetch data
        const [overallRaw, breakdownRaw] = await Promise.all([
            statsService.fetchOverallStats().catch(() => null),
            statsService.fetchBreakdown(currentBreakdownPeriod).catch(() => null),
        ]);

        const overall = transformOverallOut(overallRaw);
        const breakdown = transformOverallOut(breakdownRaw);

        const safeInsights = {
            total: overall.totalSeconds,
            average: overall.averageSeconds,
            dateRange: 'All time',
            chartData: [0, 0, 0, 0, 0, 0, 0],
            labels: ['S', 'M', 'T', 'W', 'Th', 'F', 'S'],
        };
        const safeBreakdown = {
            date: currentBreakdownPeriod,
            total: breakdown.totalSeconds,
            projects: breakdown.projects,
        };

        // Render content
        container.innerHTML = createStatisticsContentHTML(safeInsights, safeBreakdown);

        // Render charts after DOM update
        setTimeout(() => {
            renderBarChart('insightsBarChart', safeInsights.chartData, safeInsights.labels);

            const totalTime = safeBreakdown.total;
            const percentage = totalTime > 0 ? Math.min(Math.round((totalTime / 86400) * 100), 100) : 0;
            renderCircularChart('breakdownCircularChart', percentage, formatTime(totalTime));
        }, 150);

    } catch (err) {
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h2>Failed to load statistics</h2>
                <p>${err.message || 'Something went wrong'}</p>
                <button onclick="loadStatisticsPage()" class="btn-primary">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Change periods
window.changeInsightsPeriod = async function(period) {
    currentInsightsPeriod = period;
    
    // Update active tab
    document.querySelectorAll('.stat-card-large:first-child .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === period) {
            btn.classList.add('active');
        }
    });
    
    await loadStatisticsPage();
};

window.changeBreakdownPeriod = async function(period) {
    currentBreakdownPeriod = period;
    
    // Update active tab
    document.querySelectorAll('.stat-card-large:last-child .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === period) {
            btn.classList.add('active');
        }
    });
    
    await loadStatisticsPage();
};


// ============================================
// UPDATED RENDER FUNCTION
// ============================================

function renderStatisticsPage() {
    const content = createStatisticsPageHTML();
    appContainer.innerHTML = createLayout(content, '/statistics');
    attachNavigationListeners();
    
    // Load statistics data
    loadStatisticsPage();
}


// Export
window.renderStatistics = renderStatisticsPage;
window.statsService = statsService;