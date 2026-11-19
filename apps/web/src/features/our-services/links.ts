/**
 * Where each care area on the home page goes in the services site (ourservices.attentiveid.com), shown inside /our-services.
 * The part after # is understood by the services site: #detail-<service id> opens one service, #layanan-<category> a category,
 * #cari-<word> a search. If the services team renames a service id, change it here.
 */
export const CARE_AREA_SERVICE_HASH: Record<string, string> = {
  adult: '#detail-p-konseling-dewasa',
  assessment: '#layanan-asesmen',
  relationships: '#detail-p-konseling-couple',
  child: '#detail-p-konseling-anak',
  family: '#detail-p-konseling-family',
  // two services fit (career interest test, study and career direction): a search lists both
  career: '#cari-karier',
}

/** The /our-services address for a care area (the services overview when the area is not known). */
export const careAreaServiceLink = (topicKey: string): string => `/our-services${CARE_AREA_SERVICE_HASH[topicKey] ?? ''}`

/** Only a plain fragment (letters, digits, - _ . %) is passed on to the frame. */
export const safeServicesHash = (hash: string): string => (/^#[\w%.-]{1,120}$/.test(hash) ? hash : '')
