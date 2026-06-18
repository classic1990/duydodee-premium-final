import {
    auth,
    db,
    collection,
    getDocs,
    query,
    orderBy,
    SCHEMA,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc,
    onSnapshot,
    where,
    updateDoc,
    serverTimestamp,
    getWatchHistory
} from '../../services/firebase.js';
import { UI } from '../../components/ui.js';
import { AuthService } from '../../services/auth-service.js';
import { RecommendationService } from '../../services/recommendation-service.js';
import { AnalyticsService } from '../../services/analytics-service.js';

/**
 * 👤 PROFILE ENGINE - Professional Member View
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.initNavbar();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadUserProfile(user);
            await loadBookmarks(user);
            await loadUserTickets(user);
            await loadWatchHistory(user);
            await loadRecommendations(user);
            await loadAnalytics(user);
        } else {
            window.location.href = '/login.html';
        }
    });
});

async function loadUserProfile(user) {
    const nameEl = document.getElementById('user-display-name');
    const emailEl = document.getElementById('user-email');
    const photoEl = document.getElementById('profile-pic');
    const logoutBtn = document.getElementById('logout-btn');

    if (!nameEl || !emailEl) {
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        nameEl.innerText = userData.displayName || user.displayName || 'MEMBER';
        emailEl.innerText = user.email.toLowerCase();
        if (photoEl && userData.photoURL) {
            photoEl.src = userData.photoURL.replace('s96-c', 's400-c');
        }

        // Check for admin/master role or specific email
        const role = (userData.role || '').toLowerCase();
        const isAdmin =
      ['super-admin', 'admin', 'master'].includes(role) ||
      user.email === 'duyclassic191@gmail.com';

        // Inject Admin link if user is admin
        const actionButtons = logoutBtn.parentElement;
        if (isAdmin && !document.getElementById('admin-btn')) {
            const adminLink = document.createElement('a');
            adminLink.id = 'admin-btn';
            adminLink.href = '/admin/admin-manage.html';
            adminLink.className =
        'px-5 py-2 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all Thai-font';
            adminLink.innerText = 'Admin Dashboard';
            actionButtons.insertBefore(adminLink, logoutBtn);
        }

        // Attach logout listener
        logoutBtn.onclick = () => {
            // eslint-disable-next-line no-alert
            if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
                signOut(auth)
                    .then(() => {
                        UI.showToast('คุณได้ออกจากระบบเรียบร้อยแล้ว', 'success');
                        window.location.href = '/login.html';
                    })
                    .catch((e) => UI.showToast('Error: ' + e.message, 'error'));
            }
        };

        UI.refreshIcons();
    } catch (error) {
        console.error('Profile Error:', error);
    }
}

async function loadBookmarks(user) {
    const grid = document.getElementById('bookmarks-grid');
    const section = document.getElementById('bookmarks-section');
    if (!grid || !section) {
        return;
    }

    try {
        const q = query(
            collection(db, SCHEMA.COLLECTIONS.USERS, user.uid, 'bookmarks'),
            orderBy('addedAt', 'desc')
        );
        const snap = await getDocs(q);

        if (snap.empty) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');
        grid.innerHTML = snap.docs
            .map((docSnap) =>
                UI.createMovieCard({ id: docSnap.id, ...docSnap.data() })
            )
            .join('');

        UI.refreshIcons();
    } catch (err) {
        console.error('Bookmarks Error:', err);
    }
}

async function loadUserTickets(user) {
    const grid = document.getElementById('user-tickets-grid');
    const section = document.getElementById('tickets-section');
    if (!grid || !section) {
        return;
    }

    const q = query(
        collection(db, SCHEMA.COLLECTIONS.TICKETS),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );

    const _unsubscribe = onSnapshot(q, (snap) => {
        if (snap.empty) {
            section.classList.add('hidden');
            return;
        }
        section.classList.remove('hidden');
        grid.innerHTML = snap.docs
            .map((docSnap) => {
                const t = docSnap.data();
                const dateStr =
          t.createdAt?.toDate().toLocaleDateString('th-TH') || 'N/A';
                const statusClass =
          t.status === 'open'
              ? 'text-red-500 border-red-500/20 bg-red-500/5'
              : t.status === 'resolved'
                  ? 'text-green-500 border-green-500/20 bg-green-500/5'
                  : 'text-blue-400 border-blue-500/20 bg-blue-500/5';

                const repliesHtml = (t.replies || [])
                    .map(
                        (r) => `
                <div class="mt-3 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10 space-y-1">
                    <p class="text-[8px] font-black text-brand-primary uppercase">Staff Reply:</p>
                    <p class="text-[10px] text-gray-300 Thai-font leading-relaxed">${UI.escapeHTML(r.message)}</p>
                </div>
            `
                    )
                    .join('');

                const resolveBtn =
          t.status !== 'resolved'
              ? `
                <button class="resolve-ticket-btn mt-4 w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase rounded-xl hover:bg-emerald-500 hover:text-black transition-all Thai-font" 
                        data-id="${docSnap.id}">
                    ทำเครื่องหมายว่าแก้ไขแล้ว
                </button>`
              : '';

                return `
                <div class="glass-premium p-6 border border-white/5 space-y-4 animate-fade-in">
                    <div class="flex justify-between items-start">
                        <span class="px-2 py-1 rounded-lg border text-[8px] font-black uppercase ${statusClass}">${t.status}</span>
                        <span class="text-[9px] text-gray-600 font-bold uppercase">${dateStr}</span>
                    </div>
                    <div>
                        <h3 class="text-sm font-black text-white Thai-font">${UI.escapeHTML(t.subject)}</h3>
                        <p class="text-[11px] text-gray-500 Thai-font mt-1 line-clamp-2">${UI.escapeHTML(t.message)}</p>
                    </div>
                    ${repliesHtml}
                    ${resolveBtn}
                </div>`;
            })
            .join('');

        // Attach click events for Resolve buttons
        grid.querySelectorAll('.resolve-ticket-btn').forEach((btn) => {
            btn.onclick = async () => {
                // eslint-disable-next-line no-alert
                if (!confirm('ยืนยันว่าปัญหาได้รับการแก้ไขเรียบร้อยแล้ว?')) {
                    return;
                }

                UI.setLoading(true);
                try {
                    await updateDoc(doc(db, SCHEMA.COLLECTIONS.TICKETS, btn.dataset.id), {
                        status: 'resolved',
                        updatedAt: serverTimestamp()
                    });
                    UI.showToast(
                        'ปิดรายการแจ้งปัญหาเรียบร้อยแล้ว ขอบคุณที่ใช้บริการครับ',
                        'success'
                    );
                } catch (err) {
                    console.error(err);
                    UI.showToast('เกิดข้อผิดพลาดในการปิดงาน', 'error');
                } finally {
                    UI.setLoading(false);
                }
            };
        });

        UI.refreshIcons();
    }, (error) => {
        console.error('Tickets snapshot error:', error);
        section.classList.add('hidden');
    });
}

async function loadWatchHistory(user) {
    const grid = document.getElementById('history-grid');
    if (!grid) {
        return;
    }

    // Add "View All" link
    const titleSection = document.querySelector('h2')?.parentElement;
    if (titleSection && !document.getElementById('view-all-history')) {
        const viewAll = document.createElement('a');
        viewAll.id = 'view-all-history';
        viewAll.href = '/history.html';
        viewAll.className = 'text-[9px] text-brand-primary uppercase hover:underline ml-auto';
        viewAll.innerText = 'ดูทั้งหมด';
        titleSection.appendChild(viewAll);
    }

    try {
        const history = await getWatchHistory(user.uid, 20);

        if (history.length === 0) {
            UI.renderEmptyState(grid, 'คุณยังไม่มีประวัติการรับชม');
            return;
        }

        // Render using createHistoryCard (Landscape format)
        grid.innerHTML = history.map(item => UI.createHistoryCard(item)).join('');
        UI.refreshIcons();
    } catch (err) {
        console.error('History Error:', err);
        UI.renderEmptyState(grid, 'ไม่สามารถโหลดประวัติได้');
    }

    // Setup Clear History Button
    const clearBtn = document.getElementById('clear-history-btn');
    if (clearBtn) {
        clearBtn.onclick = async () => {
            // eslint-disable-next-line no-alert
            if (!confirm('คุณต้องการลบประวัติการรับชมทั้งหมดใช่หรือไม่?')) {
                return;
            }
            UI.setLoading(true);
            try {
                await AuthService.clearWatchHistory(user.uid);
                UI.showToast('ล้างประวัติการรับชมเรียบร้อยแล้ว', 'success');
                grid.innerHTML = '';
                UI.renderEmptyState(grid, 'คุณยังไม่มีประวัติการรับชม');
            } catch (error) {
                UI.showToast('เกิดข้อผิดพลาดในการลบประวัติ', 'error');
            } finally {
                UI.setLoading(false);
            }
        };
    }
}

/**
 * 🎯 Load Personalized Recommendations
 */
