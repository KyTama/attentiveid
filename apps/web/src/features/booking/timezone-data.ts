/**
 * Country + City/Region data with GMT offsets for timezone handling.
 * Psychologist schedules in PostgreSQL are stored in WIB (GMT+7).
 */

export interface CityOption {
  value: string
  labelId: string
  labelEn: string
  gmtOffset: number
}

export interface CountryOption {
  value: string
  labelId: string
  labelEn: string
  cities: CityOption[]
}

export const COUNTRIES: CountryOption[] = [
  {
    value: 'indonesia',
    labelId: 'Indonesia',
    labelEn: 'Indonesia',
    cities: [
      { value: 'id-wib', labelId: 'Jakarta / Jawa / Sumatra / Kalbar / Kalteng (GMT +7 / WIB)', labelEn: 'Jakarta / Java / Sumatra / W. Kalimantan (GMT +7 / WIB)', gmtOffset: 7 },
      { value: 'id-wita', labelId: 'Bali / NTT / NTB / Sulawesi / Kaltim / Kalsel (GMT +8 / WITA)', labelEn: 'Bali / NTT / NTB / Sulawesi / E. Kalimantan (GMT +8 / WITA)', gmtOffset: 8 },
      { value: 'id-wit', labelId: 'Papua / Maluku (GMT +9 / WIT)', labelEn: 'Papua / Maluku (GMT +9 / WIT)', gmtOffset: 9 },
    ],
  },
  {
    value: 'singapore',
    labelId: 'Singapura',
    labelEn: 'Singapore',
    cities: [
      { value: 'sg', labelId: 'Singapore (GMT +8)', labelEn: 'Singapore (GMT +8)', gmtOffset: 8 },
    ],
  },
  {
    value: 'china',
    labelId: 'China',
    labelEn: 'China',
    cities: [
      { value: 'cn', labelId: 'Shanghai / Beijing / Shenzhen (GMT +8)', labelEn: 'Shanghai / Beijing / Shenzhen (GMT +8)', gmtOffset: 8 },
    ],
  },
  {
    value: 'japan',
    labelId: 'Jepang',
    labelEn: 'Japan',
    cities: [
      { value: 'jp', labelId: 'Tokyo / Osaka (GMT +9)', labelEn: 'Tokyo / Osaka (GMT +9)', gmtOffset: 9 },
    ],
  },
  {
    value: 'australia',
    labelId: 'Australia',
    labelEn: 'Australia',
    cities: [
      { value: 'au-east', labelId: 'Sydney / Melbourne (GMT +10)', labelEn: 'Sydney / Melbourne (GMT +10)', gmtOffset: 10 },
      { value: 'au-west', labelId: 'Perth (GMT +8)', labelEn: 'Perth (GMT +8)', gmtOffset: 8 },
    ],
  },
  {
    value: 'other',
    labelId: 'Negara Lainnya',
    labelEn: 'Other Country',
    cities: [
      { value: 'other-gmt-m12', labelId: 'GMT -12', labelEn: 'GMT -12', gmtOffset: -12 },
      { value: 'other-gmt-m11', labelId: 'GMT -11', labelEn: 'GMT -11', gmtOffset: -11 },
      { value: 'other-gmt-m10', labelId: 'GMT -10 (Hawaii)', labelEn: 'GMT -10 (Hawaii)', gmtOffset: -10 },
      { value: 'other-gmt-m9', labelId: 'GMT -9 (Alaska)', labelEn: 'GMT -9 (Alaska)', gmtOffset: -9 },
      { value: 'other-gmt-m8', labelId: 'GMT -8 (Los Angeles)', labelEn: 'GMT -8 (Los Angeles)', gmtOffset: -8 },
      { value: 'other-gmt-m7', labelId: 'GMT -7 (Denver)', labelEn: 'GMT -7 (Denver)', gmtOffset: -7 },
      { value: 'other-gmt-m6', labelId: 'GMT -6 (Chicago)', labelEn: 'GMT -6 (Chicago)', gmtOffset: -6 },
      { value: 'other-gmt-m5', labelId: 'GMT -5 (New York)', labelEn: 'GMT -5 (New York)', gmtOffset: -5 },
      { value: 'other-gmt-m4', labelId: 'GMT -4 (Santiago)', labelEn: 'GMT -4 (Santiago)', gmtOffset: -4 },
      { value: 'other-gmt-m3', labelId: 'GMT -3 (São Paulo)', labelEn: 'GMT -3 (São Paulo)', gmtOffset: -3 },
      { value: 'other-gmt-m2', labelId: 'GMT -2', labelEn: 'GMT -2', gmtOffset: -2 },
      { value: 'other-gmt-m1', labelId: 'GMT -1', labelEn: 'GMT -1', gmtOffset: -1 },
      { value: 'other-gmt-0', labelId: 'GMT +0 (London)', labelEn: 'GMT +0 (London)', gmtOffset: 0 },
      { value: 'other-gmt-p1', labelId: 'GMT +1 (Paris / Berlin)', labelEn: 'GMT +1 (Paris / Berlin)', gmtOffset: 1 },
      { value: 'other-gmt-p2', labelId: 'GMT +2 (Cairo)', labelEn: 'GMT +2 (Cairo)', gmtOffset: 2 },
      { value: 'other-gmt-p3', labelId: 'GMT +3 (Riyadh / Moscow)', labelEn: 'GMT +3 (Riyadh / Moscow)', gmtOffset: 3 },
      { value: 'other-gmt-p4', labelId: 'GMT +4 (Dubai)', labelEn: 'GMT +4 (Dubai)', gmtOffset: 4 },
      { value: 'other-gmt-p5', labelId: 'GMT +5 (Karachi)', labelEn: 'GMT +5 (Karachi)', gmtOffset: 5 },
      { value: 'other-gmt-p5.5', labelId: 'GMT +5:30 (Mumbai / Delhi)', labelEn: 'GMT +5:30 (Mumbai / Delhi)', gmtOffset: 5.5 },
      { value: 'other-gmt-p6', labelId: 'GMT +6 (Dhaka)', labelEn: 'GMT +6 (Dhaka)', gmtOffset: 6 },
      { value: 'other-gmt-p7', labelId: 'GMT +7 (Bangkok / Jakarta)', labelEn: 'GMT +7 (Bangkok / Jakarta)', gmtOffset: 7 },
      { value: 'other-gmt-p8', labelId: 'GMT +8 (Kuala Lumpur / Taipei)', labelEn: 'GMT +8 (Kuala Lumpur / Taipei)', gmtOffset: 8 },
      { value: 'other-gmt-p9', labelId: 'GMT +9 (Seoul)', labelEn: 'GMT +9 (Seoul)', gmtOffset: 9 },
      { value: 'other-gmt-p10', labelId: 'GMT +10 (Sydney)', labelEn: 'GMT +10 (Sydney)', gmtOffset: 10 },
      { value: 'other-gmt-p11', labelId: 'GMT +11', labelEn: 'GMT +11', gmtOffset: 11 },
      { value: 'other-gmt-p12', labelId: 'GMT +12 (Auckland)', labelEn: 'GMT +12 (Auckland)', gmtOffset: 12 },
    ],
  },
]

