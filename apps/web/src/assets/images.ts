/**
 * Image Assets Manifest
 * 
 * Organized folder structure:
 * /public/images/
 * ├── brand/        # Logo, favicon, UI icons
 * ├── hero/         # Hero & intro section
 * ├── icons/        # Feature icons
 * ├── services/     # Service images
 * ├── contact/      # Contact & social
 * └── psychologists/# Team photos
 * 
 * @example
 * import { IMAGES } from '@/assets/images'
 * <img src={IMAGES.brand.logo} alt="Logo" />
 */

const BASE = '/images'

/**
 * Brand & UI Assets
 */
export const BRAND = {
    logo: `${BASE}/brand/attentive-logo-01.webp`,
    favicon: `${BASE}/brand/favicon.webp`,
    burger: `${BASE}/brand/burger.webp`,
} as const

/**
 * Hero & Introduction Section
 */
export const HERO = {
    main: `${BASE}/hero/hero.webp`,
    introduction: `${BASE}/hero/introduction.webp`,
    core: `${BASE}/hero/core.webp`,
} as const

/**
 * Feature Icons
 */
export const ICONS = {
    core1: `${BASE}/icons/core-icon-1.webp`,
    core2: `${BASE}/icons/core-icon-2.webp`,
    core3: `${BASE}/icons/core-icon-3.webp`,
} as const

/**
 * Service Images
 */
export const SERVICES = {
    adultClinical: `${BASE}/services/adult-clinical.webp`,
    family: `${BASE}/services/family.webp`,
    intAptTest: `${BASE}/services/int-apt-test.webp`,
    mentalHealthMap: `${BASE}/services/mental-health-map.webp`,
    mockInterview: `${BASE}/services/mock-itvw.webp`,
    researchClass: `${BASE}/services/research-class.webp`,
} as const

/**
 * Contact & Social
 */
export const CONTACT = {
    whatsapp: `${BASE}/contact/wa.webp`,
    whatsappQR: `${BASE}/contact/qr-wa.webp`,
    location: `${BASE}/contact/loc.webp`,
    quote: `${BASE}/contact/q.webp`,
    avatar: `${BASE}/contact/avater.webp`,
} as const

/**
 * Psychologist Team Photos
 */
export const PSYCHOLOGISTS = {
    anggun: `${BASE}/psychologists/Anggun.webp`,
    dewinta: `${BASE}/psychologists/Dewinta.webp`,
    dinda: `${BASE}/psychologists/Dinda.webp`,
    disa: `${BASE}/psychologists/Disa.webp`,
    gita: `${BASE}/psychologists/Gita.webp`,
    ilham: `${BASE}/psychologists/Ilham.webp`,
    jean: `${BASE}/psychologists/Jean.webp`,
    kia: `${BASE}/psychologists/Kia.webp`,
    mayda: `${BASE}/psychologists/Mayda.webp`,
    nichi: `${BASE}/psychologists/Nichi.webp`,
    sekar: `${BASE}/psychologists/Sekar.webp`,
    syazka: `${BASE}/psychologists/Syazka.webp`,
} as const

/**
 * All images combined
 */
export const IMAGES = {
    brand: BRAND,
    hero: HERO,
    icons: ICONS,
    services: SERVICES,
    contact: CONTACT,
    psychologists: PSYCHOLOGISTS,
} as const

export type ImageCategory = keyof typeof IMAGES
