'use client'

import { XMDDocument } from '@/types/xmd'
import { Github, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CodeBlock } from './code-block'

type ProjectPageProps = {
  content: XMDDocument & { slug: string }
}

export function ProjectPage({ content }: ProjectPageProps) {
  const { metadata } = content

  return (
    <article className="container max-w-4xl mx-auto px-4 py-24">
      {/* Header */}
      <header className="mb-12">
        {metadata.image && (
          <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden">
            <Image
              src={metadata.image}
              alt={metadata.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {metadata.title}
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          {metadata.description}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Status Badge */}
          {'status' in metadata && metadata.status && (
            <span className={`
              text-sm font-medium px-3 py-1 rounded-full
              ${metadata.status === 'completed' 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}
            `}>
              {metadata.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
          )}

          {/* Links */}
          <div className="flex items-center gap-4">
            {/* GitHub Link */}
            {'github' in metadata && metadata.github && (
              <Link
                href={metadata.github}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                View Source
              </Link>
            )}
            
            {/* Demo Link */}
            {'demo' in metadata && metadata.demo && (
              <Link
                href={metadata.demo}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-5 w-5" />
                Live Demo
              </Link>
            )}
          </div>

          {/* Tags */}
          {metadata.tags && metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map((tag) => (
                <span 
                  key={tag}
                  className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
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
      </div>
    </article>
  )
}
