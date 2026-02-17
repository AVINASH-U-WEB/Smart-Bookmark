import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // REFRESH SESSION: This will update the cookie if needed
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. PROTECTED ROUTE CHECK
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth')
    ) {
        // no user, redirect to login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 2. AUTHENTICATED USER CHECK (Redirect away from login)
    if (user && request.nextUrl.pathname === '/login') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'

        // IMPORTANT: We must copy the session cookies to the redirect response
        // because supabase.auth.getUser() might have refreshed them!
        const redirectResponse = NextResponse.redirect(url)

        // Copy cookies from supabaseResponse (which has the fresh session) to redirectResponse
        const setCookieHeader = supabaseResponse.headers.get('set-cookie')
        if (setCookieHeader) {
            redirectResponse.headers.set('set-cookie', setCookieHeader)
        }

        return redirectResponse
    }

    return supabaseResponse
}
