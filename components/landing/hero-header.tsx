"use client"
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import React from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n-client'
import { useTranslations } from '@/lib/i18n-client'

export const HeroHeader = () => {
    const tNav = useTranslations('navigation')
    const menuItems = [
        { name: tNav('menu.features'), href: '#features' },
        { name: tNav('menu.solution'), href: '#howItWorks' },
        { name: tNav('menu.pricing'), href: '#pricing' },
        { name: tNav('menu.about'), href: '#testimonials' },
    ]
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const { locale, setLocale } = useI18n();

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' }, 
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    ];
    const currentLang = languages.find(l => l.code === locale) || languages[0];

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-50 w-full px-1">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12 z-50', isScrolled && 'bg-background/50 max-w-4xl rounded-xl border backdrop-blur-lg lg:px-5 shadow-sm')}>
                    <div className={cn('relative flex flex-wrap items-center justify-between gap-6 py-2 lg:gap-0 lg:py-2', 'items-center')}>
                        <div className="flex w-full justify-between lg:w-auto items-center">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                                <span className="text-2xl font-bold text-blue-600">Nomady</span>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                {menuState ? <X className="size-6" /> : <Menu className="size-6" />}
                            </button>
                        </div>

                        {/* Desktop menu */}
                        <div className="hidden lg:flex items-center flex-1">
                            <ul className={cn("flex gap-8 text-sm text-white", isScrolled && 'text-blue-600')}>
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-2 ml-8">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="x-2 py-1 text-xs font-bold border-blue-600 text-blue-600 flex items-center">
                                      <span className="mr-1">{currentLang.flag}</span>{currentLang.label}
                                      <svg className="ml-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.584l3.71-3.354a.75.75 0 111.02 1.1l-4.25 3.846a.75.75 0 01-1.02 0l-4.25-3.846a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {languages.map((lang) => (
                                      <DropdownMenuItem
                                        key={lang.code}
                                        onSelect={() => setLocale(lang.code as any)}
                                        className={cn('flex items-center px-2 py-1 text-xs', locale === lang.code && 'font-bold text-blue-600')}
                                      >
                                        <span className="mr-2">{lang.flag}</span>{lang.label}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/auth">
                                        <span>{tNav('signIn')}</span>
                                    </Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href="/auth">
                                        <span>{tNav('planTrip')}</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Mobile menu overlay */}
                        {menuState && (
                            <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMenuState(false)} />
                        )}
                        {/* Mobile menu dropdown */}
                        {menuState && (
                            <div className={cn(
                                "fixed top-0 left-0 w-full z-50 transition-transform duration-300 lg:hidden",
                                menuState ? "translate-y-0" : "-translate-y-full",
                                "bg-white border-b border-slate-200 shadow-md"
                            )} style={{ pointerEvents: menuState ? 'auto' : 'none' }}>
                                <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Link href="/" className="flex items-center space-x-2" onClick={() => setMenuState(false)}>
                                            <Logo />
                                            <span className="text-2xl font-bold text-blue-600">Nomady</span>
                                        </Link>
                                        <button onClick={() => setMenuState(false)} aria-label="Close Menu" className="p-2">
                                            <X className="size-6" />
                                        </button>
                                    </div>
                                    <ul className="flex flex-col gap-4 text-blue-700 text-lg font-medium">
                                        {menuItems.map((item, index) => (
                                            <li key={index}>
                                                <Link href={item.href} onClick={() => setMenuState(false)}>
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex flex-col gap-2 mt-4">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="x-2 py-1 text-xs font-bold border-blue-600 text-blue-600 flex items-center">
                                              <span className="mr-1">{currentLang.flag}</span>{currentLang.label}
                                              <svg className="ml-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.584l3.71-3.354a.75.75 0 111.02 1.1l-4.25 3.846a.75.75 0 01-1.02 0l-4.25-3.846a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="start">
                                            {languages.map((lang) => (
                                              <DropdownMenuItem
                                                key={lang.code}
                                                onSelect={() => setLocale(lang.code as any)}
                                                className={cn('flex items-center px-2 py-1 text-xs', locale === lang.code && 'font-bold text-blue-600')}
                                              >
                                                <span className="mr-2">{lang.flag}</span>{lang.label}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button asChild variant="outline" size="sm" className="w-full">
                                            <Link href="/auth" onClick={() => setMenuState(false)}>
                                                <span>{tNav('signIn')}</span>
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm" className="w-full">
                                            <Link href="/auth" onClick={() => setMenuState(false)}>
                                                <span>{tNav('planTrip')}</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
} 