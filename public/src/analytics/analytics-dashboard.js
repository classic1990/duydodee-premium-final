/**
 * 📊 DUYดูDEE Analytics Dashboard Component
 * หน้า dashboard สำหรับ analytics และ reporting
 */

export class AnalyticsDashboard {
    constructor(analytics) {
        this.analytics = analytics;
        this.charts = {};
        this.filters = {
            dateRange: '7d',
            eventType: 'all',
            userId: null
        };
    }

    /**
     * Initialize dashboard
     */
    async initialize(container) {
        this.container = container;
        await this.loadDashboardData();
        this.renderDashboard();
    }

    /**
     * Load analytics data from backend
     */
    async loadDashboardData() {
        try {
            const { db, collection, getDocs, query, _where, orderBy, limit } = await import('../services/firebase.js');

            // Load recent analytics events
            const q = query(
                collection(db, 'analytics_events'),
                orderBy('createdAt', 'desc'),
                limit(1000)
            );

            const snapshot = await getDocs(q);
            this.data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // console.log('Analytics data loaded:', this.data.length, 'events');
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            this.data = [];
        }
    }

    /**
     * Render dashboard
     */
    renderDashboard() {
        this.container.innerHTML = `
            <div class="analytics-dashboard">
                ${this.renderHeader()}
                ${this.renderFilters()}
                ${this.renderOverviewCards()}
                ${this.renderCharts()}
                ${this.renderDetailedTable()}
            </div>
        `;

        this.initializeCharts();
    }

    /**
     * Render dashboard header
     */
    renderHeader() {
        return `
            <div class="dashboard-header mb-8">
                <h1 class="text-3xl font-black text-white uppercase tracking-tighter">
                    📊 <span class="text-brand-primary">Analytics</span> Dashboard
                </h1>
                <p class="text-sm text-gray-500 mt-2">Real-time user behavior tracking and insights</p>
            </div>
        `;
    }

    /**
     * Render filters
     */
    renderFilters() {
        return `
            <div class="filters-section mb-6 flex gap-4 flex-wrap">
                <div class="filter-group">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Date Range</label>
                    <select id="date-range-filter" class="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary/50">
                        <option value="1d">Last 24 Hours</option>
                        <option value="7d" selected>Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Event Type</label>
                    <select id="event-type-filter" class="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary/50">
                        <option value="all" selected>All Events</option>
                        <option value="page_view">Page Views</option>
                        <option value="video_playback">Video Playback</option>
                        <option value="search">Search</option>
                        <option value="interaction">User Interactions</option>
                        <option value="conversion">Conversions</option>
                        <option value="error">Errors</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Export</label>
                    <button id="export-btn" class="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-4 py-2 rounded-lg hover:bg-brand-primary hover:text-black transition-all font-bold uppercase text-xs">
                        📥 Export Data
                    </button>
                </div>
                
                <div class="filter-group">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Refresh</label>
                    <button id="refresh-btn" class="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all font-bold uppercase text-xs">
                        🔄 Refresh
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render overview cards
     */
    renderOverviewCards() {
        const stats = this.calculateOverviewStats();

        return `
            <div class="overview-cards grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                ${this.createStatCard('Total Events', stats.totalEvents, 'activity', 'brand-primary')}
                ${this.createStatCard('Page Views', stats.pageViews, 'eye', 'blue-500')}
                ${this.createStatCard('Video Plays', stats.videoPlays, 'play-circle', 'purple-500')}
                ${this.createStatCard('Conversions', stats.conversions, 'trophy', 'brand-gold')}
            </div>
        `;
    }

    /**
     * Create individual stat card
     */
    createStatCard(title, value, icon, color) {
        return `
            <div class="stat-card bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 hover:border-${color}/30 transition-all">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center">
                        <i data-lucide="${icon}" class="w-6 h-6 text-${color}"></i>
                    </div>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">${title}</span>
                </div>
                <div class="text-4xl font-black text-white tracking-tighter italic">${value.toLocaleString()}</div>
            </div>
        `;
    }

    /**
     * Calculate overview statistics
     */
    calculateOverviewStats() {
        const filteredData = this.getFilteredData();

        return {
            totalEvents: filteredData.length,
            pageViews: filteredData.filter(e => e.eventName === 'page_view').length,
            videoPlays: filteredData.filter(e => e.eventName === 'video_playback' && e.properties.action === 'play').length,
            conversions: filteredData.filter(e => e.eventName === 'conversion').length
        };
    }

    /**
     * Render charts section
     */
    renderCharts() {
        return `
            <div class="charts-section grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                ${this.renderChartContainer('events-over-time', 'Events Over Time')}
                ${this.renderChartContainer('event-distribution', 'Event Distribution')}
                ${this.renderChartContainer('user-activity', 'User Activity Heatmap')}
                ${this.renderChartContainer('performance-metrics', 'Performance Metrics')}
            </div>
        `;
    }

    /**
     * Render individual chart container
     */
    renderChartContainer(chartId, title) {
        return `
            <div class="chart-container bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/5 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-white mb-4">${title}</h3>
                <div class="chart-wrapper h-64">
                    <canvas id="${chartId}"></canvas>
                </div>
            </div>
        `;
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        // Chart.js would be loaded here
        // For now, this is a placeholder
        // console.log('Charts initialized');
    }

    /**
     * Render detailed data table
     */
    renderDetailedTable() {
        const filteredData = this.getFilteredData().slice(0, 50); // Limit to 50 rows

        return `
            <div class="detailed-table bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/5 rounded-2xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-white">Recent Events</h3>
                    <span class="text-xs text-gray-500">Showing ${filteredData.length} events</span>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-white/5">
                                <th class="text-left p-3 text-xs font-bold text-gray-500 uppercase">Event</th>
                                <th class="text-left p-3 text-xs font-bold text-gray-500 uppercase">User</th>
                                <th class="text-left p-3 text-xs font-bold text-gray-500 uppercase">Page</th>
                                <th class="text-left p-3 text-xs font-bold text-gray-500 uppercase">Time</th>
                                <th class="text-left p-3 text-xs font-bold text-gray-500 uppercase">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredData.map(event => this.renderTableRow(event)).join('')}
                        </tbody>
                    </table>
                </div>
                
