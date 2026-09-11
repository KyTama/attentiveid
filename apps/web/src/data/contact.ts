import { CONTACT } from '@/assets/images'

/**
 * Contact Information
 * 
 * Company contact details and social links.
 */

export const WHATSAPP_NUMBER = '6285156410912'
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`

export interface ClinicBranch {
    id: 'tbi' | 'bsd' | 'malang'
    name: string
    city: string
    region: string
    address: string
    mapsUrl?: string
    status: 'active' | 'opening_soon'
    tag: string
    features: readonly string[]
}

export const clinicBranches: readonly ClinicBranch[] = [
    {
        id: 'tbi',
        name: 'Attentive Jakarta (TBI)',
        city: 'Jakarta Selatan',
        region: 'DKI Jakarta',
        address: 'Jl. Teratai IV No.4, RT.3/RW.2, Tj. Barat, Kec. Jagakarsa, Kota Jakarta Selatan, DKI Jakarta 12530',
        mapsUrl: 'https://maps.app.goo.gl/RKguhwdeM1w9LwC29',
        status: 'active',
        tag: 'Pusat Layanan Utama',
        features: ['Konseling Tatap Muka & Online', 'Ruang Privat Kedap Suara', 'Akses KRL St. Tanjung Barat'],
    },
    {
        id: 'bsd',
        name: 'Attentive BSD',
        city: 'Tangerang Selatan',
        region: 'Banten',
        address: 'Delrey BizTown BSD Unit B8-9 Lt 2, Jl. Lkr. Botanika Utara, Lengkong Kulon, Kec. Pagedangan, Kabupaten Tangerang, Banten 15531',
        mapsUrl: 'https://maps.app.goo.gl/8vfKnYFdj3GEQWYQ7',
        status: 'active',
        tag: 'Cabang BSD',
        features: ['Konseling Tatap Muka & Online', 'Kawasan Modern & Tenang', 'Parkir Luas & Akses Tol BSD'],
    },
    {
        id: 'malang',
        name: 'Attentive Malang',
        city: 'Malang',
        region: 'Jawa Timur',
        address: 'Singosari, Kawasan Malang Raya, Jawa Timur',
        mapsUrl: 'https://maps.google.com/?q=Singosari+Malang+Jawa+Timur',
        status: 'opening_soon',
        tag: 'Opening Soon',
        features: ['Konseling Online Tersedia', 'Ruang Offline Segera Hadir', 'Jangkauan Malang Raya & Jatim'],
    },
] as const

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
        mapsUrl: 'https://maps.app.goo.gl/RKguhwdeM1w9LwC29',
        reviewsUrl: 'https://www.google.com/maps/search/?api=1&query=Attentive.id%20Jl.%20Teratai%20IV%20No.4%20Jagakarsa%20Jakarta%20Selatan',
    },
    branches: clinicBranches,
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
