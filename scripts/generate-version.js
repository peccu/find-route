import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES Modulesでは、CommonJSの__dirname, __filenameが使えないため、
// 代わりにimport.meta.urlとurlモジュールを使用する
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Gitの最新コミットハッシュを取得
  const commitHash = execSync('git rev-parse HEAD').toString().trim();
  const timestamp = new Date().toISOString();

  const versionInfo = {
    version: commitHash,
    buildTimestamp: timestamp
  };

  const filePath = path.join(__dirname, '../public/version.json');
  fs.writeFileSync(filePath, JSON.stringify(versionInfo, null, 2));

  console.log('Successfully generated public/version.json');
} catch (error) {
  console.error('Failed to generate version.json:', error.message);
  // エラーの場合でもビルドを続行できるようにする
  const versionInfo = {
    version: new Date().toISOString(),
    buildTimestamp: new Date().toISOString()
  };

  const filePath = path.join(__dirname, '../public/version.json');
  fs.writeFileSync(filePath, JSON.stringify(versionInfo, null, 2));

  console.log('Successfully generated public/version.json');
}