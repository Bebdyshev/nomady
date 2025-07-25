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
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12 z-50', isScrolled && 'bg-background/50 max-w-4xl rounded-xl border backdrop-blur-lg lg:px-5 shadow-sm')}> {/* border-radius и тень уменьшены */}
                    <div className={cn('relative flex flex-wrap items-center justify-between gap-6 py-2 lg:gap-0 lg:py-2', 'items-center')}> {/* Added items-center for vertical alignment */}
                        <div className="flex w-full justify-between lg:w-auto items-center"> {/* Added items-center for vertical alignment */}
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
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="flex items-center"> {/* Меню и правый блок теперь flex-1 */}
                            <div className="hidden lg:block flex-1">
                                <ul className={cn("flex gap-8 text-sm text-white", isScrolled && 'text-blue-600')}> {/* Ensure items-center for vertical alignment */}
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
                            </div>
                            <div className="flex items-center gap-2 ml-8"> {/* Явный отступ между меню и языковым дропдауном */}
                                {/* Language Dropdown и кнопки */}
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
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}
                                >
                                    <Link href="/auth">
                                        <span>{tNav('signIn')}</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}
                                >
                                    <Link href="/auth">
                                        <span>{tNav('planTrip')}</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}
                                >
                                    <Link href="/auth">
                                        <span>{tNav('getStarted')}</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
} 