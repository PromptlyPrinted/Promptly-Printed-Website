
const fs = require('fs');
const path = require('path');

console.log('Current working directory:', process.cwd());
const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('Uploads path:', uploadsPath);

try {
  if (fs.existsSync(uploadsPath)) {
    console.log('Uploads directory exists');
    const files = fs.readdirSync(uploadsPath);
    console.log('Files in uploads:', files);
  } else {
    console.log('Uploads directory does NOT exist');
    console.log('Attempting to create it...');
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('Successfully created uploads directory');
    // Clean up
    fs.rmdirSync(uploadsPath);
    console.log('Cleaned up uploads directory');
  }
} catch (error) {
  console.error('Error accessing/creating uploads directory:', error);
}
