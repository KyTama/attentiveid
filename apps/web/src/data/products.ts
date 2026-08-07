import { SERVICES } from '@/assets/images'

/**
 * Additional Products/Services Data
 * 
 * These are the 4 additional services beyond core therapy.
 * Text labels come from i18n.
 */

export interface Product {
    id: string
    icon: string
    /** i18n key for title: products.items.{key}.title */
    i18nKey: 'research' | 'aptitude' | 'interview' | 'mapping'
    /** Future: link to detail page */
    detailLink?: string
}

export const products: Product[] = [
    {
        id: 'research-class',
        icon: SERVICES.researchClass,
        i18nKey: 'research',
    },
    {
        id: 'aptitude-test',
        icon: SERVICES.intAptTest,
        i18nKey: 'aptitude',
    },
    {
        id: 'mock-interview',
        icon: SERVICES.mockInterview,
        i18nKey: 'interview',
    },
    {
        id: 'mental-health-mapping',
        icon: SERVICES.mentalHealthMap,
        i18nKey: 'mapping',
    },
]
