'use server'

import { ContentCard } from '@/components/shared/content-card'
import { getContent } from '@/app/api/content'

export default async function EssaysPage() {
  const essays = await getContent('essays')
  
  return (
    <main className="container py-24 px-4 md:px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Essays</h1>
        <p className="text-xl text-muted-foreground">
          Longer-form musings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {essays.map((essay) => (
          <ContentCard 
            key={essay.slug} 
            content={essay} 
            type="essay"
          />
        ))}
      </div>
    </main>
  )
}