async function loadRecommendations(user) {
    const section = document.getElementById('recommendations-section');
    const grid = document.getElementById('recommendations-grid');
    if (!grid) {
        return;
    }

    try {
        const recommendations = await RecommendationService.getRecommendations(user.uid, {
            limitCount: 6,
            includeWatched: false
        });

        if (recommendations.length > 0) {
            section.classList.remove('hidden');
            grid.innerHTML = recommendations.map(item => UI.createMovieCard(item)).join('');
            UI.refreshIcons();
        } else {
            // Show empty state
            section.classList.remove('hidden');
            UI.renderEmptyState(grid, 'ยังไม่มีคำแนะนำส่วนบุคคล');
            UI.refreshIcons();
        }
    } catch (error) {
        console.error('Recommendations Error:', error);
        // Show empty state on error
        section.classList.remove('hidden');
        UI.renderEmptyState(grid, 'ไม่สามารถโหลดคำแนะนำได้');
        UI.refreshIcons();
    }
}

/**
 * 📊 Load Viewing Analytics
 */
async function loadAnalytics(user) {
    const section = document.getElementById('analytics-section');
    if (!section) {
        return;
    }

    try {
        const analytics = await AnalyticsService.getUserAnalytics(user.uid);

        // Show section if there's any data
        if (analytics.totalContentWatched > 0) {
            section.classList.remove('hidden');

            // Update stats overview
            document.getElementById('stat-total-time').textContent = analytics.totalWatchTime.formatted;
            document.getElementById('stat-total-content').textContent = analytics.totalContentWatched;
            document.getElementById('stat-completed').textContent = analytics.completedContent;
            document.getElementById('stat-avg-completion').textContent = analytics.averageCompletionRate + '%';

            // Render category breakdown
            renderCategoryBreakdown(analytics.categoryBreakdown);

            // Render viewing patterns
            renderViewingPatterns(analytics.viewingPatterns);

            // Render top content
            renderTopContent(analytics.topContent);

            UI.refreshIcons();
        }
    } catch (error) {
        console.error('Analytics Error:', error);
    }
}

