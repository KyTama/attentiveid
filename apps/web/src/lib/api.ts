import { treaty } from '@elysiajs/eden';
import type { App } from '@api/app';

// Create the Eden client
const apiBaseUrl = import.meta.env.VITE_API_URL
  || (typeof window === 'undefined' ? '' : window.location.origin)

export const api = treaty<App>(apiBaseUrl);

export const psychologistApi = {
  list: (query: {
    locale: 'id' | 'en'
    search?: string
    supportArea?: 'adultClinical' | 'childAdolescent' | 'educational'
    minimumExperienceYears?: number
    limit?: number
    offset?: number
  }) => api.api.content.psychologists.get({ query }),
  featured: (locale: 'id' | 'en') => api.api.content.psychologists.featured.get({ query: { locale } }),
  getBySlug: (slug: string, locale: 'id' | 'en') => api.api.content.psychologists({ slug }).get({ query: { locale } }),
};

// Export convenience hooks and utilities
export default api;
