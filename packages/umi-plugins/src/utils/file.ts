import { winPath } from '@umijs/max/plugin-utils';
import fs from 'fs';
import path from 'path';

function checkFileExists(fileName: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.access(fileName, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function createDirectory(path: string) {
  // 检查目录是否已经存在
  if (!fs.existsSync(path)) {
    // 目录不存在，创建目录
    fs.mkdirSync(path, { recursive: true });
  }
}

function createFile(filePath: string, content: string = '') {
  const finalFilePath = winPath(filePath);
  const absPath = path.resolve(finalFilePath);

  if (fs.existsSync(absPath)) {
    return;
  } else {
    const dir = path.dirname(absPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(absPath, content);
  }
}

export { checkFileExists, createDirectory, createFile };
