import { getContentBySlug } from '@/app/api/content'
import { ContentPage } from '@/components/shared/content-page'

interface PageProps {
  params: { slug: string }
  searchParams: Record<string, string | string[] | undefined>
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getContentBySlug('blog', params.slug)
  
  if (!post) return null
  
  // Ensure date is serialized properly
  const serializedPost = {
    ...post,
    metadata: {
      ...post.metadata,
      date: new Date(post.metadata.date).toISOString()
    }
  }
  
  return <ContentPage type="blog" content={serializedPost} />
}