import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';

/**
 * 🤖 DUYดูDEE AI ASSISTANT (Neural Link)
 * Handles AI chat logic and system interactions
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 🔒 SECURITY: Admin access check before initializing AI assistant
        await checkAdminAccess();
        initAIAssistant();
    } catch (error) {
        console.error('AI Assistant: Admin access required', error);
        // AI assistant requires admin access, hide it if not authorized
        const panel = document.getElementById('ai-assistant-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
});

function initAIAssistant() {
    const panel = document.getElementById('ai-assistant-panel');
    const header = document.getElementById('ai-header');
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send');
    const chatBody = document.getElementById('ai-chat-body');
    const toggleIcon = document.getElementById('ai-toggle-icon');

    if (!panel || !header) {
        return;
    }

    let isOpen = false;

    // Toggle Panel
    header.onclick = () => {
        isOpen = !isOpen;
        if (isOpen) {
            panel.style.transform = 'translateY(0)';
            toggleIcon.style.transform = 'rotate(180deg)';
        } else {
            panel.style.transform = 'translateY(calc(100% - 60px))';
            toggleIcon.style.transform = 'rotate(0deg)';
        }
    };

    // Send Message
    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text) {
            return;
        }

        appendMessage('user', text);
        input.value = '';

        // Show typing indicator
        const typingId = appendTypingIndicator();

        try {
            // Simulated AI Logic (In real app, this calls Gemini API via Cloud Functions)
            const response = await processAIRequest(text);
            removeTypingIndicator(typingId);
            appendMessage('bot', response);
        } catch (error) {
            removeTypingIndicator(typingId);
            appendMessage('bot', 'ขออภัยครับ ระบบ Neural Link ขัดข้องชั่วคราว');
        }
    };

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };
}

function appendMessage(role, text) {
    const chatBody = document.getElementById('ai-chat-body');
    const msg = document.createElement('div');
    msg.className = `flex gap-3 animate-fade-in ${role === 'user' ? 'flex-row-reverse' : ''}`;

    const icon = role === 'bot' ? 'bot' : 'user';
    const color = role === 'bot' ? 'brand-primary' : 'blue-500';

    msg.innerHTML = `
        <div class="w-6 h-6 rounded-md bg-${color}/10 border border-${color}/20 flex items-center justify-center flex-shrink-0">
            <i data-lucide="${icon}" class="w-3 h-3 text-${color}"></i>
        </div>
        <div class="bg-white/5 border border-white/10 p-3 rounded-2xl ${role === 'bot' ? 'rounded-tl-none' : 'rounded-tr-none'} text-[11px] Thai-font leading-relaxed text-gray-300 max-w-[80%]">
            ${text}
        </div>
    `;

    chatBody.appendChild(msg);
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
}

function appendTypingIndicator() {
    const chatBody = document.getElementById('ai-chat-body');
    const id = 'typing-' + Date.now();
    const msg = document.createElement('div');
    msg.id = id;
    msg.className = 'flex gap-3 animate-pulse';
    msg.innerHTML = `
        <div class="w-6 h-6 rounded-md bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center flex-shrink-0">
            <i data-lucide="bot" class="w-3 h-3 text-brand-primary"></i>
        </div>
        <div class="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
            <div class="w-1 h-1 bg-brand-primary rounded-full"></div>
            <div class="w-1 h-1 bg-brand-primary rounded-full"></div>
            <div class="w-1 h-1 bg-brand-primary rounded-full"></div>
        </div>
    `;
    chatBody.appendChild(msg);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) {
        el.remove();
    }
}

/**
 * 💡 AI Core Logic (Simulated for Master Edition)
 */
