'use client'

import { XMDDocument } from '@/types/xmd'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Github, ExternalLink } from 'lucide-react'

type ProjectCardProps = {
  project: XMDDocument & { slug: string }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { metadata } = project
  
  return (
    <article className="group relative rounded-xl overflow-hidden bg-background/80 hover:bg-background transition-all hover:-translate-y-1">
      {/* Project Image */}
      {metadata.image && (
        <div className="relative aspect-square">
          <Image
            src={metadata.image}
            alt={metadata.title}
            fill
            className="object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
        </div>
      )}
      
      {/* Content */}
      <div className={`p-6 ${metadata.image ? '-mt-16 relative' : ''}`}>
        <h3 className="text-xl font-semibold tracking-tight mb-2">{metadata.title}</h3>
        <p className="text-muted-foreground mb-4">{metadata.description}</p>
        
        {/* Tags */}
        {'tags' in metadata && metadata.tags && metadata.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-6">
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
              Github
            </Link>
          )}
          
          {/* Demo Link */}
          {'demo' in metadata && metadata.demo && (
            <Link
              href={metadata.demo}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
