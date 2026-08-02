const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const filePath = "C:\\Users\\cypat\\.gemini\\antigravity-ide\\brain\\925bd0dc-8627-4741-9e17-05a2bd585aae\\gdrive_media\\IMG_5453.MOV";

console.log("File path exists:", fs.existsSync(filePath));
if (fs.existsSync(filePath)) {
  const stats = fs.statSync(filePath);
  console.log("File size in bytes:", stats.size);
}

const buffer = fs.readFileSync(filePath);

console.log("Uploading via upload_stream...");
const uploadStream = cloudinary.uploader.upload_stream(
  { resource_type: 'auto', folder: 'beauty_beats_content' },
  (error, result) => {
    if (error) {
      console.error("UPLOAD ERROR:", error);
    } else {
      console.log("UPLOAD SUCCESS:", result.secure_url);
    }
  }
);
uploadStream.end(buffer);