async function processAIRequest(text) {
    await new Promise(r => setTimeout(r, 1500)); // Delay for realism

    const input = text.toLowerCase();

    if (input.includes('ยอดวิว') || input.includes('views')) {
        const val = document.getElementById('stat-views')?.innerText || '0';
        return `ปัจจุบันมียอดเข้าชมทั้งหมด ${val} ครั้งครับ มีแนวโน้มเพิ่มขึ้น 12% จากสัปดาห์ที่แล้ว`;
    }

    if (input.includes('สมาชิก') || input.includes('users')) {
        const val = document.getElementById('stat-users')?.innerText || '0';
        return `ตอนนี้เรามีสมาชิกทั้งหมด ${val} คนครับ เป็นสมาชิก VIP ประมาณ 15%`;
    }

    if (input.includes('ช่วยอะไรได้บ้าง') || input.includes('help')) {
        return `ผมสามารถช่วยคุณ:\n1. วิเคราะห์สถิติยอดวิวและสมาชิก\n2. ตรวจสอบสถานะระบบ\n3. ให้คำแนะนำในการเลือก Content\n4. สรุปรายงานรายวัน\n5. ตรวจสอบการชำระเงิน VIP\n6. วิเคราะห์ทราฟฟิกและ Market Dominance`;
    }

    if (input.includes('สถานะ') || input.includes('status') || input.includes('system')) {
        return `🟢 ระบบ Neural Link ทำงานปกติ\n🟢 Firebase connection: Stable\n🟢 Content delivery: Active\n🟢 VIP processing: Online\n\nทุกระบบพร้อมใช้งานครับ`;
    }

    if (input.includes('vip') || input.includes('ชำระ') || input.includes('payment')) {
        return `ระบบตรวจสอบการชำระเงิน VIP:\n- รอตรวจสอบ: 2 รายการ\n- ยืนยันแล้ว: 5 รายการ\n- ปฏิเสธ: 0 รายการ\n\nแนะนำ: ควรตรวจสอบรายการที่รออยู่ภายใน 24 ชั่วโมงครับ`;
    }

    if (input.includes('ทราฟฟิก') || input.includes('traffic') || input.includes('market')) {
        return `📊 วิเคราะห์ Traffic Pulse:\n- Peak hours: 18:00-24:00 (ค่ำ)\n- Growth: +15% จากสัปดาห์ก่อน\n- Market Dominance: ซีรีส์แนวตั้ง 75%, ซีรีส์จีน 60%\n\nแนวโน้ม: กำลังเติบโตอย่างต่อเนื่องครับ`;
    }

    if (input.includes('ซีรีส์') || input.includes('series') || input.includes('content')) {
        return `📈 สถิติเนื้อหาปัจจุบัน:\n- ซีรีส์ทั้งหมด: 134 เรื่อง\n- ซีรีส์แนวตั้ง: สุดยอด (Top Performance)\n- ซีรีส์จีน: ยอดนิยมอย่างมาก\n- เพิ่มใหม่ล่าสุด: 3 เรื่อง/สัปดาห์\n\nแนะนำ: ควรเพิ่มซีรีส์แนวตั้งใหม่อีก 5-10 เรื่องต่อเดือนครับ`;
    }

    if (input.includes('รายงาน') || input.includes('report') || input.includes('สรุป')) {
        const date = new Date().toLocaleDateString('th-TH');
        return `📋 รายงานสรุปประจำวัน (${date}):\n\n🔥 ยอดเข้าชม: 2,372 Views\n👥 สมาชิกใหม่: +3 Users\n💰 VIP Revenue: ฿1,234\n📺 Content Added: 2 Series\n✅ System Uptime: 99.9%\n\nสรุป: ระบบทำงานได้ดีเยี่ยม มีการเติบโตที่น่าพึงพอใจครับ`;
    }

    return 'ผมได้รับข้อความแล้วครับ กำลังประมวลผลความหมายเชิงลึกผ่าน Neural Network ของระบบ Master Edition... ลองถามเกี่ยวกับ ยอดวิว, สมาชิก, สถานะระบบ, VIP, ทราฟฟิก, ซีรีส์, หรือรายงานได้ครับ';
}
