import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    let requestUrl = ''

    try {
        const { url } = await request.json()
        requestUrl = url

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        // Fetch the HTML content with a strict timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            signal: controller.signal
        })

        clearTimeout(timeoutId)

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

        return NextResponse.json({
            title: title.substring(0, 200),
            description: description.substring(0, 500),
            ogImage,
            favicon,
        })
    } catch (error) {
        console.error('Error fetching metadata:', error)

        // Return fallback data
        try {
            const urlObj = new URL(requestUrl)
            return NextResponse.json({
                title: urlObj.hostname,
                description: '',
                ogImage: null,
                favicon: `${urlObj.origin}/favicon.ico`,
            })
        } catch {
            return NextResponse.json(
                { error: 'Failed to fetch metadata' },
                { status: 500 }
            )
        }
    }
}
