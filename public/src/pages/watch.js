import { db, doc, getDoc, auth, onAuthStateChanged, saveWatchHistory } from '../services/firebase.js';
import { UI } from '../components/ui.js';

/**
 * 🎥 DUYดูDEE WATCH ENGINE - Player Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
    UI.initNavbar();
    UI.setLoading(true);

    // 1. ดึง ID จาก URL Parameters (?id=xxxx)
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id');
    const epIndex = parseInt(params.get('ep')) || 0;

    if (!contentId) {
        UI.showErrorPage('ไม่พบรหัสภาพยนตร์ที่ต้องการรับชม');
        UI.setLoading(false);
        return;
    }

    try {
        // 2. ดึงข้อมูลจาก Firestore (ตรวจสอบทั้งคอลเลกชัน movies และ series)
        let contentData = null;
        let type = 'movie';

        // ลองหาใน movies ก่อน
        const movieSnap = await getDoc(doc(db, 'movies', contentId));
        if (movieSnap.exists()) {
            contentData = movieSnap.data();
        } else {
            // ถ้าไม่เจอใน movies ให้ลองหาใน series
            const seriesSnap = await getDoc(doc(db, 'series', contentId));
            if (seriesSnap.exists()) {
                contentData = seriesSnap.data();
                type = 'series';
            }
        }

        if (!contentData) {
            UI.showErrorPage('ขออภัย ไม่พบเนื้อหาที่คุณต้องการ');
            return;
        }

        // 3. จัดการ Metadata และแสดงผล Player
        UI.updateMeta({ title: contentData.title, description: contentData.description });
        
        const isSeries = type === 'series';
        const episodes = contentData.episodes || [];
        
        // Render ตัวเล่นหนัง (ใช้ UI Component ที่มีอยู่)
        UI.renderiPhonePlayer(contentData, episodes, epIndex, isSeries);

        // 4. ระบบบันทึกประวัติการรับชม (Watch History)
        onAuthStateChanged(auth, (user) => {
            if (user) {
                handleHistory(user, contentId, contentData, type, epIndex);
            }
        });

        UI.setLoading(false);

    } catch (error) {
        console.error('🚨 Watch Engine Error:', error);
        UI.showErrorPage('เกิดข้อผิดพลาดในการโหลดเครื่องเล่นวิดีโอ');
        UI.setLoading(false);
    }
});

/**
 * บันทึกข้อมูลการดูลงในประวัติของผู้ใช้งาน
 */
async function handleHistory(user, id, data, type, epIndex) {
    const isSeries = type === 'series';
    const displayTitle = isSeries && data.episodes?.[epIndex] ? `${data.title} - ${data.episodes[epIndex].title}` : data.title;

    const historyItem = {
        id: id,
        title: displayTitle,
        poster: data.poster || data.posterURL,
        type: type,
        episodeIndex: epIndex,
        watchedAt: new Date()
    };
    await saveWatchHistory(historyItem);
}