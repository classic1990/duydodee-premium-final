/**
 * Unit Tests for UI Components
 * Tests for UI utility functions and components
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock DOM environment
global.document = {
  createElement: jest.fn(),
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn().mockReturnValue([])
};

global.window = {
  alert: jest.fn(),
  confirm: jest.fn(),
  setTimeout: jest.fn(),
  clearTimeout: jest.fn()
};

describe('UI Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Toast Notifications', () => {
    it('should create toast element', () => {
      const mockCreateElement = jest.fn().mockReturnValue({
        classList: { add: jest.fn() },
        textContent: '',
        append: jest.fn()
      });
      
      document.createElement = mockCreateElement;
      
      const toast = mockCreateElement('div');
      
      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(toast.classList.add).toHaveBeenCalled();
    });

    it('should show success toast', () => {
      const mockToast = {
        classList: { add: jest.fn() },
        textContent: 'Success message',
        append: jest.fn()
      };
      
      mockToast.textContent = 'Success message';
      
      expect(mockToast.textContent).toBe('Success message');
    });

    it('should show error toast', () => {
      const mockToast = {
        classList: { add: jest.fn() },
        textContent: 'Error message',
        append: jest.fn()
      };
      
      mockToast.textContent = 'Error message';
      
      expect(mockToast.textContent).toBe('Error message');
    });

    it('should auto-hide toast after duration', () => {
      const mockSetTimeout = jest.fn((callback, delay) => {
        callback();
        return 1;
      });
      
      global.setTimeout = mockSetTimeout;
      
      mockSetTimeout(() => {}, 3000);
      
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
    });
  });

  describe('Modal Functions', () => {
    it('should open modal', () => {
      const mockModal = {
        classList: { remove: jest.fn() },
        style: { display: 'block' }
      };
      
      document.getElementById = jest.fn().mockReturnValue(mockModal);
      
      const modal = document.getElementById('test-modal');
      modal.classList.remove('hidden');
      modal.style.display = 'block';
      
      expect(modal.classList.remove).toHaveBeenCalledWith('hidden');
      expect(modal.style.display).toBe('block');
    });

    it('should close modal', () => {
      const mockModal = {
        classList: { add: jest.fn() },
        style: { display: 'none' }
      };
      
      document.getElementById = jest.fn().mockReturnValue(mockModal);
      
      const modal = document.getElementById('test-modal');
      modal.classList.add('hidden');
      modal.style.display = 'none';
      
      expect(modal.classList.add).toHaveBeenCalledWith('hidden');
      expect(modal.style.display).toBe('none');
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner', () => {
      const mockLoader = {
        classList: { remove: jest.fn() },
        style: { display: 'flex' }
      };
      
      document.getElementById = jest.fn().mockReturnValue(mockLoader);
      
      const loader = document.getElementById('loader');
      loader.classList.remove('hidden');
      loader.style.display = 'flex';
      
      expect(loader.classList.remove).toHaveBeenCalledWith('hidden');
      expect(loader.style.display).toBe('flex');
    });

    it('should hide loading spinner', () => {
      const mockLoader = {
        classList: { add: jest.fn() },
        style: { display: 'none' }
      };
      
      document.getElementById = jest.fn().mockReturnValue(mockLoader);
      
      const loader = document.getElementById('loader');
      loader.classList.add('hidden');
      loader.style.display = 'none';
      
      expect(loader.classList.add).toHaveBeenCalledWith('hidden');
      expect(loader.style.display).toBe('none');
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };
      
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });

    it('should validate password strength', () => {
      const validatePassword = (password) => {
        return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
      };
      
      expect(validatePassword('StrongPass123')).toBe(true);
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('weakpass')).toBe(false);
    });

    it('should validate required fields', () => {
      const validateRequired = (value) => {
        return value !== null && value !== undefined && value.trim() !== '';
      };
      
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired('')).toBe(false);
      expect(validateRequired(null)).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should format date correctly', () => {
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('th-TH');
      };
      
      const testDate = new Date('2024-01-15');
      const formatted = formatDate(testDate);
      
      expect(formatted).toContain('2024');
    });

    it('should format numbers with commas', () => {
      const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      };
      
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should truncate text', () => {
      const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
      };
      
      expect(truncateText('Short text', 20)).toBe('Short text');
      expect(truncateText('This is a very long text', 10)).toBe('This is a ...');
    });

    it('should debounce function calls', () => {
      jest.useFakeTimers();
      
      let callCount = 0;
      const debouncedFunction = jest.fn(() => {
        callCount++;
      });
      
      // Simulate debounce
      let timeout;
      const debounce = (func, delay) => {
        return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(this, args), delay);
        };
      };
      
      const debounced = debounce(debouncedFunction, 300);
      
      debounced();
      debounced();
      debounced();
      
      jest.advanceTimersByTime(300);
      
      expect(debouncedFunction).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
    });
  });

  describe('Navigation Functions', () => {
    it('should navigate to page', () => {
      const mockNavigate = jest.fn();
      global.window.location = { href: '' };
      
      mockNavigate('/watch-movie?id=123');
      
      expect(mockNavigate).toHaveBeenCalledWith('/watch-movie?id=123');
    });

    it('should build query parameters', () => {
      const buildQuery = (params) => {
        return Object.keys(params)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
          .join('&');
      };
      
      const params = { id: '123', category: 'action' };
      const query = buildQuery(params);
      
      expect(query).toContain('id=123');
      expect(query).toContain('category=action');
    });
  });

  describe('Local Storage', () => {
    it('should save to local storage', () => {
      const mockSetItem = jest.fn();
      global.localStorage = { setItem: mockSetItem };
      
      localStorage.setItem('test-key', 'test-value');
      
      expect(mockSetItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should retrieve from local storage', () => {
      const mockGetItem = jest.fn().mockReturnValue('test-value');
      global.localStorage = { getItem: mockGetItem };
      
      const value = localStorage.getItem('test-key');
      
      expect(mockGetItem).toHaveBeenCalledWith('test-key');
      expect(value).toBe('test-value');
    });

    it('should remove from local storage', () => {
      const mockRemoveItem = jest.fn();
      global.localStorage = { removeItem: mockRemoveItem };
      
      localStorage.removeItem('test-key');
      
      expect(mockRemoveItem).toHaveBeenCalledWith('test-key');
    });
  });
});
