/**
 * 🛰️ DUYดูDEE SYSTEM CONSTANTS
 * Centralized configuration and schema definitions.
 */

export const SCHEMA = {
    COLLECTIONS: {
        MOVIES: 'movies',
        SERIES: 'series',
        USERS: 'users',
        WATCHLIST: 'watchlist',
        HERO: 'hero_slides',
        ACTIVITY_LOGS: 'activity_logs',
        DAILY_STATS: 'daily_stats',
        TICKETS: 'support_tickets',
        VIP_PAYMENTS: 'vip_payments',
        VIP_PLANS: 'vip_plans',
        CHATS: 'chats'
    },
    CATEGORIES: {
        VERTICAL: 'ซีรีส์แนวตั้ง',
        CHINESE: 'ซีรีส์จีนพากย์ไทย'
    },
    ROLES: {
        MASTER: 'super-admin',
        ADMIN: 'admin',
        VIP: 'vip',
        MEMBER: 'member'
    }
};

export const VIP_PLANS = {
    MONTHLY: {
        id: 'monthly',
        name: 'VIP Monthly',
        nameTH: 'VIP เดือน',
        price: 99,
        duration: 30, // days
        features: [
            'ดูซีรีส์แนวตั้งแบบไม่จำกัด',
            'ดูซีรีส์จีนพากย์ไทยแบบไม่จำกัด',
            'คุณภาพ 4K HDR',
            'ไม่มีโฆษณา',
            'การรับชมค้างไว้',
            'Support Priority 1'
        ],
        popular: true
    },
    QUARTERLY: {
        id: 'quarterly',
        name: 'VIP Quarterly',
        nameTH: 'VIP 3 เดือน',
        price: 269,
        duration: 90, // days
        features: [
            'ดูซีรีส์แนวตั้งแบบไม่จำกัด',
            'ดูซีรีส์จีนพากย์ไทยแบบไม่จำกัด',
            'คุณภาพ 4K HDR',
            'ไม่มีโฆษณา',
            'การรับชมค้างไว้',
            'Support Priority 1',
            'ดูหนังพรีเมียม (เร็วๆ)',
            'บันทึกหน้าจอได้ 10 หน้า'
        ],
        popular: false
    },
    YEARLY: {
        id: 'yearly',
        name: 'VIP Yearly',
        nameTH: 'VIP ปี',
        price: 899,
        duration: 365, // days
        features: [
            'ดูซีรีส์แนวตั้งแบบไม่จำกัด',
            'ดูซีรีส์จีนพากย์ไทยแบบไม่จำกัด',
            'คุณภาพ 4K HDR',
            'ไม่มีโฆษณา',
            'การรับชมค้างไว้',
            'Support Priority 1',
            'ดูหนังพรีเมียม (เร็วๆ)',
            'บันทึกหน้าจอได้ ไม่จำกัด',
            'ดาวน์โหลดออฟไลน์',
            'Priority คิว Support'
        ],
        popular: true
    }
};

export const UI_CONFIG = {
    PAGE_SIZE: 12,
    TOAST_DURATION: 3000,
    DEBOUNCE_DELAY: 400
};

export const ASSETS = {
    LOGO: '/assets/logo/DUYDODEE.png',
    PLACEHOLDER: '/assets/logo/DUYDODEE.png'
};
