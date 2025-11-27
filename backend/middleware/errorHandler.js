exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
};
