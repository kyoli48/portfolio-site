'use client'

import { XMDDocument } from '@/types/xmd'
import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import Image from 'next/image'
import { ArrowLeft, Clock, Calendar, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { CodeBlock } from './code-block'

type ContentPageProps = {
  type: 'blog' | 'essay'
  content: XMDDocument & { slug: string }
}

export function ContentPage({ type, content }: ContentPageProps) {
  if (!content) {
    notFound()
  }

  const { metadata } = content
  const backLink = type === 'blog' ? '/blog' : '/essays'
  const backText = type === 'blog' ? 'Back to Blog' : 'Back to Essays'
  
  // Parse date once and format it
  const date = parseISO(metadata.date)
  const formattedDate = format(date, 'MMMM d, yyyy')

  return (
    <main className="container py-24 px-4 md:px-6">
      {/* Back Link */}
      <Link 
        href={backLink}
        className="
          inline-flex items-center gap-2 mb-12
          text-sm font-medium text-muted-foreground
          hover:text-foreground transition-colors
        "
      >
        <ArrowLeft className="h-4 w-4" />
        {backText}
      </Link>

      <article className="prose prose-lg prose-invert mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-12 not-prose">
          {metadata.image && (
            <div className="relative aspect-[2/1] mb-8 rounded-lg overflow-hidden">
              <Image
                src={metadata.image}
                alt={metadata.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {metadata.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={metadata.date}>{formattedDate}</time>
            </div>

            {/* Reading Time (Essays Only) */}
            {type === 'essay' && 'readingTime' in metadata && metadata.readingTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{metadata.readingTime} min read</span>
              </div>
            )}

            {/* Word Count (Essays Only) */}
            {type === 'essay' && 'wordCount' in metadata && metadata.wordCount && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{metadata.wordCount.toLocaleString()} words</span>
              </div>
            )}

            {/* Tags (Blog Posts Only) */}
            {type === 'blog' && 'tags' in metadata && metadata.tags && metadata.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {metadata.tags.map(tag => (
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
              </div>
            )}
          </div>

          <p className="text-xl text-muted-foreground">
            {metadata.description}
          </p>
        </header>

        {/* Content */}
        {content.content.map((block, index) => {
          switch (block.type) {
            case 'heading':
              const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements
              return (
                <HeadingTag key={index} className="scroll-m-20">
                  {block.content}
                </HeadingTag>
              )
            case 'paragraph':
              return <p key={index}>{block.content}</p>
            case 'image':
              return (
                <figure key={index} className="my-8">
                  <div className="relative w-full rounded-lg overflow-hidden">
                    <Image
                      src={block.content}
                      alt={block.alt || ''}
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                    />
                  </div>
                  {block.caption && (
                    <figcaption className="text-center text-sm text-muted-foreground mt-2">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )
            case 'code':
              return (
                <div key={index} className="not-prose">
                  <CodeBlock 
                    code={block.content} 
                    language={block.language}
                  />
                </div>
              )
            case 'quote':
              return (
                <blockquote key={index}>
                  {block.content}
                </blockquote>
              )
            case 'list':
              const ListTag = block.ordered ? 'ol' : 'ul'
              return (
                <ListTag key={index}>
                  {block.items?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ListTag>
              )
            case 'divider':
              return <hr key={index} className="my-8" />
            default:
              return null
          }
        })}
      </article>
    </main>
  )
}
