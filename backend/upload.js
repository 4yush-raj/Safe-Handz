const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Ensure 'uploads/' directory exists automatically
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Disk Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// 3. File Filter (Allow PDFs, PNGs, JPGs, JPEGs)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only PDF, JPEG, JPG, and PNG files are allowed.'), false);
  }
};

// 4. Initialize Multer Config
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB Limit
});

module.exports = upload;