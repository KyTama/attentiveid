import { useTranslation } from 'react-i18next'

/**
 * Inline Indonesian/English text for the portal screens: `tx('Simpan', 'Save')`.
 * Follows the language toggle in the portal header (Indonesian is the default).
 */
export function useTx() {
  const { i18n } = useTranslation()
  const isEn = (i18n.resolvedLanguage || i18n.language || 'id').startsWith('en')
  const tx = (indonesian: string, english: string) => (isEn ? english : indonesian)
  return { tx, isEn }
}
