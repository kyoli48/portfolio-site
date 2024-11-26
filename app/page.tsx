import { Suspense } from 'react'
import { AboutSection } from '@/components/about/about-section'
import { ProjectsPreview } from '@/components/shared/projects-preview'
import { ContentPreview } from '@/components/shared/content-preview'
import { getContent } from './api/content'
import { Hero } from '@/components/hero/hero'
import { ThreeSceneWrapper } from '@/components/three/scene-wrapper'

export default async function Home() {
  const [projects, blogPosts, essays] = await Promise.all([
    getContent('projects'),
    getContent('blog'),
    getContent('essays')
  ])
  
  return (
    <>
      {/* Main content container */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row">
        {/* Main Content */}
        <main className="w-full md:w-1/2">
          <Suspense fallback={null}>
            <Hero />
          </Suspense>
          <AboutSection />
          <ProjectsPreview projects={projects} />
          <ContentPreview 
            type="blog"
            title="From the Blog"
            subtitle="Shower thoughts and serendipitous adventures"
            content={blogPosts}
          />
          <ContentPreview 
            type="essay"
            title="Essays"
            subtitle="Longer-form musings"
            content={essays}
            className="pb-32"
          />
        </main>

        {/* Three.js Scene */}
        <Suspense fallback={null}>
          <ThreeSceneWrapper />
        </Suspense>
      </div>
    </>
  )
}