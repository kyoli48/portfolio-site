export type Project = {
  title: string
  description: string
  link?: string
  image?: string
  tags?: string[]
  featured?: boolean
  color?: string
  icon?: string
  github?: string
  demo?: string
  status?: 'completed' | 'in-progress' | 'archived'
}

export type BlogPost = {
  title: string
  description: string
  slug: string
  publishedAt: string
  featured?: boolean
  image?: string
  tags?: string[]
  readingTime?: string
}

export type Essay = {
  title: string
  description: string
  slug: string
  publishedAt: string
  featured?: boolean
  category?: string
  tags?: string[]
  readingTime?: string
  source?: string
}

export type NavItem = {
  title: string
  href: string
  external?: boolean
}
