import { XMDBlock } from '@/types/xmd'

const WORDS_PER_MINUTE = 200 // Average reading speed

export function calculateReadingTime(blocks: XMDBlock[]): number {
  const wordCount = calculateWordCount(blocks)
  return Math.ceil(wordCount / WORDS_PER_MINUTE)
}

export function calculateWordCount(blocks: XMDBlock[]): number {
  return blocks.reduce((count, block) => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
      case 'quote':
        return count + countWords(block.content)
      case 'list':
        return count + (block.items?.reduce((itemCount, item) => 
          itemCount + countWords(item), 0) || 0)
      case 'code':
        // Count code blocks as 1/4 of their word count since they're read slower
        return count + Math.ceil(countWords(block.content) * 0.25)
      default:
        return count
    }
  }, 0)
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).length
}
