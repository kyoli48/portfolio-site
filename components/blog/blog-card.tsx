'use client'

import { XMDDocument } from '@/types/xmd'
import Link from 'next/link'
import Image from 'next/image'

type BlogCardProps = {
  content: XMDDocument & { slug: string }
}

export function BlogCard({ content }: BlogCardProps) {
  const { metadata, slug } = content
  const linkPath = `/blog/${slug}`

  return (
    <article className="group relative rounded-xl overflow-hidden transition-all hover:-translate-y-1 bg-muted hover:bg-muted/80">
      {metadata.image && (
        <div className="relative aspect-[2/1] mb-6">
          <Image
            src={metadata.image}
            alt={metadata.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-semibold tracking-tight mb-2">
          {metadata.title}
        </h3>
        <p className="text-muted-foreground mb-4">
          {metadata.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={metadata.date} className="shrink-0">
            {new Date(metadata.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          {'tags' in metadata && metadata.tags && metadata.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {metadata.tags.map(tag => (
                <span 
                  key={tag} 
                  className="
                    px-2.5 py-0.5 rounded-full text-xs font-medium
                    bg-gradient-to-b from-muted-foreground/10 to-muted-foreground/5
                    border border-muted-foreground/10
                    shadow-sm shadow-muted-foreground/5
                    transition-colors
                    hover:from-muted-foreground/15 hover:to-muted-foreground/10
                    hover:border-muted-foreground/15
                  "
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <Link href={linkPath} className="absolute inset-0">
          <span className="sr-only">View {metadata.title}</span>
        </Link>
      </div>
    </article>
  )
}
