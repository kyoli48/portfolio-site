import { getContentBySlug } from '@/app/api/content'
import { ContentPage } from '@/components/shared/content-page'

interface GenerateMetadataProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: GenerateMetadataProps) {
  const post = await getContentBySlug('blog', params.slug)
  if (!post) return {}
  
  return {
    title: post.metadata.title,
    description: post.metadata.description,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
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