// fileValidation.mjs

// Middleware function to validate uploaded files
export const validateFile = (req, res, next) => {
    // Check if a file is present in the request
    const file = req.file;
  
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }
  
    // Define maximum allowed file size (in bytes) and allowed file types
    const maxSize = 15 * 1024 * 1024; // 15 MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/docx'];
  
    // Validate file size
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File exceeds the maximum allowed size of 15MB'
      });
    }
  
    // Validate file type
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Allowed types are: JPEG, PNG, PDF'
      });
    }
  
    // If all checks pass, move to the next middleware
    next();
  };
  
  export default validateFile;
  