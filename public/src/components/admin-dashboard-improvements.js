/**
 * 🎨 DUYดูDEE Admin Dashboard UI/UX Improvements
 * การปรับปรุงหน้าตาแอดมินให้สวยงามและใช้งานง่ายขึ้น
 */

/**
 * Improved Loading Animation
 */
export function createImprovedLoadingAnimation() {
    return `
        <div class="fixed inset-0 bg-brand-black z-[9999] flex items-center justify-center">
            <div class="relative">
                <!-- Glowing Background -->
                <div class="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full animate-pulse"></div>
                
                <!-- Loading Spinner -->
                <div class="relative w-24 h-24">
                    <div class="absolute inset-0 border-4 border-brand-primary/30 rounded-full"></div>
                    <div class="absolute inset-0 border-4 border-transparent border-t-brand-primary rounded-full animate-spin"></div>
                    <div class="absolute inset-2 border-4 border-transparent border-t-brand-gold rounded-full animate-spin animation-delay-150"></div>
                </div>
                
                <!-- Loading Text -->
                <div class="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <p class="text-brand-primary text-sm font-black tracking-widest animate-pulse">
                        LOADING SYSTEM
                    </p>
                    <div class="flex gap-1 mt-2 justify-center">
                        <div class="w-1 h-1 bg-brand-gold rounded-full animate-bounce animation-delay-0"></div>
                        <div class="w-1 h-1 bg-brand-gold rounded-full animate-bounce animation-delay-100"></div>
                        <div class="w-1 h-1 bg-brand-gold rounded-full animate-bounce animation-delay-200"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Enhanced Stat Card with Hover Effects
 */
export function createEnhancedStatCard(icon, label, value, color, trend = null) {
    const trendHTML = trend ? `
        <div class="flex items-center gap-1 mt-2">
            <i data-lucide="${trend.direction === 'up' ? 'trending-up' : 'trending-down'}" 
               class="w-3 h-3 ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}"></i>
            <span class="text-[9px] font-bold ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}">
                ${trend.value}%
            </span>
        </div>
    ` : '';

    return `
        <div class="group relative overflow-hidden bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 hover:border-${color}/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-${color}/20 hover:shadow-2xl">
            <!-- Glow Effect -->
            <div class="absolute inset-0 bg-${color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="absolute top-0 right-0 w-32 h-32 bg-${color}/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            
            <!-- Content -->
            <div class="relative z-10">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-14 h-14 rounded-2xl bg-${color}/10 border border-${color}/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-${color}/20 transition-all duration-500">
                        <i data-lucide="${icon}" class="w-7 h-7 text-${color}"></i>
                    </div>
                    <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                
                <div class="space-y-1">
                    <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">${label}</p>
                    <p class="text-4xl font-black text-white tracking-tighter italic group-hover:text-${color} transition-colors duration-300">
                        ${value}
                    </p>
                    ${trendHTML}
                </div>
            </div>
            
            <!-- Accent Border -->
            <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    `;
}

/**
 * Interactive Data Table with Sort and Filter
 */
export function createInteractiveTable(headers, data, options = {}) {
    const {
        sortable = true,
        filterable = true,
        selectable = false,
        pageSize = 10
    } = options;

    return `
        <div class="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden">
            <!-- Table Header with Controls -->
            <div class="p-6 border-b border-white/5">
                <div class="flex items-center justify-between gap-4">
                    ${filterable ? `
                        <div class="relative flex-1">
                            <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"></i>
                            <input type="text" 
                                   placeholder="Search..." 
                                   class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 outline-none focus:border-brand-primary/50 transition-all text-sm">
                        </div>
                    ` : ''}
                    <div class="flex gap-2">
                        ${sortable ? `
                            <button class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all text-xs font-bold uppercase">
                                <i data-lucide="arrow-up-down" class="w-4 h-4 inline mr-1"></i> Sort
                            </button>
                        ` : ''}
                        <button class="px-4 py-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-black transition-all text-xs font-bold uppercase">
                            <i data-lucide="filter" class="w-4 h-4 inline mr-1"></i> Filter
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Table Body -->
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-white/[0.02] border-b border-white/5">
                            ${selectable ? `
                                <th class="p-4 w-10">
                                    <input type="checkbox" class="w-4 h-4 rounded bg-black/40 border-white/20 text-brand-primary focus:ring-brand-primary">
                                </th>
                            ` : ''}
                            ${headers.map(header => `
                                <th class="p-4 text-left text-[9px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                                    ${header.label}
                                    ${sortable ? `
                                        <i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>
                                    ` : ''}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/[0.03]">
                        ${data.map((row, index) => `
                            <tr class="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                ${selectable ? `
                                    <td class="p-4">
                                        <input type="checkbox" class="w-4 h-4 rounded bg-black/40 border-white/20 text-brand-primary focus:ring-brand-primary">
                                    </td>
                                ` : ''}
                                ${headers.map(header => `
                                    <td class="p-4">
                                        <div class="text-sm text-white group-hover:text-brand-primary transition-colors">
                                            ${row[header.key] || '-'}
                                        </div>
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Pagination -->
            <div class="p-4 border-t border-white/5 flex items-center justify-between">
                <p class="text-xs text-gray-500">
                    Showing 1-${Math.min(pageSize, data.length)} of ${data.length} results
                </p>
                <div class="flex gap-2">
                    <button class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all text-xs">
                        <i data-lucide="chevron-left" class="w-4 h-4"></i>
                    </button>
                    <button class="px-3 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-black transition-all text-xs font-bold">
                        1
                    </button>
                    <button class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all text-xs">
                        <i data-lucide="chevron-right" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Enhanced Notification System
 */
export function createNotificationSystem() {
    return `
        <div id="notification-container" class="fixed top-4 right-4 z-[10000] space-y-2">
            <!-- Notifications will be dynamically added here -->
        </div>
    `;
}

export function showNotification(type, message, duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const colors = {
        success: 'bg-green-500/10 border-green-500/20 text-green-500',
        error: 'bg-red-500/10 border-red-500/20 text-red-500',
        warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-500'
    };

    const icons = {
        success: 'check-circle',
        error: 'alert-circle',
        warning: 'alert-triangle',
        info: 'info'
    };

    const notification = document.createElement('div');
    notification.className = `flex items-center gap-3 p-4 rounded-xl ${colors[type]} border backdrop-blur-xl shadow-lg transform translate-x-full transition-transform duration-500`;
    notification.innerHTML = `
        <i data-lucide="${icons[type]}" class="w-5 h-5"></i>
        <p class="text-sm font-medium text-white">${message}</p>
        <button onclick="this.parentElement.remove()" class="ml-4 hover:opacity-70 transition-opacity">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Auto-remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 500);
    }, duration);

    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Improved Search Component with Real-time Results
 */
export function createEnhancedSearch(placeholder = 'Search...', options = {}) {
    const {
        icon = 'search',
        className = '',
        onSearch = null
    } = options;

    return `
        <div class="relative ${className}">
            <i data-lucide="${icon}" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"></i>
            <input type="text" 
                   placeholder="${placeholder}" 
                   class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 outline-none focus:border-brand-primary/50 focus:bg-black/60 transition-all text-sm"
                   ${onSearch ? `oninput="${onSearch}"` : ''}>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span class="text-[9px] text-gray-600 hidden md:inline">CTRL+K</span>
                <div class="w-px h-4 bg-white/10 hidden md:block"></div>
                <button class="p-1 hover:text-brand-primary transition-colors">
                    <i data-lucide="sliders-horizontal" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Enhanced Profile Dropdown
 */
export function createProfileDropdown(user) {
    return `
        <div class="relative group">
            <button class="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-primary/30 hover:bg-white/10 transition-all">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-gold flex items-center justify-center">
                    <span class="text-white font-black text-lg">${user.displayName?.charAt(0) || 'U'}</span>
                </div>
                <div class="hidden md:block text-left">
                    <p class="text-sm font-bold text-white">${user.displayName || 'User'}</p>
                    <p class="text-[10px] text-gray-500">${user.email || 'user@example.com'}</p>
                </div>
                <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500 group-hover:text-white transition-colors hidden md:block"></i>
            </button>
            
            <!-- Dropdown Menu -->
            <div class="absolute right-0 mt-2 w-64 bg-[#0a0a0c]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div class="p-4 border-b border-white/5">
                    <p class="text-sm font-bold text-white">${user.displayName || 'User'}</p>
                    <p class="text-xs text-gray-500">${user.email || 'user@example.com'}</p>
                </div>
                <div class="p-2">
                    <a href="/profile.html" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-400 hover:text-white">
                        <i data-lucide="user" class="w-4 h-4"></i> Profile
                    </a>
                    <a href="/watchlist.html" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-400 hover:text-white">
                        <i data-lucide="bookmark" class="w-4 h-4"></i> Watchlist
                    </a>
                    <a href="/history.html" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-400 hover:text-white">
                        <i data-lucide="history" class="w-4 h-4"></i> History
                    </a>
                </div>
                <div class="p-2 border-t border-white/5">
                    <button onclick="AuthService.logout()" class="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-sm text-gray-400 w-full text-left">
                        <i data-lucide="log-out" class="w-4 h-4"></i> Logout
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Enhanced Progress Bar
 */
export function createProgressBar(progress, color = 'brand-primary', label = null) {
    return `
        <div class="space-y-2">
            ${label ? `<p class="text-xs font-bold text-gray-500 uppercase tracking-widest">${label}</p>` : ''}
            <div class="relative h-2 bg-black/40 rounded-full overflow-hidden">
                <div class="absolute inset-0 bg-${color} rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
            <p class="text-right text-[10px] font-bold text-${color}">${progress}%</p>
        </div>
    `;
}

export default {
    createImprovedLoadingAnimation,
    createEnhancedStatCard,
    createInteractiveTable,
    createNotificationSystem,
    showNotification,
    createEnhancedSearch,
    createProfileDropdown,
    createProgressBar
};