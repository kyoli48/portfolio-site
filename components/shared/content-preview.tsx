'use client'

import { XMDDocument } from '@/types/xmd'
import Link from 'next/link'
import { ArrowRight, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { BlogCard } from '../blog/blog-card'

type ContentPreviewProps = {
  type: 'blog' | 'essay'
  title: string
  subtitle: string
  content: (XMDDocument & { slug: string })[]
  className?: string
  viewAllPath?: string
}

export function ContentPreview({ 
  type, 
  title, 
  subtitle, 
  content,
  className = '',
  viewAllPath
}: ContentPreviewProps) {
  const featuredContent = content
    .filter(item => item.metadata.featured)
    .slice(0, type === 'blog' ? 2 : 3)
  const defaultViewAllPath = type === 'blog' ? '/blog' : '/essays'

  return (
    <section id={type} className={`py-24 ${className}`}>
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>
          <Link 
            href={viewAllPath || defaultViewAllPath}
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {type === 'blog' ? (
          // Blog Grid
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredContent.map((item) => (
              <BlogCard key={item.slug} content={item} />
            ))}
          </div>
        ) : (
          // Essay List
          <div className="space-y-6">
            {featuredContent.map((item) => (
              <Link 
                key={item.slug} 
                href={`/essays/${item.slug}`}
                className="block group"
              >
                <article className="flex flex-col space-y-4 p-6 hover:bg-muted/50 rounded-xl transition-colors">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {item.metadata.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2">
                    {item.metadata.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={item.metadata.date}>
                        {format(new Date(item.metadata.date), 'MMMM d, yyyy')}
                      </time>
                    </div>
                    {/* Reading Time */}
                    {'readingTime' in item.metadata && item.metadata.readingTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{item.metadata.readingTime} min read</span>
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
