'use client'

import { XMDBlock } from '@/types/xmd'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface XMDRendererProps {
  blocks: XMDBlock[]
  className?: string
}

export function XMDRenderer({ blocks, className }: XMDRendererProps) {
  return (
    <article className={cn('prose prose-zinc dark:prose-invert max-w-none', className)}>
      {blocks.map((block, index) => {
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
          
          case 'code':
            return (
              <pre key={index} className="relative">
                <div className="absolute top-3 right-3 text-xs text-muted-foreground">
                  {block.language}
                </div>
                <code className={`language-${block.language}`}>
                  {block.content}
                </code>
              </pre>
            )
          
          case 'quote':
            return (
              <blockquote key={index}>
                {block.content}
                {block.caption && (
                  <cite className="block mt-2 text-sm text-muted-foreground">
                    — {block.caption}
                  </cite>
                )}
              </blockquote>
            )
          
          case 'list':
            const ListTag = block.ordered ? 'ol' : 'ul'
            return (
              <ListTag key={index}>
                {block.items?.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ListTag>
            )
          
          case 'image':
            return (
              <figure key={index} className="relative">
                <div className="aspect-[2/1] relative">
                  <Image
                    src={block.content}
                    alt={block.alt || ''}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-center mt-2 text-sm text-muted-foreground">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
          
          case 'divider':
            return <hr key={index} className="my-8" />
          
          default:
            return null
        }
      })}
    </article>
  )
}
