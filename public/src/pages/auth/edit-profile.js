import { auth, updateProfile, ref, storage, uploadBytes, getDownloadURL, db, doc, setDoc } from '../../services/firebase.js';
import { UI } from '../../components/ui.js';

/**
 * ⚙️ EDIT PROFILE ENGINE - Modular V1.0
 */
document.addEventListener('DOMContentLoaded', () => {
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarTrigger = document.querySelector('.avatar-trigger');
    const form = document.getElementById('edit-profile-form');
    
    if (avatarTrigger) avatarTrigger.onclick = () => avatarInput.click();
    
    auth.onAuthStateChanged(user => {
        if (user) {
            if (document.getElementById('display-name')) document.getElementById('display-name').value = user.displayName || '';
            if (document.getElementById('email')) document.getElementById('email').value = user.email || '';
            if (avatarPreview) avatarPreview.src = user.photoURL || '/assets/logo/DUYDODEE.png';
            UI.refreshIcons();
        } else {
            window.location.href = '/login.html';
        }
    });

    if (avatarInput) {
        avatarInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // 🛡️ Basic Validation
                if (file.size > 2 * 1024 * 1024) {
                    UI.showToast('ขนาดรูปภาพต้องไม่เกิน 2MB', 'error');
                    avatarInput.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = (re) => avatarPreview.src = re.target.result;
                reader.readAsDataURL(file);
            }
        };
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) return;

            UI.setLoading(true);
            try {
                let photoURL = user.photoURL;
                const file = avatarInput.files[0];
                
                if (file) {
                    const storageRef = ref(storage, `avatars/${user.uid}`);
                    await uploadBytes(storageRef, file);
                    photoURL = await getDownloadURL(storageRef);
                }

                const displayName = document.getElementById('display-name').value.trim();
                if (!displayName) throw new Error('กรุณาระบุชื่อที่แสดง');

                await updateProfile(user, { displayName, photoURL });
                
                // Update Firestore too
                await setDoc(doc(db, 'users', user.uid), { 
                    displayName, 
                    photoURL,
                    updatedAt: new Date()
                }, { merge: true });
                
                UI.showToast('อัปเดตข้อมูลส่วนตัวสำเร็จ', 'success');
                setTimeout(() => window.location.href = '/profile.html', 1500);
            } catch (err) {
                console.error(err);
                UI.showToast(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
            } finally {
                UI.setLoading(false);
            }
        };
    }
});


