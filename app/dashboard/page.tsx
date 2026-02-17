'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bookmark } from '@/lib/types/database'
import BookmarkCard from '@/components/bookmarks/BookmarkCard'
import AddBookmarkForm from '@/components/bookmarks/AddBookmarkForm'
import SearchBar from '@/components/bookmarks/SearchBar'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Robust check for authentication
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // If no session, wait a moment and check again (double verification)
                // This handles cases where cookies are just being set
                setTimeout(async () => {
                    const { data: { session: retrySession } } = await supabase.auth.getSession()
                    if (!retrySession) {
                        router.push('/login')
                    } else {
                        setUser(retrySession.user)
                        loadBookmarks()
                    }
                }, 1000)
            } else {
                setUser(session.user)
                loadBookmarks()
            }
        }

        checkAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user)
                // Only load if not already loaded (to prevent double fetch)
                if (user?.id !== session.user.id) {
                    loadBookmarks()
                }
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const loadBookmarks = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setBookmarks(data)
            setFilteredBookmarks(data)
        }
        setIsLoading(false)
    }

    // Real-time subscription
    useEffect(() => {
        if (!user) return

        const channel = supabase
            .channel('bookmarks-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setBookmarks((prev) => [payload.new as Bookmark, ...prev])
                        setFilteredBookmarks((prev) => [payload.new as Bookmark, ...prev])
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
                        setFilteredBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleDelete = (id: string) => {
        setBookmarks((prev) => prev.filter((b) => b.id !== id))
        setFilteredBookmarks((prev) => prev.filter((b) => b.id !== id))
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#e0e7ff]">
                <div className="text-center neo-card p-8 bg-white">
                    <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-black font-bold text-xl uppercase tracking-wider">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-[#e0e7ff] font-['Space_Grotesk']">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b-4 border-black">
                    <div>
                        <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-tighter transform -rotate-1">
                            Smart<br />Bookmarks
                        </h1>
                        <p className="text-black font-bold bg-yellow-300 inline-block px-2 border-2 border-black transform rotate-1">
                            {user?.email} • {bookmarks.length} items
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn-neo-secondary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                        EXIT
                    </button>
                </div>

                {/* Add Bookmark Form */}
                <div className="mb-6">
                    <AddBookmarkForm
                        existingUrls={bookmarks.map((b) => b.url)}
                        onBookmarkAdded={loadBookmarks}
                    />
                </div>

                {/* Search Bar */}
                {bookmarks.length > 0 && (
                    <div className="mb-6">
                        <SearchBar
                            bookmarks={bookmarks}
                            onFilteredResults={setFilteredBookmarks}
                        />
                    </div>
                )}

                {/* Bookmarks Grid */}
                {filteredBookmarks.length === 0 && bookmarks.length > 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No bookmarks match your search</p>
                    </div>
                )}

                {bookmarks.length === 0 && (
                    <div className="text-center py-16 neo-card bg-white">
                        <div className="inline-block p-4 bg-pink-200 border-2 border-black rounded-full mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-black mb-2 uppercase">It's empty here!</h2>
                        <p className="text-black font-medium">Add a bookmark to start your collection.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookmarks.map((bookmark) => (
                        <BookmarkCard
                            key={bookmark.id}
                            bookmark={bookmark}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
