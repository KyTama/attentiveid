import { treaty } from '@elysiajs/eden';
import type { App } from '@api/index';

// Create the Eden client
export const api = treaty<App>(import.meta.env.VITE_API_URL || 'http://localhost:3000');

// Export convenience hooks and utilities
export default api;
