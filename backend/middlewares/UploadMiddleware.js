// // Author: JDM
// // Created on: 2026-01-24

// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const uploadDir = "uploads/request-letters";

// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: (_, __, cb) => cb(null, uploadDir),
//     filename: (_, file, cb) => {
//         const ext = path.extname(file.originalname);
//         const name = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
//         cb(null, name);
//     },
// });
// module.exports = multer({ storage });

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../service/Cloudinary"); 

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "request-letters",
        allowed_formats: ["jpg", "png", "pdf", "doc", "docx"],
    },
});

const upload = multer({ storage });

module.exports = upload;
