'use client'

import { XMDDocument } from '@/types/xmd'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ContentCard } from './content-card'
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
    .slice(0, 2)
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredContent.map((item) => (
            type === 'blog' ? (
              <BlogCard key={item.slug} content={item} />
            ) : (
              <ContentCard 
                key={item.slug} 
                content={item} 
                type="essay"
                showWordCount
              />
            )
          ))}
        </div>
      </div>
    </section>
  )
}
