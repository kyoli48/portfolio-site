'use client'

import { XMDDocument } from '@/types/xmd'
import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'

type BlogCardProps = {
  content: XMDDocument & { slug: string }
}

export function BlogCard({ content }: BlogCardProps) {
  const { metadata, slug } = content
  const linkPath = `/blog/${slug}`

  return (
    <article className="group relative flex flex-col rounded-xl overflow-hidden bg-background/80 hover:bg-background transition-all hover:-translate-y-1 border border-border">
      {metadata.image ? (
        <>
          {/* Image Card */}
          <div className="relative aspect-[2/1]">
            <Image
              src={metadata.image}
              alt={metadata.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/0" />
          </div>
          <div className="flex-1 p-6 -mt-12 relative">
            <h3 className="text-xl font-semibold tracking-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {metadata.title}
            </h3>
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {metadata.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={metadata.date} className="shrink-0">
                {new Date(metadata.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              {'readingTime' in metadata && metadata.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{metadata.readingTime} min read</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {'tags' in metadata && metadata.tags && metadata.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-4">
                {metadata.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag} 
                    className="
                      px-2.5 py-0.5 rounded-full text-xs font-medium
                      bg-gradient-to-b from-muted-foreground/10 to-muted-foreground/5
                      border border-muted-foreground/10
                      shadow-sm shadow-muted-foreground/5
                    "
                  >
                    {tag}
                  </span>
                ))}
                {metadata.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{metadata.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Text-only Card */}
          <div className="flex-1 p-6">
            <h3 className="text-xl font-semibold tracking-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {metadata.title}
            </h3>
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {metadata.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={metadata.date} className="shrink-0">
                {new Date(metadata.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              {'readingTime' in metadata && metadata.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{metadata.readingTime} min read</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {'tags' in metadata && metadata.tags && metadata.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-4">
                {metadata.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag} 
                    className="
                      px-2.5 py-0.5 rounded-full text-xs font-medium
                      bg-gradient-to-b from-muted-foreground/10 to-muted-foreground/5
                      border border-muted-foreground/10
                      shadow-sm shadow-muted-foreground/5
                    "
                  >
                    {tag}
                  </span>
                ))}
                {metadata.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{metadata.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <Link href={linkPath} className="absolute inset-0">
        <span className="sr-only">Read {metadata.title}</span>
      </Link>
    </article>
  )
}
