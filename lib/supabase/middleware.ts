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
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

    // IMPORTANT: Use getUser() to verify the session on the server
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. PROTECTED ROUTE CHECK (Keep this to protect /dashboard)
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/'
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const response = NextResponse.redirect(url)
        // Copy cookies to redirect response
        supabaseResponse.cookies.getAll().forEach(cookie => {
            response.cookies.set(cookie.name, cookie.value, cookie)
        })
        return response
    }

    // 2. REMOVED AUTOMATIC REDIRECT FROM LOGIN
    // We will let the client-side code handle the redirect from /login to /dashboard
    // This prevents the server-side redirect loop

    return supabaseResponse
}
