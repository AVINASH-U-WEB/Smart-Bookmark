'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
            },
        })

        if (error) {
            console.error('Error logging in:', error.message)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Brutalist Container */}
            <div className="neo-card p-8 max-w-md w-full bg-white relative overflow-hidden">
                {/* Decorative stripe */}
                <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>

                <div className="text-center mb-10">
                    <div className="inline-block bg-yellow-400 border-2 border-black p-3 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
                        <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-tight">
                        Smart<br />Bookmarks
                    </h1>
                    <p className="text-black font-medium border-b-2 border-black inline-block pb-1">
                        Organize without the boring parts.
                    </p>
                </div>

                <div className="space-y-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full btn-neo-primary flex items-center justify-center gap-3 text-lg group"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <div className="bg-white p-1 rounded-full border-2 border-black group-hover:scale-110 transition-transform">
                                    <svg className="w-4 h-4 text-black" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                </div>
                                <span className="font-bold">Login with Google</span>
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                            No Passwords Allowed
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer / Features */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
                <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                    <h3 className="font-bold text-lg mb-1">⚡ Fast Sync</h3>
                    <p className="text-sm font-medium text-gray-800">Changes update instantly.</p>
                </div>
                <div className="bg-cyan-200 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
                    <h3 className="font-bold text-lg mb-1">🔎 Fuzzy Search</h3>
                    <p className="text-sm font-medium text-gray-800">Finds stuff even with typos.</p>
                </div>
                <div className="bg-pink-200 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                    <h3 className="font-bold text-lg mb-1">🔒 Private</h3>
                    <p className="text-sm font-medium text-gray-800">Your links are yours alone.</p>
                </div>
            </div>
        </div>
    )
}
