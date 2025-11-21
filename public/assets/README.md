# 이미지 에셋 다운로드 가이드

Figma에서 제공한 이미지 URL은 7일 후 만료됩니다. 
이미지를 로컬에 저장하여 영구적으로 사용할 수 있습니다.

## 이미지 다운로드 방법

아래 URL들을 클릭하거나 브라우저에서 열어서 이미지를 다운로드하고, 
해당 파일명으로 `public/assets/` 폴더에 저장하세요:

1. **jjubul-white-2x.png**
   - URL: https://www.figma.com/api/mcp/asset/4195e5a4-7bf6-4830-997b-8cd7a24c82f9

2. **line-3.svg**
   - URL: https://www.figma.com/api/mcp/asset/70fd5eb1-bbfe-4737-ac63-67b73ba02177

3. **checkbox-checked.svg**
   - URL: https://www.figma.com/api/mcp/asset/2a52a5fc-20d6-4d40-9748-dddd4888ea6d

4. **checkbox-unchecked.svg**
   - URL: https://www.figma.com/api/mcp/asset/e0f04408-121a-4eae-8d25-7f63ac5d9726

5. **line-4.svg**
   - URL: https://www.figma.com/api/mcp/asset/ed4e520d-328e-4b56-a9da-bea4d7798f02

6. **anchor-icon.svg**
   - URL: https://www.figma.com/api/mcp/asset/eec21001-a87c-4ea0-a1cd-80aaf0318ed6

7. **file-icon.svg**
   - URL: https://www.figma.com/api/mcp/asset/f6aba9ec-9594-4f3c-b558-b81cd417f41e

## 자동 다운로드 스크립트 사용

터미널에서 다음 명령어를 실행하세요:

```bash
cd jjubul_admin
node download-assets.js
```

또는 PowerShell에서:

```powershell
cd jjubul_admin
node download-assets.js
```

## 수동 다운로드

각 URL을 브라우저에서 열고, 이미지를 우클릭하여 "다른 이름으로 저장"을 선택한 후 
위의 파일명으로 `public/assets/` 폴더에 저장하세요.

