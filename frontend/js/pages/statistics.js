/**
 * Statistics Page
 * From statistics.js — includes multi-color pie chart using goal colors
 */

// ============================================
// STATS API SERVICE
// ============================================

const statsService = {
    async fetchOverallStats() {
        return await api.get('/stats/overall');
    },
    async fetchBreakdown(type) {
        if (!type || type === 'all') {
            return await api.get('/stats/overall');
        }
        return await api.get(`/stats/overall-by-type?type=${encodeURIComponent(type)}`);
    }
};


// ============================================
// CHART UTILITIES
// ============================================

function renderBarChart(canvasId, data, labels) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data || !labels || data.length === 0) return;

    const ctx     = canvas.getContext('2d');
    const width   = canvas.width  = canvas.offsetWidth  * 2;
    const height  = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const padding     = 40;
    const chartWidth  = width  / 2 - padding * 2;
    const chartHeight = height / 2 - padding * 2;
    const barWidth    = chartWidth / data.length;
    const maxValue    = Math.max(...data, 1);

    ctx.clearRect(0, 0, width, height);

    data.forEach((value, index) => {
        const barH = (value / maxValue) * chartHeight;
        const x    = padding + index * barWidth + barWidth * 0.2;
        const y    = padding + chartHeight - barH;
        const w    = barWidth * 0.6;

        ctx.fillStyle = '#00BCD4';
        ctx.fillRect(x, y, w, barH);

        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + w / 2, padding + chartHeight + 20);

        if (value > 0) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(_fmtHours(value), x + w / 2, y - 5);
        }
    });

    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();

    ctx.fillStyle = '#999';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const yPos = padding + chartHeight - (chartHeight / 4) * i;
        const val  = (maxValue / 4) * i;
        ctx.fillText(_fmtHours(val), padding - 10, yPos + 4);
        ctx.strokeStyle = '#F0F0F0';
        ctx.beginPath();
        ctx.moveTo(padding, yPos);
        ctx.lineTo(padding + chartWidth, yPos);
        ctx.stroke();
    }
}

/**
 * Multi-color donut chart.
 * segments: [{ color, percentage, timeSpent }]
 */
function renderPieChart(canvasId, segments) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const size   = Math.min(canvas.offsetWidth || 200, canvas.offsetHeight || 200);
    canvas.width  = size * 2;
    canvas.height = size * 2;

    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    const cx        = size / 2;
    const cy        = size / 2;
    const radius    = size / 2 - 18;
    const lineWidth = 20;

    ctx.clearRect(0, 0, size, size);

    // Background ring
    ctx.strokeStyle = '#E8E8E8';
    ctx.lineWidth   = lineWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();

    if (!segments || segments.length === 0) {
        // Center label
        ctx.fillStyle = '#aaa';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No data', cx, cy);
        return;
    }

    // Draw colored segments
    let startAngle = -Math.PI / 2;
    segments.forEach(seg => {
        const angle = ((seg.percentage || 0) / 100) * 2 * Math.PI;
        if (angle <= 0) return;
        ctx.strokeStyle = seg.color || '#00BCD4';
        ctx.lineWidth   = lineWidth;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
        ctx.stroke();
        startAngle += angle;
    });

    // Center total time text
    const totalSecs = segments.reduce((s, seg) => s + (seg.timeSpent || 0), 0);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(_fmtTime(totalSecs), cx, cy);
}

function _fmtHours(seconds) {
    if (!seconds) return '0h';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h${m > 0 ? ' ' + m + 'm' : ''}` : `${m}m`;
}

function _fmtTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}


// ============================================
// STATISTICS PAGE HTML
// ============================================

function createStatisticsPageHTML() {
    return `
        <div id="statisticsContainer" class="statistics-content">
            <div style="text-align:center;padding:60px 0;">
                <div class="spinner-large"></div>
                <p style="margin-top:16px;color:#999;">Loading statistics...</p>
            </div>
        </div>
    `;
}

function createStatisticsContentHTML(insightsData, breakdownData) {
    return `
        <div class="stats-cards">
            <div class="stat-card-large">
                <h3>Insights</h3>
                <div class="insights-tabs">
                    <button class="tab-btn" onclick="changeInsightsPeriod('day')">Day</button>
                    <button class="tab-btn active" onclick="changeInsightsPeriod('week')">Week</button>
                    <button class="tab-btn" onclick="changeInsightsPeriod('month')">Month</button>
                </div>
                <p class="stat-date" id="insightsDateRange">${insightsData.dateRange || 'All time'}</p>
                <div class="stat-summary">
                    <div>
                        <span class="stat-label">Total</span>
                        <span class="stat-value" id="insightsTotal">${_fmtTime(insightsData.total || 0)}</span>
                    </div>
                    <div>
                        <span class="stat-label">Average</span>
                        <span class="stat-value" id="insightsAverage">${_fmtTime(insightsData.average || 0)}</span>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="insightsBarChart" style="width:100%;height:200px;"></canvas>
                </div>
            </div>

            <div class="stat-card-large">
                <h3>Breakdown</h3>
                <div class="insights-tabs">
                    <button class="tab-btn active" onclick="changeBreakdownPeriod('all')">All</button>
                    <button class="tab-btn" onclick="changeBreakdownPeriod('One Time')">One Time</button>
                    <button class="tab-btn" onclick="changeBreakdownPeriod('Repeating')">Repeating</button>
                </div>
                <p class="stat-date" id="breakdownDate">${breakdownData.date || ''}</p>
                <div class="circular-chart">
                    <canvas id="breakdownPieChart" style="width:200px;height:200px;"></canvas>
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
        return '<p class="empty-message" style="color:#aaa;text-align:center;">No project data available</p>';
    }
    const fallbackColors = ['#4CAF50', '#00BCD4', '#9C27B0', '#FF9800', '#F44336'];
    return projects.map((project, index) => {
        const color = project.color || fallbackColors[index % fallbackColors.length];
        return `
            <div class="breakdown-item">
                <span class="breakdown-color" style="background:${color};"></span>
                <span class="breakdown-name">${project.name || `Project ${index + 1}`}</span>
                <div class="breakdown-bar-container">
                    <div class="breakdown-bar" style="width:${project.percentage || 0}%;background:${color};"></div>
                </div>
                <span class="breakdown-value">${_fmtTime(project.timeSpent || 0)}</span>
            </div>
        `;
    }).join('');
}


