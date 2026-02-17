'use client'

import { Bookmark } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface BookmarkCardProps {
    bookmark: Bookmark
    onDelete: (id: string) => void
}

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        const supabase = createClient()

        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('id', bookmark.id)

        if (!error) {
            onDelete(bookmark.id)
        } else {
            console.error('Error deleting bookmark:', error)
        }

        setIsDeleting(false)
        setShowConfirm(false)
    }

    return (
        <div className="neo-card p-0 group relative h-full flex flex-col hover:z-10 bg-white">
            {/* Deleter */}
            <button
                onClick={() => setShowConfirm(true)}
                className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 z-20"
                title="Delete bookmark"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={4}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="absolute inset-0 bg-yellow-100/95 backdrop-blur-sm z-30 flex items-center justify-center p-4 border-2 border-black m-1">
                    <div className="text-center w-full">
                        <p className="text-black font-black text-lg mb-4 uppercase">Delete this?</p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                {isDeleting ? '...' : 'YES'}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-white text-black border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                NO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bookmark Content */}
            <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                {/* Preview Image */}
                {bookmark.og_image_url && (
                    <div className="border-b-2 border-black overflow-hidden h-40 bg-gray-100">
                        <img
                            src={bookmark.og_image_url}
                            alt={bookmark.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none'
                            }}
                        />
                    </div>
                )}

                <div className="p-4 flex flex-col flex-1">
                    {/* Title with Favicon */}
                    <div className="flex items-start gap-2 mb-2">
                        {bookmark.favicon_url && (
                            <img
                                src={bookmark.favicon_url}
                                alt=""
                                className="w-5 h-5 mt-1 flex-shrink-0 border border-black rounded-sm p-0.5 bg-white"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        )}
                        <h3 className="font-bold text-black text-lg leading-tight line-clamp-2">
                            {bookmark.title}
                        </h3>
                    </div>

                    {/* Description */}
                    {bookmark.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 font-medium border-l-2 border-gray-300 pl-2">
                            {bookmark.description}
                        </p>
                    )}

                    <div className="mt-auto flex justify-between items-end border-t-2 border-dashed border-gray-300 pt-3">
                        {/* URL */}
                        <p className="text-blue-600 text-xs font-bold uppercase tracking-wider bg-blue-100 px-1 border border-blue-200 truncate max-w-[120px]">
                            {new URL(bookmark.url).hostname}
                        </p>

                        {/* Timestamp */}
                        <p className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5 transform rotate-2">
                            {new Date(bookmark.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </a>
        </div>
    )
}
