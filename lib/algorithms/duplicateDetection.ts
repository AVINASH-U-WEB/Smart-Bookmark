/**
 * URL Normalization for Duplicate Detection
 * Normalizes URLs by removing common variations to detect duplicates
 */
export function normalizeUrl(url: string): string {
    try {
        const parsed = new URL(url)

        // Remove www prefix
        let hostname = parsed.hostname.replace(/^www\./, '')

        // Remove trailing slashes from pathname
        let pathname = parsed.pathname.replace(/\/$/, '')

        // Combine normalized parts (ignoring query params and hash for duplicate detection)
        const normalized = hostname + pathname

        return normalized.toLowerCase()
    } catch {
        // If URL parsing fails, just return lowercase version
        return url.toLowerCase()
    }
}

/**
 * Check if a URL is a duplicate
 * Compares normalized URLs to detect duplicates
 */
export function isDuplicateUrl(url: string, existingUrls: string[]): boolean {
    const normalized = normalizeUrl(url)
    return existingUrls.some((existing) => normalizeUrl(existing) === normalized)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}
