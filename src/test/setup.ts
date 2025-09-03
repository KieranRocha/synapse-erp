import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.api
global.window = Object.create(window);
Object.defineProperty(window, 'api', {
  value: {
    clients: {
      search: vi.fn(),
    },
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock clipboard API for user-event
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  configurable: true,
  writable: true,
});

// Additional clipboard mock for window
Object.defineProperty(window, 'navigator', {
  value: {
    ...window.navigator,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  },
  configurable: true,
  writable: true,
});

// Mock HTMLElement methods that are used by user-event
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.setPointerCapture = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));