import assert from "assert";
import {
  getPagination,
  buildPaginatedResponse,
  escapeRegex,
} from "../src/utils/pagination.js";

// Pagination defaults
{
  const result = getPagination({});
  assert.strictEqual(result.page, 1);
  assert.strictEqual(result.limit, 10);
  assert.strictEqual(result.skip, 0);
}

// Pagination custom
{
  const result = getPagination({ page: "2", limit: "20" });
  assert.strictEqual(result.page, 2);
  assert.strictEqual(result.limit, 20);
  assert.strictEqual(result.skip, 20);
}

// Limit cap
{
  const result = getPagination({ limit: "999" });
  assert.strictEqual(result.limit, 100);
}

// Paginated response
{
  const result = buildPaginatedResponse({
    data: [1, 2],
    total: 25,
    page: 1,
    limit: 10,
  });
  assert.strictEqual(result.pagination.totalPages, 3);
  assert.strictEqual(result.pagination.hasNextPage, true);
  assert.strictEqual(result.pagination.hasPrevPage, false);
}

// Escape regex
{
  assert.strictEqual(escapeRegex("a+b"), "a\\+b");
}

console.log("All pagination utility tests passed.");