// ============================================
// DATA TRANSFORM
// ============================================

/**
 * Transform OverallOut {total_stats: {goal_name: minutes}} using goal colors.
 * colorMap: { goalName: color }
 */
function _transformOverallOut(apiResponse, colorMap) {
    const totalStats  = (apiResponse && apiResponse.total_stats) || {};
    const entries     = Object.entries(totalStats);
    const totalMin    = entries.reduce((s, [, m]) => s + m, 0);
    const totalSecs   = totalMin * 60;
    const avgSecs     = entries.length > 0 ? Math.round(totalSecs / 7) : 0;

    const projects = entries.map(([name, minutes]) => ({
        name,
        timeSpent:  minutes * 60,
        percentage: totalMin > 0 ? Math.round((minutes / totalMin) * 100) : 0,
        color:      (colorMap && colorMap[name]) || null,
    }));

    return { totalSecs, avgSecs, projects };
}


// ============================================
// PAGE CONTROLLER
// ============================================

let _currentInsightsPeriod  = 'week';
let _currentBreakdownPeriod = 'all';

async function loadStatisticsPage() {
    const container = document.getElementById('statisticsContainer');
    if (!container) return;

    try {
        // Fetch stats + all goals (for colors)
        const [overallRaw, breakdownRaw, allGoals] = await Promise.all([
            statsService.fetchOverallStats().catch(() => null),
            statsService.fetchBreakdown(_currentBreakdownPeriod).catch(() => null),
            goalsService.fetchGoals().catch(() => []),
        ]);

        // Build name → color map from goals + localStorage
        const storedColors = JSON.parse(localStorage.getItem('goalColors') || '{}');
        const colorMap = {};
        (allGoals || []).forEach(g => {
            const c = g.color || storedColors[g.id] || storedColors[g.title] || null;
            if (c) colorMap[g.title] = c;
        });
        // Also pull from storedColors directly (name keys)
        Object.assign(colorMap, storedColors);

        const overall   = _transformOverallOut(overallRaw,   colorMap);
        const breakdown = _transformOverallOut(breakdownRaw, colorMap);

        const safeInsights = {
            total:     overall.totalSecs,
            average:   overall.avgSecs,
            dateRange: 'All time',
            chartData: [0, 0, 0, 0, 0, 0, 0],
            labels:    ['S', 'M', 'T', 'W', 'Th', 'F', 'S'],
        };
        const safeBreakdown = {
            date:     _currentBreakdownPeriod,
            total:    breakdown.totalSecs,
            projects: breakdown.projects,
        };

        container.innerHTML = createStatisticsContentHTML(safeInsights, safeBreakdown);

        setTimeout(() => {
            renderBarChart('insightsBarChart', safeInsights.chartData, safeInsights.labels);
            renderPieChart('breakdownPieChart', safeBreakdown.projects);
        }, 150);

    } catch (err) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px 0;">
                <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                <h2>Failed to load statistics</h2>
                <p style="color:#999;">${err.message || 'Something went wrong'}</p>
                <button onclick="loadStatisticsPage()" class="btn-primary" style="margin-top:16px;">Try Again</button>
            </div>
        `;
    }
}

window.changeInsightsPeriod = async function(period) {
    _currentInsightsPeriod = period;
    document.querySelectorAll('.stat-card-large:first-child .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === period);
    });
    await loadStatisticsPage();
};

window.changeBreakdownPeriod = async function(period) {
    _currentBreakdownPeriod = period;
    document.querySelectorAll('.stat-card-large:last-child .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === period || (period === 'all' && btn.textContent === 'All'));
    });
    await loadStatisticsPage();
};

function renderStatisticsPage() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = createLayout(createStatisticsPageHTML(), '/statistics');
    attachNavigationListeners();
    loadStatisticsPage();
}

window.renderStatistics  = renderStatisticsPage;
window.statsService      = statsService;
window.loadStatisticsPage = loadStatisticsPage;
