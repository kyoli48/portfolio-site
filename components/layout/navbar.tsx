'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Mail, Github, Linkedin } from 'lucide-react'

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
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold">
            AK
          </Link>
          
          <nav className="flex items-center space-x-6 text-sm font-medium">
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

        <div className="flex items-center gap-6">
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
    </header>
  )
}
