/**
 * Levenshtein Distance Algorithm
 * Calculates the minimum number of single-character edits needed to change one string into another
 * Used for fuzzy search with typo tolerance
 */
export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = []

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i]
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j
    }

    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1]
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                )
            }
        }
    }

    return matrix[b.length][a.length]
}

/**
 * Fuzzy Match with Similarity Threshold
 * Returns true if the similarity between query and target exceeds the threshold
 * @param query - Search query
 * @param target - Target string to match against
 * @param threshold - Similarity threshold (0-1), default 0.6
 */
export function fuzzyMatch(
    query: string,
    target: string,
    threshold: number = 0.6
): boolean {
    const queryLower = query.toLowerCase()
    const targetLower = target.toLowerCase()

    // If query is a substring of target, it's a perfect match for our purposes
    if (targetLower.includes(queryLower)) {
        return true
    }

    const distance = levenshteinDistance(queryLower, targetLower)
    const maxLength = Math.max(query.length, target.length)
    const similarity = 1 - distance / maxLength

    return similarity >= threshold
}

/**
 * Fuzzy Search in Array
 * Returns all items that match the query with fuzzy matching
 */
export function fuzzySearch<T>(
    items: T[],
    query: string,
    getSearchableText: (item: T) => string,
    threshold: number = 0.6
): T[] {
    if (!query.trim()) return items

    return items.filter((item) => {
        const searchableText = getSearchableText(item)
        return fuzzyMatch(query, searchableText, threshold)
    })
}
