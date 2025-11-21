import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, 'public', 'assets');

// assets 디렉토리 생성
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 이미지 URL과 파일명 매핑
const images = [
  {
    url: 'https://www.figma.com/api/mcp/asset/4195e5a4-7bf6-4830-997b-8cd7a24c82f9',
    filename: 'jjubul-white-2x.png'
  },
  {
    url: 'https://www.figma.com/api/mcp/asset/70fd5eb1-bbfe-4737-ac63-67b73ba02177',
    filename: 'line-3.svg'
  },
  {
    url: 'https://www.figma.com/api/mcp/asset/2a52a5fc-20d6-4d40-9748-dddd4888ea6d',
    filename: 'checkbox-checked.svg'
  },
  {
    url: 'https://www.figma.com/api/mcp/asset/e0f04408-121a-4eae-8d25-7f63ac5d9726',
    filename: 'checkbox-unchecked.svg'
  },
  {
    url: 'https://www.figma.com/api/mcp/asset/ed4e520d-328e-4b56-a9da-bea4d7798f02',
    filename: 'line-4.svg'
  },
  {
    url: 'https://www.figma.com/api/mcp/asset/eec21001-a87c-4ea0-a1cd-80aaf0318ed6',
    filename: 'anchor-icon.svg'
  },
  {
    url: 'https://www.figma.com/api/mcp/asset/f6aba9ec-9594-4f3c-b558-b81cd417f41e',
    filename: 'file-icon.svg'
  }
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP error! status: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('이미지 다운로드 시작...\n');
  
  for (const image of images) {
    const filepath = path.join(assetsDir, image.filename);
    try {
      await downloadImage(image.url, filepath);
    } catch (error) {
      console.error(`✗ Failed to download ${image.filename}:`, error.message);
    }
  }
  
  console.log('\n다운로드 완료!');
  console.log(`이미지가 ${assetsDir} 폴더에 저장되었습니다.`);
}

downloadAll().catch(console.error);

