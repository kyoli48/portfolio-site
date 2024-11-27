'use client'

import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { Mail, Github, Linkedin, Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  {
    name: 'About',
    href: '/#about',
  },
  {
    name: 'Projects',
    href: '/projects',
  },
  {
    name: 'Blog',
    href: '/blog',
  },
  {
    name: 'Essays',
    href: '/essays',
  },
]

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main navbar */}
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="text-2xl font-bold">
              AK
            </Link>
            
            {/* Desktop navigation */}
            <nav className="hidden sm:flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => {
                const isActive = item.href === '/' 
                  ? pathname === '/' 
                  : pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative py-1 transition-colors hover:text-foreground after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-foreground after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform ${
                      isActive 
                        ? 'font-bold text-foreground' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="absolute inset-0 h-5 w-5 transition-transform scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute inset-0 h-5 w-5 transition-transform scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
            </button>
            <div className="hidden sm:flex items-center gap-6">
              <Link 
                href="mailto:alphonsus.mun@gmail.com" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
              <Link 
                href="https://github.com/kyoli48" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="https://linkedin.com/in/alphonsusk" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4 text-sm font-medium">
              {navItems.map((item) => {
                const isActive = item.href === '/' 
                  ? pathname === '/' 
                  : pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`transition-colors hover:text-foreground ${
                      isActive 
                        ? 'font-bold text-foreground' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="flex items-center gap-6 mt-6 pt-6 border-t">
              <Link 
                href="mailto:alphonsus.mun@gmail.com" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
              <Link 
                href="https://github.com/kyoli48" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="https://linkedin.com/in/alphonsusk" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
