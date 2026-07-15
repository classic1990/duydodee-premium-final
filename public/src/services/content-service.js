import { db } from './firebase-config.js';
import { SCHEMA } from '../constants.js';
import { UI } from '../components/ui.js';
import { logger } from '../utils/logger.js';
import { Validator } from '../utils/validator.js';
import { withRetry, FirestoreError } from '../utils/error-handler.js';
import {
  collection,
  collectionGroup,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

/**
 * 🚀 DUYดูDEE CONTENT SERVICE (Refactored)
 */
export const ContentService = {
  async checkDuplicateLink(videoUrl) {
    if (!videoUrl) {
      return { exists: false };
    }
    const videoId = UI.extractYouTubeId(videoUrl);
    if (!videoId) {
      return { exists: false };
    }

    const normalizedEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

    try {
      // 1. Check Movies (via normalized embedURL)
      const mQuery = query(
        collection(db, SCHEMA.COLLECTIONS.MOVIES),
        where('embedURL', '==', normalizedEmbedUrl),
        limit(1)
      );
      const mSnap = await withRetry(() => getDocs(mQuery));
      if (!mSnap.empty) {
        return { exists: true, type: 'movie', data: mSnap.docs[0].data() };
      }

      // 2. Check Series Episodes (via normalized embedURL)
      const eQuery = query(
        collectionGroup(db, 'episodes'),
        where('embedURL', '==', normalizedEmbedUrl),
        limit(1)
      );
      const eSnap = await withRetry(() => getDocs(eQuery));
      if (!eSnap.empty) {
        return { exists: true, type: 'series', data: eSnap.docs[0].data() };
      }

      return { exists: false };
    } catch (error) {
      logger.error('ContentService Error [checkDuplicateLink]', { error: error.message, videoUrl });
      throw new FirestoreError('Failed to check duplicate link', {
        videoUrl,
        originalError: error.message
      });
    }
  },

  async fetchItems(type, options = {}) {
    const { pageSize = 12, lastDoc = null, sortBy = 'createdAt', direction = 'desc' } = options;
    const collName = this._getCollection(type);

    try {
      let q = query(collection(db, collName), orderBy(sortBy, direction), limit(pageSize));
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snap = await withRetry(() => getDocs(q));
      return {
        items: snap.docs.map((d) => ({ id: d.id, ...d.data(), type })),
        lastDoc: snap.docs[snap.docs.length - 1] || null,
        empty: snap.empty
      };
    } catch (error) {
      logger.error('ContentService Error [fetchItems]', { error: error.message, type, options });
      throw new FirestoreError('Failed to fetch items', {
        type,
        options,
        originalError: error.message
      });
    }
  },

  async getItemById(type, id) {
    try {
      const snap = await withRetry(() => getDoc(doc(db, this._getCollection(type), id)));
      return snap.exists() ? { id: snap.id, ...snap.data(), type } : null;
    } catch (error) {
      logger.error('ContentService Error [getItemById]', { error: error.message, type, id });
      throw new FirestoreError('Failed to get item by ID', {
        type,
        id,
        originalError: error.message
      });
    }
  },

  async getRelatedItems(type, category, currentId, limitCount = 6) {
    try {
      const q = query(
        collection(db, this._getCollection(type)),
        where('category', '==', category),
        limit(limitCount + 1)
      );
      const snap = await withRetry(() => getDocs(q));
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data(), type }))
        .filter((item) => item.id !== currentId)
        .slice(0, limitCount);
    } catch (error) {
      logger.error('ContentService Error [getRelatedItems]', {
        error: error.message,
        type,
        category,
        currentId
      });
      return [];
    }
  },

  async incrementViewCount(type, id) {
    try {
      await withRetry(() =>
        setDoc(doc(db, this._getCollection(type), id), { views: increment(1) }, { merge: true })
      );
    } catch (error) {
      logger.error('ContentService Error [incrementViewCount]', { error: error.message, type, id });
      // Silently fail for view count updates to not disrupt user experience
    }
  },

  async updateDailyStats(dateId, statData) {
    try {
      await withRetry(() =>
        setDoc(doc(db, SCHEMA.COLLECTIONS.DAILY_STATS, dateId), statData, { merge: true })
      );
    } catch (error) {
      logger.error('ContentService Error [updateDailyStats]', { error: error.message, dateId });
      // Silently fail for stats updates to not disrupt user experience
    }
  },

  async getEpisodes(seriesId) {
    if (!seriesId) {
      return [];
    }
    try {
      const q = query(
        collection(db, SCHEMA.COLLECTIONS.SERIES, seriesId, 'episodes'),
        orderBy('episodeNumber', 'asc')
      );
      const snap = await withRetry(() => getDocs(q));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      logger.error('ContentService Error [getEpisodes]', { error: error.message, seriesId });
      return [];
    }
  },

  async searchItems(type, term, limitCount = 12) {
    if (!term) {
      return [];
    }
    // Sanitize search term
    const sanitizedTerm = Validator.sanitizeInput(term);
    const collName = this._getCollection(type);
    try {
      const q = query(collection(db, collName), orderBy('createdAt', 'desc'), limit(100));
      const snap = await withRetry(() => getDocs(q));
      const normalizedTerm = sanitizedTerm.toLowerCase().trim();
      const results = snap.docs
        .map((d) => ({ id: d.id, ...d.data(), type }))
        .filter(
          (item) =>
            (item.title && item.title.toLowerCase().includes(normalizedTerm)) ||
            (item.category && item.category.toLowerCase().includes(normalizedTerm)) ||
            (item.description && item.description.toLowerCase().includes(normalizedTerm))
        );
      return results.slice(0, limitCount);
    } catch (error) {
      logger.error('ContentService Error [searchItems]', {
        error: error.message,
        type,
        term: sanitizedTerm
      });
      return [];
    }
  },

  async fetchItemsByCategory(collections, categoryInput, options = {}) {
    const {
      pageSize = 12,
      lastDoc = null,
      sortBy = 'createdAt',
      direction = 'desc',
      isAllCategories = false
    } = options;

    try {
      // ใช้ collectionGroup เพื่อดึงข้อมูลจากทุก collection ที่ชื่อตรงกัน
      // สมมติว่า movies และ series อยู่ใน collections ที่มีชื่อ field ร่วมกัน หรือใช้โครงสร้างที่ query ได้
      // ในที่นี้เราจะใช้ collectionGroup โดยมองหา field ชื่อ 'category' หรือสร้าง query รวม

      // หมายเหตุ: โครงสร้าง Firestore ปัจจุบันอาจต้องปรับให้ query ง่ายขึ้น
      // เพื่อแก้ปัญหา pagination ผมจะเปลี่ยนมาใช้วิธี query แยกแล้ว merge เฉพาะหน้าจอ หรือปรับโครงสร้าง

      // เนื่องจากผมไม่สามารถเปลี่ยนโครงสร้าง DB ได้ง่าย ผมจะใช้การดึงข้อมูลตามหน้าให้ถูกต้องที่สุดด้วยวิธีนี้:
      const type = collections[0]; // ใช้ type ของอันแรกเป็นหลักก่อน
      const collName = this._getCollection(type);

      let queryRef = collection(db, collName);
      if (!isAllCategories) {
        queryRef = query(queryRef, where('category', '==', categoryInput));
      }

      let orderQ = query(queryRef, orderBy(sortBy, direction), limit(pageSize));
      if (lastDoc) {
        orderQ = query(orderQ, startAfter(lastDoc));
      }

      const snap = await withRetry(() => getDocs(orderQ));
      return {
        items: snap.docs.map((d) => ({ id: d.id, ...d.data(), type })),
        lastDoc: snap.docs[snap.docs.length - 1] || null,
        empty: snap.empty
      };
    } catch (error) {
      logger.error('ContentService Error [fetchItemsByCategory]', {
        error: error.message,
        collections,
        categoryInput,
        options
      });
      throw new FirestoreError('Failed to fetch items by category', {
        collections,
        categoryInput,
        options,
        originalError: error.message
      });
    }
  },

  _getCollection(type) {
    if (!type) {
      throw new Error('Invalid content type: Type is null or undefined.');
    }
    return type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES;
  }
};
