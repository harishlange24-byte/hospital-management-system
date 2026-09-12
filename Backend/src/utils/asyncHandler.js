/**
 * Wrap async controllers to avoid repetitive try/catch.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
