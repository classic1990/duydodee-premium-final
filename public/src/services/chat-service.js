import { db, SCHEMA } from './firebase.js';
import {
    collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, doc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

/**
 * 💬 DUYดูDEE CHAT SERVICE
 * Real-time chat messaging system for the community.
 */
export const ChatService = {
    /**
     * Send a new message to the chat
     */
    async sendMessage(uid, userName, photoURL, message) {
        if (!message || !message.trim()) {
            return;
        }
        
        try {
            await addDoc(collection(db, SCHEMA.COLLECTIONS.CHATS || 'chats'), {
                uid,
                userName: userName || 'Anonymous',
                photoURL: photoURL || '/assets/logo/DUYDODEE.png',
                message: message.trim(),
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('ChatService Error [sendMessage]:', error);
            throw error;
        }
    },

    /**
     * Subscribe to real-time chat messages
     */
    listenToMessages(callback, limitCount = 50) {
        try {
            const q = query(
                collection(db, SCHEMA.COLLECTIONS.CHATS || 'chats'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            return onSnapshot(q, (snapshot) => {
                const messages = snapshot.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .reverse();
                callback(messages);
            }, (error) => {
                console.error('ChatService Error [listenToMessages]:', error);
            });
        } catch (error) {
            console.error('ChatService Error [listenToMessages setup]:', error);
            return () => {};
        }
    },

    /**
     * Delete a message (Admin only)
     */
    async deleteMessage(messageId) {
        try {
            await deleteDoc(doc(db, SCHEMA.COLLECTIONS.CHATS || 'chats', messageId));
        } catch (error) {
            console.error('ChatService Error [deleteMessage]:', error);
            throw error;
        }
    }
};
