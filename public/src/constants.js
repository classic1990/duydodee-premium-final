/**
 * 🛰️ DUYDODEE PREMIUM - SYSTEM CONSTANTS
 * Centralized configuration and schema definitions
 */

// Database Schema Configuration
export const SCHEMA = {
  COLLECTIONS: {
    MOVIES: 'movies',
    SERIES: 'series',
    USERS: 'users',
    HERO: 'hero_slides',
    ACTIVITY_LOGS: 'activity_logs',
    DAILY_STATS: 'daily_stats',
    VIP_PAYMENTS: 'vip_payments',
    SITE_SETTINGS: 'site_settings'
  },
  CATEGORIES: {
    VERTICAL: 'ซีรีส์แนวตั้ง',
    CHINESE: 'ซีรีส์จีนพากย์ไทย',
    ACTION: 'หนังแอคชั่น',
    DRAMA: 'หนังดราม่า',
    COMEDY: 'หนังตลก',
    HORROR: 'หนังสยองขวัญ',
    ROMANCE: 'หนังโรแมนติก',
    THRILLER: 'หนังระทึกขวัญ',
    DOCUMENTARY: 'สารคดี'
  },
  ROLES: {
    MASTER: 'super-admin',
    ADMIN: 'admin',
    MEMBER: 'member'
  },
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    BANNED: 'banned'
  }
};

// UI Configuration
export const UI_CONFIG = {
  PAGE_SIZE: 12,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 400,
  SKELETON_COUNT: 8,
  MAX_RETRIES: 3,
  TIMEOUT: 30000
};

// Asset Paths
export const ASSETS = {
  LOGO: '/assets/logo/DUYDODEE.png',
  PLACEHOLDER: '/assets/logo/DUYDODEE.png',
  DEFAULT_POSTER: '/assets/images/default-poster.jpg',
  DEFAULT_BACKDROP: '/assets/images/default-backdrop.jpg'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'การเชื่อมต่อขัดข้อง กรุณาตรวจสอบอินเทอร์เน็ต',
  AUTH_ERROR: 'การยืนยันตัวตนผิดพลาด กรุณาล็อกอินใหม่',
  VALIDATION_ERROR: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
  NOT_FOUND: 'ไม่พบข้อมูลที่ค้นหา',
  PERMISSION_DENIED: 'ไม่มีสิทธิ์เข้าถึง',
  SERVER_ERROR: 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ภายหลัง',
  UNKNOWN_ERROR: 'เกิดข้อผิดพลาด กรุณาลองใหม่'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'เข้าสู่ระบบสำเร็จ',
  LOGOUT_SUCCESS: 'ออกจากระบบสำเร็จ',
  REGISTER_SUCCESS: 'ลงทะเบียนสำเร็จ',
  UPDATE_SUCCESS: 'อัปเดตข้อมูลสำเร็จ',
  DELETE_SUCCESS: 'ลบข้อมูลสำเร็จ',
  UPLOAD_SUCCESS: 'อัปโหลดสำเร็จ'
};

// Content Types
export const CONTENT_TYPES = {
  MOVIE: 'movie',
  SERIES: 'series',
  EPISODE: 'episode'
};

// Sorting Options
export const SORT_OPTIONS = {
  LATEST: 'latest',
  VIEWS: 'views',
  RATING: 'rating',
  TITLE: 'title'
};

// Pagination Config
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
};
