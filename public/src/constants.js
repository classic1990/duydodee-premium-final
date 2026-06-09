/**
 * 🛰️ DUYดูDEE SYSTEM CONSTANTS
 * Centralized configuration and schema definitions.
 */

export const SCHEMA = {
    COLLECTIONS: {
        MOVIES: 'movies',
        SERIES: 'series',
        USERS: 'users',
        HERO: 'hero_slides',
        ACTIVITY_LOGS: 'activity_logs',
        DAILY_STATS: 'daily_stats',
        TICKETS: 'support_tickets'
    },
    CATEGORIES: {
        VERTICAL: 'ซีรีส์แนวตั้ง',
        CHINESE: 'ซีรีส์จีนพากย์ไทย'
    },
    ROLES: {
        MASTER: 'super-admin',
        ADMIN: 'admin',
        MEMBER: 'member'
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
