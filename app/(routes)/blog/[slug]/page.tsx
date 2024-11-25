'use server'

import { getContentBySlug } from '@/app/api/content'
import { ContentPage } from '@/components/shared/content-page'

type Props = {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getContentBySlug('blog', params.slug)
  return <ContentPage type="blog" content={post} />
}