import { promises as fs } from 'fs'
import path from 'path'
import { parseXMD } from '@/lib/xmd'
import { XMDDocument } from '@/types/xmd'

export type ContentType = 'blog' | 'essays' | 'projects'

export type ContentWithSlug = XMDDocument & {
  slug: string
}

export async function getContent(type: ContentType): Promise<ContentWithSlug[]> {
  const contentDir = path.join(process.cwd(), 'content', type)
  
  try {
    const files = await fs.readdir(contentDir)
    const xmdFiles = files.filter(file => file.endsWith('.xmd'))
    
    const content = await Promise.all(
      xmdFiles.map(async file => {
        const filePath = path.join(contentDir, file)
        const fileContent = await fs.readFile(filePath, 'utf8')
        return {
          ...parseXMD(fileContent, type),
          slug: file.replace(/\.xmd$/, '')
        }
      })
    )
    
    return content.sort((a, b) => {
      if ('date' in a.metadata && 'date' in b.metadata) {
        return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
      }
      return a.metadata.title.localeCompare(b.metadata.title)
    })
  } catch (error) {
    console.error(`Error loading ${type} content:`, error)
    return []
  }
}

export async function getContentBySlug(type: ContentType, slug: string): Promise<ContentWithSlug | null> {
  const contentDir = path.join(process.cwd(), 'content', type)
  const filePath = path.join(contentDir, `${slug}.xmd`)
  
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return {
      ...parseXMD(content, type),
      slug
    }
  } catch (error) {
    console.error(`Error loading ${type} content for slug ${slug}:`, error)
    return null
  }
}
