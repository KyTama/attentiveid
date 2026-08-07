import { CONTACT } from '@/assets/images'

/**
 * Contact Information
 * 
 * Company contact details and social links.
 */

export const WHATSAPP_NUMBER = '6285156410912'
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`

export const contact = {
    whatsapp: {
        number: WHATSAPP_NUMBER,
        displayNumber: '+62 851-5641-0912',
        link: WHATSAPP_LINK,
        qrImage: CONTACT.whatsappQR,
        icon: CONTACT.whatsapp,
    },
    location: {
        address: 'Jl. Teratai IV No.4, RT.3/RW.2, Tj. Bar., Kec. Jagakarsa, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12530',
        icon: CONTACT.location,
        // Future: Google Maps embed URL
        mapsUrl: 'https://maps.google.com/?q=Jl.+Teratai+IV+No.4+Jagakarsa+Jakarta+Selatan',
    },
    social: {
        instagram: 'https://instagram.com/attentive.id',
        // Add more as needed
    },
} as const

/**
 * Generate WhatsApp link with pre-filled message
 */
export const createWhatsAppLink = (message: string) =>
    `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`

/**
 * Default contact message
 */
export const defaultContactMessage =
    'Halo admin Attentive.id, saya ingin bertanya mengenai layanan psikologi. Saya menghubungi dari website Attentive.id.'