/**
 * Render category breakdown with progress bars
 */
function renderCategoryBreakdown(categories) {
    const container = document.getElementById('category-breakdown');
    if (!container) {
        return;
    }

    if (categories.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm Thai-font">ยังไม่มีข้อมูล</p>';
        return;
    }

    container.innerHTML = categories.map(cat => `
        <div class="space-y-1">
            <div class="flex justify-between items-center text-xs">
                <span class="text-white font-medium Thai-font">${UI.escapeHTML(cat.name)}</span>
                <span class="text-gray-500">${cat.count} เรื่อง (${cat.percentage}%)</span>
            </div>
            <div class="h-2 bg-white/5 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500" style="width: ${cat.percentage}%"></div>
            </div>
        </div>
    `).join('');
}

/**
 * Render viewing patterns with progress bars
 */
function renderViewingPatterns(patterns) {
    const container = document.getElementById('viewing-patterns');
    const peakTimeEl = document.getElementById('peak-time');
    if (!container || !peakTimeEl) {
        return;
    }

    const slots = patterns.slots || {};
    const slotEntries = Object.entries(slots);

    if (slotEntries.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm Thai-font">ยังไม่มีข้อมูล</p>';
        return;
    }

    // Find max count for scaling
    const maxCount = Math.max(...slotEntries.map(([_, data]) => data.count));

    container.innerHTML = slotEntries.map(([_key, data]) => {
        const width = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
        return `
            <div class="space-y-1">
                <div class="flex justify-between items-center text-xs">
                    <span class="text-white font-medium Thai-font">${data.label}</span>
                    <span class="text-gray-500">${data.count} ครั้ง (${data.percentage}%)</span>
                </div>
                <div class="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" style="width: ${width}%"></div>
                </div>
            </div>
        `;
    }).join('');

    // Update peak time
    if (patterns.peakTime) {
        peakTimeEl.textContent = patterns.peakTime.label;
    }
}

/**
 * Render top content cards
 */
function renderTopContent(topContent) {
    const container = document.getElementById('top-content');
    if (!container) {
        return;
    }

    if (topContent.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm Thai-font col-span-full">ยังไม่มีข้อมูล</p>';
        return;
    }

    container.innerHTML = topContent.map((item, index) => `
        <div class="group cursor-pointer animate-fade-in">
            <div class="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 bg-brand-obsidian">
                <img src="${item.poster || '/assets/logo/DUYDODEE.png'}" 
                     class="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" 
                     onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png'">
                <div class="absolute top-2 left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <span class="text-[10px] font-black text-black">${index + 1}</span>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p class="text-[9px] font-black text-white line-clamp-2 Thai-font">${UI.escapeHTML(item.title)}</p>
                </div>
            </div>
        </div>
    `).join('');
}
