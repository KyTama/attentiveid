import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
export function LanguageSwitcher() {
    const { i18n } = useTranslation()
    const currentLang = i18n.language || 'en'

    const toggleLanguage = () => {
        const newLang = currentLang.startsWith('en') ? 'id' : 'en'
        i18n.changeLanguage(newLang)
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-sm"
        >
            <Globe className="h-4 w-4" />
            <span className="uppercase font-medium">{i18n.language}</span>
        </Button>
    )
}
