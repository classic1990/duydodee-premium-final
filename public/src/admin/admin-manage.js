import { db, collection, getDocs } from '../../services/firebase.js';

async function initAdminDashboard() {
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const moviesSnap = await getDocs(collection(db, 'movies'));
        
        document.getElementById('user-count').textContent = usersSnap.size;
        document.getElementById('stat-content').textContent = moviesSnap.size;
        // Further implementation for charts and asset grid goes here
    } catch (err) {
        console.error('Admin Dashboard Error:', err);
    }
}

document.addEventListener('DOMContentLoaded', initAdminDashboard);
