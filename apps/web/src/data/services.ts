import { ICONS } from '@/assets/images'

/**
 * Core Services Data
 * 
 * These are the main 3 therapy services offered.
 * Text labels come from i18n, this is just structural data.
 */

export interface Service {
    id: string
    icon: string
    /** i18n key for title: services.items.{key}.title */
    i18nKey: 'adult' | 'child' | 'family'
}

export const services: Service[] = [
    {
        id: 'adult-therapy',
        icon: ICONS.core1,
        i18nKey: 'adult',
    },
    {
        id: 'child-therapy',
        icon: ICONS.core2,
        i18nKey: 'child',
    },
    {
        id: 'family-therapy',
        icon: ICONS.core3,
        i18nKey: 'family',
    },
]
