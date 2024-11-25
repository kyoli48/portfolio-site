'use client'

import { XMDDocument } from '@/types/xmd'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Clock } from 'lucide-react'

type ContentCardProps = {
  content: XMDDocument & { slug: string }
  type: 'blog' | 'essay'
  showWordCount?: boolean
}

export function ContentCard({ content, type, showWordCount = false }: ContentCardProps) {
  const isEssay = type === 'essay'
  const { metadata, slug } = content
  const linkPath = isEssay ? `/essays/${slug}` : `/blog/${slug}`

  return (
    <article 
      className={`group relative rounded-xl overflow-hidden transition-all hover:-translate-y-1 ${
        isEssay 
          ? 'bg-background/80 p-6 hover:bg-background' 
          : 'bg-muted hover:bg-muted/80'
      }`}
    >
      {metadata.image && !isEssay && (
        <div className="relative aspect-[2/1] mb-6">
          <Image
            src={metadata.image}
            alt={metadata.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}

      <h3 className="text-xl font-semibold tracking-tight mb-2">
        {metadata.title}
      </h3>
      <p className="text-muted-foreground mb-4">
        {metadata.description}
      </p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {'date' in metadata && (
          <time dateTime={metadata.date}>
            {new Date(metadata.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        )}
        {showWordCount && 'wordCount' in metadata && (
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{metadata.wordCount} words</span>
          </div>
        )}
        {!showWordCount && 'readingTime' in metadata && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{metadata.readingTime} min read</span>
          </div>
        )}
      </div>

      <Link href={linkPath} className="absolute inset-0">
        <span className="sr-only">View {metadata.title}</span>
      </Link>
    </article>
  )
}
