'use server'

import { getContentBySlug } from '@/app/api/content'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'
import { CodeBlock } from '@/components/shared/code-block'

export default async function EssayPage({
  params,
}: {
  params: { slug: string }
}) {
  const essay = await getContentBySlug('essays', params.slug)
  if (!essay) notFound()

  const { metadata, content } = essay

  return (
    <main className="container max-w-3xl py-24 px-4 md:px-6">
      {/* Essay Header */}
      <header className="mb-12">
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
        
        <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={metadata.date}>
              {format(new Date(metadata.date), 'MMMM d, yyyy')}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{metadata.readingTime} min read</span>
          </div>
        </div>

        <p className="text-xl text-muted-foreground">
          {metadata.description}
        </p>
      </header>

      {/* Essay Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none">
        {content.map((block, index) => {
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
