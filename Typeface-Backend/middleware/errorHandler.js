export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ 
      error: "File too large",
      details: err.message 
    });
  }

  // Multer file type error
  if (err.message && err.message.includes("Only")) {
    return res.status(400).json({ 
      error: "Invalid file type",
      details: err.message 
    });
  }

  // MongoDB validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      error: "Validation failed",
      details: errors 
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ 
      error: "Duplicate field value",
      details: "This value already exists" 
    });
  }

  // Default error
  res.status(500).json({ 
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
}; 