'use server'

import { getContentBySlug } from '@/app/api/content'
import { ProjectPage } from '@/components/shared/project-page'
import { notFound } from 'next/navigation'

type Props = {
  params: {
    slug: string
  }
}

export default async function ProjectPageRoute({ params }: Props) {
  const project = await getContentBySlug('projects', params.slug)
  
  if (!project) {
    notFound()
  }

  return <ProjectPage content={project} />
}
