'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { isValidUrl, isDuplicateUrl } from '@/lib/algorithms/duplicateDetection'

interface AddBookmarkFormProps {
    existingUrls: string[]
    onBookmarkAdded: () => void
}

export default function AddBookmarkForm({ existingUrls, onBookmarkAdded }: AddBookmarkFormProps) {
    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showForm, setShowForm] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // Validation
        if (!url.trim()) {
            setError('Please enter a URL')
            return
        }

        if (!isValidUrl(url)) {
            setError('Please enter a valid URL (must start with http:// or https://)')
            return
        }

        if (isDuplicateUrl(url, existingUrls)) {
            setError('This bookmark already exists')
            return
        }

        setIsLoading(true)

        // ... metadata fetch ...

        // ... save to db ...


        try {
            // Fetch metadata via API route (avoids CORS)
            // Set a timeout to prevent hanging
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 2500) // 2.5 second timeout (FAST)

            let metadata = { title: url, description: '', favicon: '', ogImage: '' }

            try {
                const metadataResponse = await fetch('/api/metadata', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url }),
                    signal: controller.signal
                })

                clearTimeout(timeoutId)

                if (metadataResponse.ok) {
                    const data = await metadataResponse.json()
                    // Only use returned data if it's valid
                    if (data && !data.error) {
                        metadata = { ...metadata, ...data }
                        if (!metadata.title) metadata.title = url // Fallback
                    }
                }
            } catch (err) {
                console.warn('Metadata fetch failed, using defaults', err)
            }

            // Save to database
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setError('You must be logged in to add bookmarks')
                setIsLoading(false)
                return
            }

            const { error: dbError } = await supabase.from('bookmarks').insert({
                user_id: user.id,
                url: url,
                title: metadata.title || url,
                description: metadata.description || null,
                favicon_url: metadata.favicon || null,
                og_image_url: metadata.ogImage || null,
                tags: null,
            })

            if (dbError) {
                setError('Failed to save bookmark: ' + dbError.message)
            } else {
                // Success
                setUrl('')
                setSuccess('BOOKMARK SAVED! ADD ANOTHER?')
                // setShowForm(false) // Keep open
                onBookmarkAdded()
                setTimeout(() => document.getElementById('url')?.focus(), 50)
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        }

        setIsLoading(false)
    }

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="btn-neo-primary w-full py-4 text-lg flex items-center justify-center gap-2 transform transition-transform hover:-translate-y-1"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
                ADD NEW BOOKMARK
            </button>
        )
    }

    return (
        <div className="neo-card p-6 bg-yellow-50 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-black uppercase tracking-tight transform -rotate-1 bg-white inline-block px-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">New Bookmark</h2>
                <button
                    onClick={() => {
                        setShowForm(false)
                        setUrl('')
                        setError('')
                    }}
                    className="text-black hover:text-red-600 p-1 border-2 border-transparent hover:border-black hover:bg-white transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                    <label htmlFor="url" className="block text-sm font-bold text-black mb-1 uppercase tracking-wider">
                        URL
                    </label>
                    <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="input-neo"
                        autoFocus
                    />
                </div>

                {error && (
                    <div className="bg-red-100 border-2 border-black p-3 text-red-600 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                        ⚠️ {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border-2 border-black p-3 text-green-700 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                        ✅ {success}
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-neo-primary flex-1 flex items-center justify-center gap-2 text-sm"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                SAVING...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                SAVE BOOKMARK
                            </>
                        )}
                    </button>
                </div>

                <p className="text-xs text-black font-medium text-center mt-4 border-t-2 border-dashed border-gray-300 pt-2">
                    METADATA WILL BE AUTO-FETCHED
                </p>
            </form>
        </div>
    )
}
