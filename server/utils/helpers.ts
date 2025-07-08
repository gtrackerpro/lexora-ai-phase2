/**
 * Utility helper functions
 */

/**
 * Escape special characters in a string for use in a regular expression
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create a case-insensitive MongoDB regex pattern
 */
export function createSearchRegex(query: string): RegExp {
  return new RegExp(escapeRegExp(query), 'i');
}

/**
 * Sanitize search query by removing special characters
 */
export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[^\w\s]/g, '').trim();
}

/**
 * Build MongoDB aggregation pipeline for text search
 */
export function buildSearchPipeline(
  query: string, 
  fields: string[], 
  additionalFilters: any = {}
) {
  const sanitizedQuery = sanitizeSearchQuery(query);
  const searchRegex = createSearchRegex(sanitizedQuery);
  
  const searchConditions = fields.map(field => ({
    [field]: { $regex: searchRegex }
  }));

  return [
    {
      $match: {
        $and: [
          { $or: searchConditions },
          additionalFilters
        ]
      }
    },
    {
      $addFields: {
        searchScore: {
          $sum: fields.map(field => ({
            $cond: {
              if: { $regexMatch: { input: `$${field}`, regex: searchRegex } },
              then: field === 'title' ? 3 : field === 'description' ? 2 : 1,
              else: 0
            }
          }))
        }
      }
    },
    { $sort: { searchScore: -1, createdAt: -1 } }
  ];
}

/**
 * Validate and parse pagination parameters
 */
export function parsePaginationParams(req: any) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Format search results with metadata
 */
export function formatSearchResults(results: any[], total: number, page: number, limit: number) {
  return {
    success: true,
    count: results.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    results
  };
}
