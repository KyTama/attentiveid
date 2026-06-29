import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { BRAND } from '@/assets/images'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './LanguageSwitcher'

const NAV_ITEMS = [
    { key: 'about', href: '#about' },
    { key: 'services', href: '#services' },
    { key: 'psychologists', href: '#psychologists' },
    { key: 'products', href: '#products' },
    { key: 'contact', href: '#contact' },
] as const

export function Navbar() {
    const { t } = useTranslation()
    const [isVisible, setIsVisible] = useState(true)
    const [isAtTop, setIsAtTop] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // At top of page
            setIsAtTop(currentScrollY < 50)

            // Smart header: show when scrolling up, hide when scrolling down
            if (currentScrollY < 50) {
                setIsVisible(true)
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down & past threshold
                setIsVisible(false)
            } else if (currentScrollY < lastScrollY) {
                // Scrolling up
                setIsVisible(true)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY])

    const handleNavClick = (href: string) => {
        setMobileOpen(false)
        const element = document.querySelector(href)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isVisible ? 'translate-y-0' : '-translate-y-full',
                isAtTop
                    ? 'bg-transparent'
                    : 'bg-background/95 backdrop-blur-sm shadow-sm'
            )}
        >
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center gap-2">
                    <img
                        src={BRAND.logo}
                        alt="Attentive.id"
                        className="h-10 w-auto"
                    />
                </a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => handleNavClick(item.href)}
                            className={cn(
                                'text-sm font-medium transition-colors hover:text-primary',
                                isAtTop ? 'text-white' : 'text-foreground'
                            )}
                        >
                            {t(`nav.${item.key}`)}
                        </button>
                    ))}
                    <LanguageSwitcher />
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden flex items-center gap-2">
                    <LanguageSwitcher />
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className={isAtTop ? 'text-white' : ''}>
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[280px]">
                            <div className="flex flex-col gap-4 mt-8">
                                {NAV_ITEMS.map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => handleNavClick(item.href)}
                                        className="text-lg font-medium text-left py-2 hover:text-primary transition-colors"
                                    >
                                        {t(`nav.${item.key}`)}
                                    </button>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    )
}
