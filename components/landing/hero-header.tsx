"use client"
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n-client'
import { useTranslations } from '@/lib/i18n-client'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const { locale, setLocale } = useI18n();
    const tNav = useTranslations('navigation')

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' }, 
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    ];

    const menuItems = [
        { name: tNav('menu.features'), href: '#features' },
        { name: tNav('menu.solution'), href: '#how-it-works' },
        { name: tNav('menu.pricing'), href: '#pricing' },
        { name: tNav('menu.about'), href: '#testimonials' },
    ]

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
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12 z-50', isScrolled && 'bg-background/50 max-w-5xl rounded-xl border backdrop-blur-lg lg:px-5 shadow-sm')}> {/* border-radius и тень уменьшены */}
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-2 lg:gap-0 lg:py-2"> {/* py-1 вместо py-3 */}
                        <div className="flex w-full justify-between lg:w-auto">
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

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-6 text-sm">
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

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-2 hidden w-full flex-wrap items-center justify-end space-y-4 rounded-xl border p-4 shadow-sm md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-4 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent"> {/* mb-2, p-4, rounded-xl, shadow-sm */}
                            <div className="lg:hidden">
                                <ul className="space-y-4 text-base">
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
                            <div className="flex w-full flex-col space-y-2 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit items-center">
                                {/* Language Switcher */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="px-2 py-1 text-xs mr-2">
                                      <span className="mr-1">{languages.find(l => l.code === locale)?.flag}</span>
                                      {languages.find(l => l.code === locale)?.label}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {languages.map((lang) => (
                                      <DropdownMenuItem
                                        key={lang.code}
                                        onSelect={() => setLocale(lang.code as any)}
                                        className={cn('flex items-center', locale === lang.code && 'font-bold text-blue-600')}
                                      >
                                        <span className="mr-2">{lang.flag}</span>
                                        {lang.label}
                                        {locale === lang.code && <span className="ml-auto">✓</span>}
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