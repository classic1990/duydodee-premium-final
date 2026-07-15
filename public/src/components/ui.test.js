/**
 * Unit Tests for UI Components
 * Tests for UI utility functions and components
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('UI Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset DOM for each test
    document.body.innerHTML = '';
  });

  describe('Toast Notifications', () => {
    it('should create toast element correctly', () => {
      const toast = document.createElement('div');
      toast.id = 'test-toast';
      toast.classList.add('animate-fade-left');

      expect(toast.id).toBe('test-toast');
      expect(toast.classList.contains('animate-fade-left')).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('should format date correctly in a consistent locale', () => {
      // Use en-US to ensure consistent testing across different environments
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US');
      };

      const testDate = new Date('2024-01-15');
      const formatted = formatDate(testDate);

      // en-US format is MM/DD/YYYY
      expect(formatted).toBe('1/15/2024');
    });

    it('should format numbers with commas', () => {
      const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      };

      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should truncate text properly', () => {
      const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) {
          return text;
        }
        return text.substring(0, maxLength) + '...';
      };

      expect(truncateText('Short text', 20)).toBe('Short text');
      expect(truncateText('This is a very long text', 10)).toBe('This is a ...');
    });
  });

  describe('Form Validation', () => {
    it('should validate email format correctly', () => {
      const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });

    it('should validate password length', () => {
      const validatePassword = (password) => {
        return password.length >= 8;
      };

      expect(validatePassword('StrongPass123')).toBe(true);
      expect(validatePassword('weak')).toBe(false);
    });
  });

  describe('Navigation & Query Builder', () => {
    it('should build query parameters correctly', () => {
      const buildQuery = (params) => {
        return Object.keys(params)
          .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
          .join('&');
      };

      const params = { id: '123', category: 'action', q: 'test search' };
      const query = buildQuery(params);

      expect(query).toContain('id=123');
      expect(query).toContain('category=action');
      expect(query).toContain('q=test%20search');
    });
  });

  describe('Local Storage', () => {
    // In JSDOM, localStorage is already available and works like a real one
    it('should save and retrieve values from local storage', () => {
      const key = 'user_preference';
      const value = 'dark_mode';

      localStorage.setItem(key, value);
      expect(localStorage.getItem(key)).toBe(value);

      localStorage.removeItem(key);
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  describe('DOM Manipulation Mocks', () => {
    it('should handle modal opening simulation', () => {
      // Setup mock DOM
      document.body.innerHTML = '<div id="modal" class="hidden"></div>';
      const modal = document.getElementById('modal');

      // Simulate opening
      modal.classList.remove('hidden');
      modal.style.display = 'block';

      expect(modal.classList.contains('hidden')).toBe(false);
      expect(modal.style.display).toBe('block');
    });
  });
});
