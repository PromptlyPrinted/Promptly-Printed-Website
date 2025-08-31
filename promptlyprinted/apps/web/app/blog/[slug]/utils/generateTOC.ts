export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Generate table of contents from markdown/HTML content
 */
export function generateTableOfContents(content: string): TOCItem[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  // Match markdown headings (# ## ###) or HTML headings (<h1> <h2> etc)
  const markdownHeadings = content.match(/(^|\n)(#{1,6})\s+(.+)/g) || [];
  const htmlHeadings = content.match(/<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi) || [];
  
  const toc: TOCItem[] = [];
  
  // Process markdown headings
  markdownHeadings.forEach((heading, index) => {
    const level = (heading.match(/#/g) || []).length;
    const text = heading.replace(/^\n?#+\s*/, '').trim();
    const id = generateSlug(text);
    
    toc.push({
      id,
      text,
      level
    });
  });
  
  // Process HTML headings
  htmlHeadings.forEach((heading, index) => {
    const levelMatch = heading.match(/<h([1-6])/i);
    const textMatch = heading.match(/>([^<]+)</);
    
    if (levelMatch && textMatch) {
      const level = parseInt(levelMatch[1]);
      const text = textMatch[1].trim();
      const id = generateSlug(text);
      
      toc.push({
        id,
        text,
        level
      });
    }
  });
  
  // Sort by order of appearance (assuming sequential processing maintains order)
  return toc;
}

/**
 * Generate URL-friendly slug from text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Extract content summary/excerpt from markdown content
 */
export function extractExcerpt(content: string, maxLength = 160): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove markdown formatting
  const cleanContent = content
    .replace(/#{1,6}\s+/g, '') // Remove heading markers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/`([^`]+)`/g, '$1') // Remove code markers
    .replace(/>\s*/g, '') // Remove blockquote markers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete word within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return lastSpaceIndex > 0 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
}

/**
 * Estimate reading time based on content
 */
export function calculateReadingTime(content: string): string {
  if (!content || typeof content !== 'string') {
    return '1 min';
  }

  // Remove markdown formatting for word count
  const cleanContent = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/>\s*/g, '')
    .trim();

  const wordsPerMinute = 200;
  const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return minutes === 1 ? '1 min' : `${minutes} min`;
}