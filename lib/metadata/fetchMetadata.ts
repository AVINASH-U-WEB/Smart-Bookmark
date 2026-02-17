/**
 * Fetch Open Graph Metadata from URL
 * Extracts title, description, image, and favicon
 */
export interface OpenGraphData {
    title: string
    description: string
    ogImage: string | null
    favicon: string | null
}

export async function fetchOpenGraphData(url: string): Promise<OpenGraphData> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)',
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const html = await response.text()
        const urlObj = new URL(url)

        // Extract Open Graph title
        const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
        const title = ogTitleMatch?.[1] || titleMatch?.[1] || urlObj.hostname

        // Extract Open Graph description
        const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
        const description = ogDescMatch?.[1] || descMatch?.[1] || ''

        // Extract Open Graph image
        const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
        let ogImage = ogImageMatch?.[1] || null

        // Make relative URLs absolute
        if (ogImage && !ogImage.startsWith('http')) {
            ogImage = new URL(ogImage, url).href
        }

        // Extract favicon
        const faviconMatch = html.match(/<link\s+rel=["'](?:icon|shortcut icon)["']\s+href=["']([^"']+)["']/i)
        let favicon = faviconMatch?.[1] || `${urlObj.origin}/favicon.ico`

        // Make relative URLs absolute
        if (favicon && !favicon.startsWith('http')) {
            favicon = new URL(favicon, url).href
        }

        return {
            title: title.substring(0, 200), // Limit length
            description: description.substring(0, 500),
            ogImage,
            favicon,
        }
    } catch (error) {
        console.error('Error fetching metadata:', error)

        // Return fallback data
        const urlObj = new URL(url)
        return {
            title: urlObj.hostname,
            description: '',
            ogImage: null,
            favicon: `${urlObj.origin}/favicon.ico`,
        }
    }
}
