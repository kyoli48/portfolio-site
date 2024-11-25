# Site Architecture

This document explains how content is stored, parsed, and rendered in the portfolio site.

## Content Management

### Storage Structure
All content is stored in `.xmd` files in the `/content` directory, organized by type:
```
/content
  /blog
    building-an-xmd-parser.xmd
    ...
  /essays
    south-china-sea.xmd
    ...
  /projects
    personal-portfolio.xmd
    dorm-room-boba-shop.xmd
    ...
```

Each `.xmd` file contains:
1. YAML frontmatter (metadata between `---`)
2. Markdown-like content below

### Content Loading
Content loading is handled by `app/api/content.ts`:

- `getContent()`: Gets all content of a specific type
  ```typescript
  async function getContent(type: 'blog' | 'essays' | 'projects'): Promise<ContentWithSlug[]>
  ```

- `getContentBySlug()`: Gets a single piece of content by its slug
  ```typescript
  async function getContentBySlug(type: ContentType, slug: string): Promise<ContentWithSlug | null>
  ```

Files are read using Node.js `fs` module, and file names become slugs (e.g., `personal-portfolio.xmd` → `personal-portfolio`).

## Content Parsing

### XMD Parser
The custom XMD parser (`lib/xmd.ts`) converts raw file content into structured data:

```typescript
function parseXMD(content: string, type: 'blog' | 'essays' | 'projects'): XMDDocument {
  // 1. Split metadata and content
  // 2. Parse and validate metadata
  // 3. Convert content into blocks
  // 4. Return structured document
}
```

### Document Structure
Each document is parsed into an `XMDDocument`:
```typescript
interface XMDDocument {
  metadata: {
    title: string
    description: string
    // Type-specific fields:
    // - Blog: date, readingTime
    // - Essays: date, category, readingTime
    // - Projects: status, github?, demo?
  }
  content: XMDBlock[]
}
```

## Page Rendering

### Route Handling
Each content type has its own route handler (`app/(routes)/[type]/[slug]/page.tsx`):

```typescript
export default async function ProjectPageRoute({ params }: Props) {
  const project = await getContentBySlug('projects', params.slug)
  if (!project) notFound()
  return <ProjectPage content={project} />
}
```

### Page Components
Content is rendered by type-specific page components that:
1. Display metadata appropriately for the content type
2. Convert content blocks into React components

Example from `project-page.tsx`:
```typescript
export function ProjectPage({ content }: ProjectPageProps) {
  return (
    <article>
      {/* Metadata */}
      <header>
        <h1>{content.metadata.title}</h1>
        <p>{content.metadata.description}</p>
        {/* Project-specific metadata (status, links) */}
      </header>

      {/* Content */}
      <div className="prose">
        {content.content.map((block) => {
          switch (block.type) {
            case 'heading': return <h{block.level}>{block.content}</h{block.level}>
            case 'paragraph': return <p>{block.content}</p>
            // ... other block types
          }
        })}
      </div>
    </article>
  )
}
```

## Page Load Flow
When a user visits a page (e.g., `/projects/personal-portfolio`):

1. Next.js matches the route pattern
2. Route handler loads and parses the corresponding `.xmd` file
3. Parsed content is passed to the appropriate page component
4. Component renders the metadata and content blocks
5. Result is displayed to the user

## Animation System

The site uses a combination of Framer Motion and CSS animations for smooth, performant interactions.

### Framer Motion Animations

Framer Motion is used for complex, orchestrated animations. Example from the hero section:

```typescript
// Background fade-in
<motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}
>

// Content scale and fade
<motion.div 
  initial={{ scale: 0.95, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
```

Key animation patterns:
1. **Staggered Reveal**: Elements appear in sequence using `delay` in transition
2. **Scale + Fade**: Combines scale and opacity for more engaging entrances
3. **Smooth Transforms**: Uses `easeOut` easing for natural motion

### CSS Animations

CSS animations are used for continuous or simple effects:

```css
.bg-grid-pattern {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

Common uses:
1. **Background Effects**: Subtle patterns and gradients
2. **Hover States**: Interactive elements feedback
3. **Continuous Motion**: Infinite animations like pulses or bounces

### Animation Principles

1. **Progressive Enhancement**: Animations don't block content visibility
2. **Performance First**: Using CSS transforms and opacity for smooth performance
3. **Purposeful Motion**: Animations guide attention and provide feedback
4. **Reduced Motion**: Respects user preferences for reduced motion

## Benefits

This architecture provides several advantages:

1. **Content Management**
   - Content is separate from code
   - Easy to edit (just modify `.xmd` files)
   - Version control friendly

2. **Type Safety**
   - TypeScript ensures correct metadata for each content type
   - Prevents runtime errors from malformed content

3. **Flexibility**
   - Different layouts for different content types
   - Easy to add new content types
   - Custom styling per content type

4. **Performance**
   - Static file-based content
   - No database required
   - Fast page loads