                ${filteredData.length === 0 ? `
                    <div class="text-center py-8 text-gray-500">
                        <p>No events found for selected filters</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render table row
     */
    renderTableRow(event) {
        const properties = event.properties || {};
        const details = Object.keys(properties)
            .filter(key => !['url', 'userAgent', 'screen', 'language'].includes(key))
            .slice(0, 3)
            .map(key => `${key}: ${properties[key]}`)
            .join(', ');

        return `
            <tr class="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td class="p-3">
                    <span class="px-2 py-1 rounded text-[10px] font-bold uppercase bg-brand-primary/10 text-brand-primary">
                        ${event.eventName}
                    </span>
                </td>
                <td class="p-3 text-sm text-gray-400">${this.maskUserId(event.userId)}</td>
                <td class="p-3 text-sm text-gray-400">${properties.path || '-'}</td>
                <td class="p-3 text-sm text-gray-400">${this.formatTimestamp(event.createdAt)}</td>
                <td class="p-3 text-sm text-gray-500 max-w-xs truncate">${details || '-'}</td>
            </tr>
        `;
    }

    /**
     * Get filtered data based on current filters
     */
    getFilteredData() {
        let filtered = this.data;

        // Filter by date range
        if (this.filters.dateRange !== 'custom') {
            const daysMap = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
            const days = daysMap[this.filters.dateRange] || 7;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            filtered = filtered.filter(event => {
                const eventDate = new Date(event.createdAt);
                return eventDate >= cutoffDate;
            });
        }

        // Filter by event type
        if (this.filters.eventType !== 'all') {
            filtered = filtered.filter(event => event.eventName === this.filters.eventType);
        }

        // Filter by user ID
        if (this.filters.userId) {
            filtered = filtered.filter(event => event.userId === this.filters.userId);
        }

        return filtered;
    }

    /**
     * Mask user ID for privacy
     */
    maskUserId(userId) {
        if (!userId) {
            return 'Anonymous';
        }
        return userId.substring(0, 8) + '...';
    }

    /**
     * Format timestamp
     */
    formatTimestamp(timestamp) {
        if (!timestamp) {
            return '-';
        }
        const date = new Date(timestamp);
        return date.toLocaleString('th-TH', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Refresh dashboard data
     */
    async refresh() {
        await this.loadDashboardData();
        this.renderDashboard();
    }

    /**
     * Export analytics data
     */
    exportData(format = 'json') {
        const data = this.analytics.exportAnalytics(format);

        const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_export_${Date.now()}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const dateRangeFilter = document.getElementById('date-range-filter');
        const eventTypeFilter = document.getElementById('event-type-filter');
        const exportBtn = document.getElementById('export-btn');
        const refreshBtn = document.getElementById('refresh-btn');

        if (dateRangeFilter) {
            dateRangeFilter.addEventListener('change', (e) => {
                this.filters.dateRange = e.target.value;
                this.renderDashboard();
            });
        }

        if (eventTypeFilter) {
            eventTypeFilter.addEventListener('change', (e) => {
                this.filters.eventType = e.target.value;
                this.renderDashboard();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData('json');
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    }
}

export default AnalyticsDashboard;
