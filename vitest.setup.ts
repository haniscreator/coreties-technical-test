
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
// If we need to mock global fetch or other browser APIs, we do it here.
global.fetch = vi.fn();
