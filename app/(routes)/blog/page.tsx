'use server'

import { getContent } from '@/app/api/content'
import { BlogCard } from '@/components/blog/blog-card'

export default async function BlogPage() {
  const posts = await getContent('blog')
  
  return (
    <main className="container py-24 px-4 md:px-6">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground">
          Shower thoughts and serendipitous adventures
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} content={post} />
        ))}
      </div>
    </main>
  )
}
