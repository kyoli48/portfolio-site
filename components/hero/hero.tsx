'use client'

import { ChevronDown } from 'lucide-react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { useEffect, useState } from 'react'

const MotionDiv = m.div

export function Hero() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToContent = () => {
    const nextSection = document.querySelector('#content')
    nextSection?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!isMounted) {
    return null; // Prevent flash of content during hydration
  }

  return (
    <LazyMotion features={domAnimation}>
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 -z-10"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        </MotionDiv>

        {/* Content */}
        <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4"
        >
          <div className="text-center">
            {/* Name */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
                Alphonsus Koong
              </h1>
            </MotionDiv>

            {/* Roles */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="flex flex-wrap items-center justify-center gap-4 text-xl text-muted-foreground mb-12">
                <span className="px-4 py-1 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors">
                  Technophile
                </span>
                <span className="px-4 py-1 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors">
                  Entrepreneur
                </span>
                <span className="px-4 py-1 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors">
                  Explorer
                </span>
              </div>
            </MotionDiv>

            {/* Scroll Indicator */}
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <button
                onClick={scrollToContent}
                className="
                  inline-flex items-center gap-2 
                  text-sm text-muted-foreground hover:text-foreground 
                  transition-colors cursor-pointer
                "
              >
                <span>Scroll to explore</span>
                <ChevronDown className="h-4 w-4 animate-bounce" />
              </button>
            </MotionDiv>
          </div>
        </MotionDiv>
      </section>
    </LazyMotion>
  )
}
