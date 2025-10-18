export const requireHRAuth = (req, res, next) => {
  const token = req.headers['x-hr-token'];

  if (!token || token !== process.env.HR_TOKEN) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Valid HR token required.'
    });
  }

  next();
};

export const optionalAuth = (req, res, next) => {
  // Allow requests through but mark if authenticated
  const token = req.headers['x-hr-token'];
  req.isAuthenticated = token === process.env.HR_TOKEN;
  next();
};
