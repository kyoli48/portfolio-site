'use server'

import { getContent } from '@/app/api/content'
import Link from 'next/link'
import { ArrowRight, Clock, BookOpen } from 'lucide-react'

export default async function EssaysPage() {
  const essays = await getContent('essays')
  
  return (
    <main className="container py-24 px-4 md:px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Essays</h1>
        <p className="text-xl text-muted-foreground">
          Longer-form musings
        </p>
      </div>

      <div className="max-w-2xl">
        {essays.map((essay) => (
          <Link 
            key={essay.slug}
            href={`/essays/${essay.slug}`}
            className="
              group block p-6 mb-4 rounded-lg
              bg-background/80 hover:bg-background
              transition-all hover:-translate-y-1
            "
          >
            <h2 className="text-xl font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors">
              {essay.metadata.title}
            </h2>
            <p className="text-muted-foreground mb-4">
              {essay.metadata.description}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {/* Date */}
              <time dateTime={essay.metadata.date}>
                {new Date(essay.metadata.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>

              {/* Reading Time */}
              {'readingTime' in essay.metadata && essay.metadata.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{essay.metadata.readingTime} min read</span>
                </div>
              )}

              {/* Word Count */}
              {'wordCount' in essay.metadata && essay.metadata.wordCount && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{essay.metadata.wordCount.toLocaleString()} words</span>
                </div>
              )}

              {/* Read More Arrow */}
              <ArrowRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
