const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const clientPublicDir = 'd:/code mode/freelancing/beauty-beats/client-website/public';
const clinicPublicDir = 'd:/code mode/freelancing/beauty-beats/clinic-website/public';

const salonImagesDir = path.join(clientPublicDir, 'images');
const clinicImagesDir = path.join(clinicPublicDir, 'images');

const salonMapping = {};
const clinicMapping = {};
const globalMapping = {};

// Helper to upload a file to Cloudinary
async function uploadFile(filePath, folderName) {
  const fileBasename = path.basename(filePath);
  console.log(`Uploading ${fileBasename} to Cloudinary folder: ${folderName}...`);
  try {
    const isVideo = filePath.endsWith('.mp4') || filePath.endsWith('.webm') || filePath.endsWith('.MOV') || filePath.endsWith('.mov');
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `beauty_beats_${folderName}`,
      resource_type: isVideo ? 'video' : 'image'
    });
    console.log(`Uploaded successfully! URL: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${filePath}:`, error.message);
    return null;
  }
}

// Scans files and replaces content
function replaceReferences(dirPath, mapping, fileTypeFilter) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        replaceReferences(fullPath, mapping, fileTypeFilter);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (fileTypeFilter.includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        // Perform replacement for each mapped asset
        for (const [localRef, remoteUrl] of Object.entries(mapping)) {
          // Replace references like "/images/filename" or "images/filename"
          const regexStr = `(['"\`])\\/?${localRef.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\1`;
          const regex = new RegExp(regexStr, 'g');
          if (regex.test(content)) {
            content = content.replace(regex, `$1${remoteUrl}$1`);
            modified = true;
            console.log(`  Replaced ${localRef} with Cloudinary URL in ${path.basename(fullPath)}`);
          }
        }

        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      }
    }
  }
}

async function run() {
  console.log('Starting Cloudinary static assets upload...');

  // Upload Salon images
  if (fs.existsSync(salonImagesDir)) {
    const salonFiles = fs.readdirSync(salonImagesDir);
    for (const file of salonFiles) {
      const filePath = path.join(salonImagesDir, file);
      if (fs.statSync(filePath).isFile()) {
        const url = await uploadFile(filePath, 'salon');
        if (url) {
          salonMapping[`images/${file}`] = url;
        }
      }
    }
  }

  // Upload Clinic images
  if (fs.existsSync(clinicImagesDir)) {
    const clinicFiles = fs.readdirSync(clinicImagesDir);
    for (const file of clinicFiles) {
      const filePath = path.join(clinicImagesDir, file);
      if (fs.statSync(filePath).isFile()) {
        const url = await uploadFile(filePath, 'clinic');
        if (url) {
          clinicMapping[`images/${file}`] = url;
        }
      }
    }
  }

  // Upload other top-level public assets if any
  const otherAssets = [
    { path: path.join(clientPublicDir, 'intro.mp4'), folder: 'global', ref: 'intro.mp4' },
    { path: path.join(clientPublicDir, 'logo.jpg'), folder: 'global', ref: 'logo.jpg' },
    { path: path.join(clinicPublicDir, 'intro.mp4'), folder: 'global', ref: 'intro.mp4' },
    { path: path.join(clinicPublicDir, 'logo.jpg'), folder: 'global', ref: 'logo.jpg' },
  ];

  for (const asset of otherAssets) {
    if (fs.existsSync(asset.path)) {
      const url = await uploadFile(asset.path, asset.folder);
      if (url) {
        globalMapping[asset.ref] = url;
      }
    }
  }

  console.log('\n--- UPLOAD COMPLETE ---');
  console.log('Salon mappings:', salonMapping);
  console.log('Clinic mappings:', clinicMapping);
  console.log('Global mappings:', globalMapping);

  // Write mapping to JSON file for reference
  fs.writeFileSync(
    path.join(__dirname, 'asset-mapping.json'),
    JSON.stringify({ salonMapping, clinicMapping, globalMapping }, null, 2),
    'utf8'
  );

  console.log('\n--- REPLACING CODE REFERENCES ---');
  const allowedExtensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.html'];

  // Replace references in client-website
  console.log('Processing client-website...');
  const clientSrc = 'd:/code mode/freelancing/beauty-beats/client-website/src';
  if (fs.existsSync(clientSrc)) {
    replaceReferences(clientSrc, { ...salonMapping, ...globalMapping }, allowedExtensions);
  }

  // Replace references in clinic-website
  console.log('Processing clinic-website...');
  const clinicSrc = 'd:/code mode/freelancing/beauty-beats/clinic-website/src';
  if (fs.existsSync(clinicSrc)) {
    replaceReferences(clinicSrc, { ...clinicMapping, ...globalMapping }, allowedExtensions);
  }

  // Replace references in admin-dashboard
  console.log('Processing admin-dashboard...');
  const adminSrc = 'd:/code mode/freelancing/beauty-beats/admin-dashboard/src';
  if (fs.existsSync(adminSrc)) {
    replaceReferences(adminSrc, { ...salonMapping, ...clinicMapping, ...globalMapping }, allowedExtensions);
  }

  console.log('\nAsset migration completed successfully!');
}

run().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
