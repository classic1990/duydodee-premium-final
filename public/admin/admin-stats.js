import { db, collection, getDocs, getCountFromServer, SCHEMA, query, where } from '../../services/firebase.js';
import { UI } from '../../components/ui.js';

let dailyChartInstance = null;
let lastStatsData = []; 

document.addEventListener('DOMContentLoaded', async () => {
    UI.initAdminSidebar();
    UI.setLoading(true);

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const startInput = document.getElementById('date-start');
    const endInput = document.getElementById('date-end');
    
    if (startInput) startInput.value = start.toISOString().split('T')[0];
    if (endInput) endInput.value = end.toISOString().split('T')[0];

    await renderCharts();
    await renderPeriodStats();

    const filterBtn = document.getElementById('filter-date-btn');
    if (filterBtn) {
        filterBtn.onclick = async () => {
            UI.setLoading(true);
            await renderPeriodStats();
            UI.setLoading(false);
        };
    }
    UI.setLoading(false);
});

// ... (Logic เดิมจาก stats.js ถูกย้ายมาที่นี่ทั้งหมด)