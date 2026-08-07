import { CONTACT } from '@/assets/images'

/**
 * Testimonials Data
 * 
 * Client testimonials structure.
 * The actual content/translations are in i18n locale files.
 */

export interface Testimonial {
    id: string
    /** Index in the i18n testimonials.items array */
    index: number
    /** Quote icon/image */
    image: string
}

/**
 * Testimonial entries
 * 
 * Content comes from i18n: testimonials.items[index]
 * - name: Client type and age
 * - content: The testimonial text
 */
export const testimonials: Testimonial[] = [
    {
        id: 'testimonial-1',
        index: 0,
        image: CONTACT.quote,
    },
    {
        id: 'testimonial-2',
        index: 1,
        image: CONTACT.quote,
    },
    {
        id: 'testimonial-3',
        index: 2,
        image: CONTACT.quote,
    },
]

/**
 * Get testimonial by index
 */
export const getTestimonial = (index: number) =>
    testimonials.find((t) => t.index === index)
