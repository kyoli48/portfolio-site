'use client'

import { XMDDocument } from '@/types/xmd'
import Link from 'next/link'
import Image from 'next/image'
import { Github, ExternalLink } from 'lucide-react'

type ProjectCardProps = {
  project: XMDDocument & { slug: string }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { metadata } = project
  
  return (
    <article className="group relative aspect-square rounded-xl overflow-hidden bg-background/80 hover:bg-background transition-all hover:-translate-y-1 border border-border/50">
      {/* Project Image */}
      {metadata.image ? (
        <>
          <div className="relative h-2/3">
            <Image
              src={metadata.image}
              alt={metadata.title}
              fill
              className="object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          </div>
          
          {/* Content for image card */}
          <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col">
            <div className="mb-auto">
              <h3 className="text-xl font-semibold tracking-tight mb-2">{metadata.title}</h3>
              <p className="text-muted-foreground line-clamp-2">{metadata.description}</p>
            </div>
            
            {/* Links */}
            <div className="flex items-center gap-4 mt-4 relative z-10">
              {/* Status Badge */}
              {'status' in metadata && metadata.status && (
                <span className={`
                  text-xs font-medium px-2.5 py-1 rounded-full
                  ${metadata.status === 'completed' 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : metadata.status === 'active'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}
                `}>
                  {metadata.status === 'completed' 
                    ? 'Completed' 
                    : metadata.status === 'active'
                    ? 'Active'
                    : 'In Progress'}
                </span>
              )}

              {/* GitHub Link */}
              {'github' in metadata && metadata.github && (
                <Link
                  href={metadata.github}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View source code on GitHub"
                  onClick={(e) => e.stopPropagation()}
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
                  title="Visit live demo"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Content for text-only card */
        <div className="h-full p-6 flex flex-col">
          <div className="mb-auto">
            <h3 className="text-2xl font-semibold tracking-tight mb-3">{metadata.title}</h3>
            <p className="text-muted-foreground line-clamp-3">{metadata.description}</p>
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-4 mt-4 relative z-10">
            {/* Status Badge */}
            {'status' in metadata && metadata.status && (
              <span className={`
                text-xs font-medium px-2.5 py-1 rounded-full
                ${metadata.status === 'completed' 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : metadata.status === 'active'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}
              `}>
                {metadata.status === 'completed' 
                  ? 'Completed' 
                  : metadata.status === 'active'
                  ? 'Active'
                  : 'In Progress'}
              </span>
            )}

            {/* GitHub Link */}
            {'github' in metadata && metadata.github && (
              <Link
                href={metadata.github}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                title="View source code on GitHub"
                onClick={(e) => e.stopPropagation()}
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
                title="Visit live demo"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Full card link */}
      <Link href={`/projects/${project.slug}`} className="absolute inset-0 z-0">
        <span className="sr-only">View {metadata.title}</span>
      </Link>
    </article>
  )
}
