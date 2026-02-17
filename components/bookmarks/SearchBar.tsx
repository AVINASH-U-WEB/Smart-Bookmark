'use client'

import { useState } from 'react'
import { fuzzySearch } from '@/lib/algorithms/fuzzySearch'
import { Bookmark } from '@/lib/types/database'

interface SearchBarProps {
    bookmarks: Bookmark[]
    onFilteredResults: (filtered: Bookmark[]) => void
}

export default function SearchBar({ bookmarks, onFilteredResults }: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent')

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery)

        if (!searchQuery.trim()) {
            onFilteredResults(sortBookmarks(bookmarks, sortBy))
            return
        }

        // Fuzzy search on title and description
        const results = fuzzySearch(
            bookmarks,
            searchQuery,
            (bookmark) => `${bookmark.title} ${bookmark.description || ''}`,
            0.5 // Lower threshold for more lenient matching
        )

        onFilteredResults(sortBookmarks(results, sortBy))
    }

    const handleSortChange = (newSort: 'recent' | 'alphabetical') => {
        setSortBy(newSort)
        const filtered = query.trim()
            ? fuzzySearch(
                bookmarks,
                query,
                (bookmark) => `${bookmark.title} ${bookmark.description || ''}`,
                0.5
            )
            : bookmarks

        onFilteredResults(sortBookmarks(filtered, newSort))
    }

    const sortBookmarks = (items: Bookmark[], sort: 'recent' | 'alphabetical'): Bookmark[] => {
        return [...items].sort((a, b) => {
            if (sort === 'recent') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            } else {
                return a.title.localeCompare(b.title)
            }
        })
    }

    return (
        <div className="neo-card p-4 flex flex-col sm:flex-row gap-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Search Input */}
            <div className="flex-1 relative">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Ref: SEARCH_BOOKMARKS..."
                    className="input-neo pl-10 font-mono text-sm uppercase placeholder-gray-500"
                />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as 'recent' | 'alphabetical')}
                    className="appearance-none w-full sm:w-auto px-4 py-3 pr-10 bg-white border-2 border-black rounded-lg text-black font-bold uppercase tracking-wide cursor-pointer focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <option value="recent">Most Recent</option>
                    <option value="alphabetical">A-Z Order</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