export function getGmtOffset(cityValue: string): number {
  for (const country of COUNTRIES) {
    const city = country.cities.find((c) => c.value === cityValue)
    if (city) return city.gmtOffset
  }
  return 7
}

export function getCityLabel(cityValue: string, lang: 'id' | 'en'): string {
  for (const country of COUNTRIES) {
    const city = country.cities.find((c) => c.value === cityValue)
    if (city) return lang === 'en' ? city.labelEn : city.labelId
  }
  return ''
}

export function getShortCityLabel(cityValue: string): string {
  for (const country of COUNTRIES) {
    const city = country.cities.find((c) => c.value === cityValue)
    if (city) {
      const gmtStr = city.gmtOffset >= 0 ? `GMT+${city.gmtOffset}` : `GMT${city.gmtOffset}`
      const firstCity = (city.labelEn.split('/')[0] || '').split('(')[0].trim()
      return `${firstCity} / ${gmtStr}`
    }
  }
  return 'WIB / GMT+7'
}

export function wibToLocal(wibHour: number, wibMinute: number, userGmtOffset: number): { hour: number; minute: number } {
  const diffMinutes = Math.round((userGmtOffset - 7) * 60)
  const totalMinutes = wibHour * 60 + wibMinute + diffMinutes
  let h = Math.floor(totalMinutes / 60) % 24
  let m = totalMinutes % 60
  if (h < 0) h += 24
  if (m < 0) m += 60
  return { hour: h, minute: m }
}

export function localToWib(localHour: number, localMinute: number, userGmtOffset: number): { hour: number; minute: number } {
  const diffMinutes = Math.round((7 - userGmtOffset) * 60)
  const totalMinutes = localHour * 60 + localMinute + diffMinutes
  let h = Math.floor(totalMinutes / 60) % 24
  let m = totalMinutes % 60
  if (h < 0) h += 24
  if (m < 0) m += 60
  return { hour: h, minute: m }
}

export function formatWibWithLocal(wibTime: string, cityValue: string): string {
  if (!wibTime || !cityValue) return wibTime
  const offset = getGmtOffset(cityValue)
  if (offset === 7) return `${wibTime} WIB`
  const [h, m] = wibTime.split(':').map(Number)
  const local = wibToLocal(h || 0, m || 0, offset)
  const localStr = `${String(local.hour).padStart(2, '0')}:${String(local.minute).padStart(2, '0')}`
  const cityLabel = getShortCityLabel(cityValue)
  return `${wibTime} WIB (Klien: ${localStr} ${cityLabel})`
}
