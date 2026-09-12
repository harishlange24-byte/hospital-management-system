/**
 * Parse page/limit from query and build mongoose pagination options.
 */
export const getPagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginatedResponse = ({
  data,
  total,
  page,
  limit,
}) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Escape special regex characters for safe search.
 */
export const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
