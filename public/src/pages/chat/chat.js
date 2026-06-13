import { db, collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, auth, checkIsAdmin } from '../../services/firebase.js';

/**
 * 💬 DUYดูDEE LIVE CHAT ENGINE
 * Real-time community interaction for premium members.
 */
document.addEventListener('DOMContentLoaded', async () => {
    const chatContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    if (!chatForm || !chatContainer) {
        return;
    }

    // 🔒 Auth Guard for Chat
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            chatContainer.innerHTML = '<div class="p-10 text-center text-gray-500 Thai-font">กรุณาเข้าสู่ระบบเพื่อร่วมพูดคุย</div>';
            chatInput.disabled = true;
            return;
        }

        const isAdmin = await checkIsAdmin(user);
        initChat(user, isAdmin);
    });

    function initChat(user, isAdmin) {
        chatInput.disabled = false;

        // 🟢 Real-time Listener
        const q = query(collection(db, 'chat_messages'), orderBy('timestamp', 'desc'), limit(50));
        onSnapshot(q, (snap) => {
            const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
            renderMessages(messages, user.uid);
        });

        chatForm.onsubmit = async (e) => {
            e.preventDefault();
            const msg = chatInput.value.trim();
            if (!msg) {
                return;
            }

            try {
                await addDoc(collection(db, 'chat_messages'), {
                    uid: user.uid,
                    userName: user.displayName || 'Member',
                    photoURL: user.photoURL || '/assets/logo/DUYDODEE.png',
                    text: msg,
                    isAdmin: isAdmin,
                    timestamp: serverTimestamp()
                });
                chatInput.value = '';
            } catch (err) {
                console.error('Send message error:', err);
            }
        };
    }

    function renderMessages(messages, currentUid) {
        chatContainer.innerHTML = messages.map(msg => {
            const isMe = msg.uid === currentUid;
            const adminBadge = msg.isAdmin ? '<span class="px-1.5 py-0.5 bg-brand-primary text-black text-[7px] font-black rounded ml-1">ADMIN</span>' : '';

            return `
                <div class="flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''} animate-fade-up">
                    <img src="${msg.photoURL}" class="w-8 h-8 rounded-lg border border-white/10">
                    <div class="max-w-[70%] space-y-1 ${isMe ? 'text-right' : ''}">
                        <div class="flex items-center gap-1 ${isMe ? 'justify-end' : ''}">
                            <span class="text-[9px] font-bold text-gray-400">${msg.userName}</span>
                            ${adminBadge}
                        </div>
                        <div class="px-4 py-2 rounded-2xl text-xs Thai-font ${isMe ? 'bg-brand-primary text-black rounded-tr-none' : 'bg-white/5 text-white rounded-tl-none'}">
                            ${msg.text}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
