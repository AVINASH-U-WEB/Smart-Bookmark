import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Determine the correct redirect origin
            // On Vercel, request.url might differ from the public URL
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocal = process.env.NODE_ENV === 'development'

            let redirectOrigin = origin
            if (!isLocal && forwardedHost) {
                redirectOrigin = `https://${forwardedHost}`
            }

            return NextResponse.redirect(`${redirectOrigin}${next}`)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}
