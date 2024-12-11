import { XMDDocument, XMDBlock, XMDMetadata, BlogXMDMetadata, EssayXMDMetadata, ProjectXMDMetadata, BaseXMDMetadata } from '@/types/xmd'
import { calculateReadingTime, calculateWordCount } from './utils/content'

type RawMetadata = Partial<BaseXMDMetadata> & {
  date?: string
  category?: string
  status?: 'completed' | 'in-progress' | 'active'
  color?: string
  github?: string
  demo?: string
  draft?: string | boolean
  featured?: string | boolean
  hide?: string | boolean
}

function validateMetadata(metadata: RawMetadata, type: 'blog' | 'essays' | 'projects'): XMDMetadata {
  // Validate base metadata
  if (!metadata.title || !metadata.description) {
    throw new Error('Required base metadata fields missing (title, description)')
  }

  // Convert tags to array if needed
  if (metadata.tags) {
    if (typeof metadata.tags === 'string') {
      // Handle comma-separated string format
      metadata.tags = metadata.tags.split(',').map((tag: string) => tag.trim())
    } else if (Array.isArray(metadata.tags)) {
      // Handle YAML array format (already an array)
      metadata.tags = metadata.tags.map((tag: string) => String(tag).trim())
    } else {
      // Invalid format
      delete metadata.tags
    }
  }

  // Convert boolean strings
  if (typeof metadata.featured === 'string') {
    metadata.featured = metadata.featured.toLowerCase() === 'true'
  }
  if (typeof metadata.draft === 'string') {
    metadata.draft = metadata.draft.toLowerCase() === 'true'
  }
  if (typeof metadata.hide === 'string') {
    metadata.hide = metadata.hide.toLowerCase() === 'true'
  }

  // Validate type-specific metadata
  switch (type) {
    case 'blog':
      if (!metadata.date) {
        throw new Error('Required blog metadata fields missing (date)')
      }
      return metadata as BlogXMDMetadata
    
    case 'essays':
      if (!metadata.date || !metadata.category) {
        throw new Error('Required essay metadata fields missing (date, category)')
      }
      return metadata as EssayXMDMetadata
    
    case 'projects':
      if (!metadata.status) {
        throw new Error('Required project metadata fields missing (status)')
      }
      return metadata as ProjectXMDMetadata
    
    default:
      throw new Error('Invalid content type')
  }
}

