'use client'

import { XMDDocument } from '@/types/xmd'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProjectCard } from './project-card'

interface ProjectsPreviewProps {
  projects: (XMDDocument & { slug: string })[]
  className?: string
  viewAllPath?: string
}

export function ProjectsPreview({ 
  projects,
  className = '',
  viewAllPath = '/projects'
}: ProjectsPreviewProps) {
  const featuredProjects = projects
    .filter(project => project.metadata.featured)
    .slice(0, 2)

  if (featuredProjects.length === 0) {
    return null
  }

  return (
    <section id="projects" className={`py-24 ${className}`}>
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="mt-2 text-muted-foreground">
              Taking ideas from 0 to 1
            </p>
          </div>
          <Link 
            href={viewAllPath}
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredProjects.map((project) => {
            console.log('Project metadata:', project.metadata) // Debug log
            return (
              <ProjectCard 
                key={project.slug}
                project={project}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
