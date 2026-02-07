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