export function parseXMD(content: string, type: 'blog' | 'essays' | 'projects'): XMDDocument {
  const lines = content.split('\n')
  let currentLine = 0
  
  // Parse metadata
  if (lines[currentLine] !== '---') {
    throw new Error('XMD must start with metadata section marked by ---')
  }
  currentLine++
  
  const metadata: RawMetadata = {}
  let inTagsBlock = false

  while (currentLine < lines.length && lines[currentLine] !== '---') {
    const line = lines[currentLine].trim()
    
    if (line) {
      if (line === 'tags:') {
        // Start of tags block
        inTagsBlock = true
        metadata.tags = []
        currentLine++
        continue
      }

      if (inTagsBlock && line.startsWith('-')) {
        // Add tag to array
        metadata.tags.push(line.slice(1).trim())
      } else {
        // End of tags block or regular key-value pair
        inTagsBlock = false
        const [key, ...valueParts] = line.split(':')
        const value = valueParts.join(':').trim()
        
        // Handle special cases
        if (key.trim() === 'tags' && !Array.isArray(metadata.tags)) {
          // Handle inline tags (comma-separated)
          metadata.tags = value.split(',').map(tag => tag.trim())
        } else {
          metadata[key.trim()] = value
        }
      }
    }
    
    currentLine++
  }

  if (currentLine >= lines.length || lines[currentLine] !== '---') {
    throw new Error('Metadata section must end with ---')
  }
  currentLine++

  // Validate and process metadata
  const validatedMetadata = validateMetadata(metadata, type)

  let currentBlock: XMDBlock | null = null
  const blocks: XMDBlock[] = []
  
  // Parse content
  while (currentLine < lines.length) {
    const line = lines[currentLine]
    
    if (line.startsWith('![')) {
      // Image syntax: ![alt text](url "optional caption")
      const altEnd = line.indexOf(']')
      const urlStart = line.indexOf('(', altEnd)
      const urlEnd = line.indexOf(')', urlStart)
      const captionStart = line.indexOf('"', urlStart)
      const captionEnd = line.lastIndexOf('"')

      if (altEnd > 0 && urlStart > 0 && urlEnd > 0) {
        if (currentBlock) blocks.push(currentBlock as XMDBlock)
        
        const alt = line.slice(2, altEnd)
        const url = line.slice(urlStart + 1, captionStart > urlStart ? captionStart - 1 : urlEnd)
        const caption = captionStart > 0 && captionEnd > captionStart
          ? line.slice(captionStart + 1, captionEnd)
          : undefined

        blocks.push({
          type: 'image',
          content: url,
          alt,
          caption
        })
        currentBlock = null
      }
    } else if (line.startsWith('```')) {
      // Code block
      const language = line.slice(3).trim()
      let codeContent = ''
      currentLine++

      while (currentLine < lines.length && !lines[currentLine].startsWith('```')) {
        codeContent += lines[currentLine] + '\n'
        currentLine++
      }

      if (currentBlock) blocks.push(currentBlock as XMDBlock)
      blocks.push({
        type: 'code',
        content: codeContent.trim(),
        language
      })
      currentBlock = null
    } else if (line.match(/^#{1,6}\s/)) {
      // Headings (h1-h6)
      if (currentBlock) blocks.push(currentBlock as XMDBlock)
      const level = line.match(/^(#{1,6})\s/)[1].length
      currentBlock = {
        type: 'heading',
        level,
        content: line.slice(level + 1).trim()
      }
    } else if (line.startsWith('> ')) {
      // Blockquotes
      if (currentBlock) blocks.push(currentBlock as XMDBlock)
      const match = line.match(/^> (.*?)(?:\s*{(.*)})?$/)
      if (match) {
        const [, content, caption] = match
        currentBlock = {
          type: 'quote',
          content: content.trim(),
          caption
        }
      }
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Unordered lists
      if (currentBlock?.type !== 'list' || currentBlock.ordered) {
        if (currentBlock) blocks.push(currentBlock as XMDBlock)
        currentBlock = {
          type: 'list',
          ordered: false,
          items: []
        }
      }
      currentBlock.items?.push(processInlineFormatting(line.slice(2).trim()))
    } else if (line.match(/^\d+\. /)) {
      // Ordered lists
      if (currentBlock?.type !== 'list' || !currentBlock.ordered) {
        if (currentBlock) blocks.push(currentBlock as XMDBlock)
        currentBlock = {
          type: 'list',
          ordered: true,
          items: []
        }
      }
      currentBlock.items?.push(processInlineFormatting(line.replace(/^\d+\. /, '').trim()))
    } else if (line.startsWith('---')) {
      // Divider
      if (currentBlock) blocks.push(currentBlock as XMDBlock)
      blocks.push({
        type: 'divider',
        content: ''
      })
      currentBlock = null
    } else if (line.trim()) {
      // Paragraphs with inline formatting
      if (!currentBlock || currentBlock.type !== 'paragraph') {
        if (currentBlock) blocks.push(currentBlock as XMDBlock)
        currentBlock = {
          type: 'paragraph',
          content: processInlineFormatting(line.trim())
        }
      } else {
        currentBlock.content += ' ' + processInlineFormatting(line.trim())
      }
    } else if (currentBlock) {
      // Empty line - end current paragraph block
      blocks.push(currentBlock as XMDBlock)
      currentBlock = null
    }
    
    currentLine++
  }
  
  if (currentBlock) blocks.push(currentBlock as XMDBlock)
  
  // Calculate reading time and word count for blog and essay content
  if (type === 'blog' || type === 'essays') {
    const wordCount = calculateWordCount(blocks)
    const readingTime = calculateReadingTime(blocks)
    metadata.wordCount = wordCount
    metadata.readingTime = readingTime
  }

  return {
    metadata: validatedMetadata,
    content: blocks
  }
}

// Helper function for inline formatting
function processInlineFormatting(text: string): string {
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
  text = text.replace(/_(.+?)_/g, '<em>$1</em>')
  
  // Strikethrough
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>')
  
  // Inline code
  text = text.replace(/`(.+?)`/g, '<code>$1</code>')
  
  return text
}
