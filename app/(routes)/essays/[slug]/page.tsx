'use server'

import { getContentBySlug } from '@/app/api/content'
import { ContentPage } from '@/components/shared/content-page'

type Props = {
  params: {
    slug: string
  }
}

export default async function EssayPage({ params }: Props) {
  const essay = await getContentBySlug('essays', params.slug)
  return <ContentPage type="essay" content={essay} />
}