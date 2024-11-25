'use client'

import { ChevronDown } from 'lucide-react'

export function Hero() {
  return (
    <section id="home" className="h-screen flex items-center">
      <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">Alphonsus Koong</h1>
        <h2 className="text-2xl font-muted mb-4">"Al"</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Technophile • Entrepreneur • Explorer  
        </p>
        <ChevronDown className="h-8 w-8 animate-bounce" />
      </div>
    </section>
  )
}
