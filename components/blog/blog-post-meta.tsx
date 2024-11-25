'use client'

import { Tag } from 'lucide-react'
import { XMDDocument } from '@/types/xmd'

type BlogPostMetaProps = {
  metadata: XMDDocument['metadata']
}

export function BlogPostMeta({ metadata }: BlogPostMetaProps) {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <time dateTime={metadata.date}>
        {new Date(metadata.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
      {'tags' in metadata && metadata.tags && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-4 w-4" />
          <div className="flex gap-2 flex-wrap">
            {metadata.tags.split(',').map(tag => (
              <span 
                key={tag.trim()} 
                className="bg-muted-foreground/10 px-2 py-0.5 rounded-full text-xs"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
