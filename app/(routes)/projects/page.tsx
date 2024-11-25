'use server'

import { ProjectCard } from '@/components/shared/project-card'
import { getContent } from '@/app/api/content'

export default async function ProjectsPage() {
  const projects = await getContent('projects')
  
  return (
    <main className="container py-24 px-4 md:px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Projects</h1>
        <p className="text-xl text-muted-foreground">
          Taking ideas from 0 to 1
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard 
            key={project.metadata.title} 
            project={project}
          />
        ))}
      </div>
    </main>
  )
}
