/**
 * URL slug generation utilities
 */

export const slugify = {
  /**
   * Convert a string to a URL-friendly slug
   */
  create: (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  },

  /**
   * Create a unique slug by appending a number if necessary
   */
  createUnique: (text: string, existingSlugs: string[] = []): string => {
    const baseSlug = slugify.create(text)
    
    if (!existingSlugs.includes(baseSlug)) {
      return baseSlug
    }

    let counter = 1
    let uniqueSlug = `${baseSlug}-${counter}`

    while (existingSlugs.includes(uniqueSlug)) {
      counter++
      uniqueSlug = `${baseSlug}-${counter}`
    }

    return uniqueSlug
  },

  /**
   * Create a slug with a maximum length
   */
  createTruncated: (text: string, maxLength: number = 50): string => {
    const slug = slugify.create(text)
    
    if (slug.length <= maxLength) {
      return slug
    }

    // Truncate at the last complete word before maxLength
    const truncated = slug.substring(0, maxLength)
    const lastHyphen = truncated.lastIndexOf('-')
    
    return lastHyphen > 0 ? truncated.substring(0, lastHyphen) : truncated
  },

  /**
   * Create a slug for video titles with special handling
   */
  createVideoSlug: (title: string, id?: string): string => {
    const slug = slugify.createTruncated(title, 60)
    
    // If we have an ID, append a shortened version
    if (id) {
      const shortId = id.substring(0, 8)
      return `${slug}-${shortId}`
    }
    
    return slug
  },

  /**
   * Create a slug for party rooms
   */
  createPartySlug: (name: string, host: string): string => {
    const nameSlug = slugify.create(name)
    const hostSlug = slugify.create(host)
    
    return `${nameSlug}-by-${hostSlug}`
  },

  /**
   * Validate if a string is a valid slug
   */
  isValid: (slug: string): boolean => {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugPattern.test(slug) && slug.length > 0 && slug.length <= 100
  },

  /**
   * Extract readable text from a slug
   */
  toTitle: (slug: string): string => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  },

  /**
   * Generate a random slug for temporary or anonymous content
   */
  generateRandom: (prefix: string = 'item', length: number = 8): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = prefix + '-'
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    
    return result
  }
}
