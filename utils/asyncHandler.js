// Small wrapper so we don't have to write try/catch in every controller.
// Any error thrown inside an async controller is forwarded to Express's
// error handling middleware via next(error).
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
