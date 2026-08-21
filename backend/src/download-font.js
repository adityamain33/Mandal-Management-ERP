import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/mukta/Mukta-Regular.ttf';
const fontsDir = path.join(__dirname, 'assets', 'fonts');
const fontPath = path.join(fontsDir, 'Mukta-Regular.ttf');

// Ensure directory exists
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

console.log('Downloading Mukta Regular...');
const file = fs.createWriteStream(fontPath);

https.get(fontUrl, (response) => {
  if (response.statusCode === 302 || response.statusCode === 301) {
    // Handle redirect
    https.get(response.headers.location, (redirectResponse) => {
      redirectResponse.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Download completed successfully: ' + fontPath);
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download completed successfully: ' + fontPath);
    });
  }
}).on('error', (err) => {
  fs.unlink(fontPath, () => {});
  console.error('Error downloading font: ', err.message);
});
