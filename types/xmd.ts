export type BaseXMDMetadata = {
  title: string
  description: string
  tags?: string[]
  image?: string
  featured?: boolean
  hide?: boolean
}

export type BlogXMDMetadata = BaseXMDMetadata & {
  date: string
  readingTime?: number
  wordCount?: number
  draft?: boolean
  slug: string
}

export type EssayXMDMetadata = BaseXMDMetadata & {
  date: string
  category: string
  readingTime?: number
  wordCount?: number
  slug: string
}

export type ProjectXMDMetadata = BaseXMDMetadata & {
  status: 'completed' | 'in-progress' | 'active'
  color?: string
  github?: string
  demo?: string
  slug: string
}

export type XMDMetadata = BlogXMDMetadata | EssayXMDMetadata | ProjectXMDMetadata

export type XMDBlock = {
  type: 'paragraph' | 'heading' | 'code' | 'quote' | 'list' | 'image' | 'divider'
  content: string // Now supports HTML tags for inline formatting
  level?: number // For headings (1-6)
  language?: string // For code blocks
  items?: string[] // For lists (now supports HTML tags for inline formatting)
  ordered?: boolean // For lists
  alt?: string // For images
  caption?: string // For images and quotes
}

export type XMDDocument = {
  metadata: XMDMetadata
  content: XMDBlock[]
}
