import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import _ from 'lodash';
import path from 'path';
import { TranslateOption, translateEn } from './translate';

export async function kiwiTranslate(originPath: string, folderPath: string, option?: TranslateOption): Promise<void> {
  function convertToObject(content: string) {
    let result = content.replace('export default', '');
    result = result.replace(/\n\s*/g, '');
    result = result.replace(/,\}"/g, '}');
    result = result.replace(/\}\};"/g, '}}');
    const obj = new Function('return ' + result)();
    return obj;
  }

  // 解析 import * from “”;
  function getImportObj(code: string) {
    let pattern = /import\s+(\w+)\s+from/g;
    let match;
    let results = [];

    while ((match = pattern.exec(code)) !== null) {
      results.push(match[1]);
    }

    let finalResult: Record<string, any> = {};
    results.forEach((item) => {
      finalResult[item] = item;
    });

    return finalResult;
  }

  // 解析 export default  * ”;
  function getExportObj(code: string) {
    let pattern = /\{([^}]*)\}/g;
    let sourceContentMatchDefault = pattern.exec(code);
    let result = sourceContentMatchDefault ? sourceContentMatchDefault[1] : '';
    result = result.replace(/(\w+),?/g, '$1:"$1",');
    return convertToObject(`{${result}}`);
  }

  function fixIndexAutoImport(sourceDir: string) {
    const files = readdirSync(sourceDir);
    files.forEach((file) => {
      const sourcePath = path.join(sourceDir, file);
      if (sourcePath.includes('index.ts')) {
        let sourceContent = readFileSync(sourcePath, 'utf8');

        const importObj = getImportObj(sourceContent);
        const exportObj = getExportObj(sourceContent);
        const finalObj = _.mergeWith(importObj, exportObj);

        let pattern = /export default([\s\S]*)/;
        let finalStr = JSON.stringify(finalObj, null, 2);
        finalStr = finalStr.replace(/"(\w+)":\s*"(\w+)"/g, '$1');
        sourceContent = sourceContent.replace(pattern, `export default ${finalStr}`);

        writeFileSync(sourcePath, sourceContent);
      }
    });
  }

  function mergeContent(targetContent: string, sourceContent: string) {
    let targetObj = convertToObject(targetContent);
    let sourceObj = convertToObject(sourceContent);

    let mergedObj = _.mergeWith(targetObj, sourceObj);

    return `export default ${JSON.stringify(mergedObj, null, 2)}`;
  }

  function copyDirectory(sourceDir: string, targetDir: string) {
    mkdirSync(targetDir, { recursive: true });

    const files = readdirSync(sourceDir);

    files.forEach((file) => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      if (statSync(sourcePath).isDirectory()) {
        copyDirectory(sourcePath, targetPath);
      } else {
        if (existsSync(targetPath) && !targetPath.includes('index.ts')) {
          // 如果目标路径存在，合并文件内容 这里合并太复杂了 咋个
          const sourceContent = readFileSync(sourcePath, 'utf8');
          const targetContent = readFileSync(targetPath, 'utf8');

          let mergedContent = mergeContent(sourceContent, targetContent);

          mergedContent = mergedContent.replace(/"(\w+)":/g, '$1:');
          writeFileSync(targetPath, mergedContent);
        } else {
          // 如果目标路径不存在，直接复制文件
          copyFileSync(sourcePath, targetPath);
        }
      }
    });

    console.log(`成功拷贝目录 ${sourceDir}到 ${targetDir}`);
  }

  function chunkArray<T>(array: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  const translate = async (arr: string[], errorTextArray: string[]): Promise<{ [key: string]: string }> => {
    const obj: { [key: string]: string } = {};
    for (let i = 0; i < arr.length; i++) {
      const text = arr[i];
      try {
        const result = await translateEn(text, option);
        Reflect.set(obj, text, result.replace(/'/g, "\\'"));
      } catch (error) {
        console.log(`Error: 翻译失败, 文本内容: ${text}`, error);
        errorTextArray.push(text);
        return Promise.reject(error);
      }
    }
    return obj;
  };

  const translateArray = async (originalArray: string[], times = 1): Promise<{ [key: string]: string }> => {
    const chunkedArrays = chunkArray(originalArray, 5);

    const errorTextArray: string[] = [];

    let res = [];

    let i = 0;
    console.log(`开始翻译啦`);
    while (i < chunkedArrays.length) {
      try {
        // 创建一个数组来存储10个并行请求的promises
        let promises = [];

        // 一次处理10个请求
        for (let j = 0; j < 10 && i < chunkedArrays.length; j++) {
          promises.push(translate(chunkedArrays[i], errorTextArray));
          i++;
        }

        // 等待这10个请求全部完成
        const data = await Promise.all(promises);

        // 记录完成的请求组
        console.log(`已完成第${Math.ceil(i / 10)}组翻译, 共${Math.ceil(chunkedArrays.length / 10)}组`);

        // 将结果添加到res
        res.push(...data);
      } catch (error) {
        break;
      }
    }

    const translateObj: { [key: string]: string } = {};
    if (errorTextArray.length) {
      const nextObj = await translateArray(errorTextArray, times + 1);
      Object.assign(translateObj, nextObj);
    }
    Object.assign(translateObj, ...res);
    return translateObj;
  };

  const getCnTextArray = (files: string[]): string[] => {
    const set = new Set<string>();
    for (let i = 0; i < files.length; i++) {
      const p = `${folderPath}/${files[i]}`;
      const str = readFileSync(p, 'utf8');
      const arr = str.match(/[\u4e00-\u9fa5]+/g);
      arr?.forEach((text) => {
        set.add(text);
      });
    }
    return [...set];
  };

  const replaceFile = (filePath: string, obj: { [key: string]: string }): void => {
    const str = readFileSync(filePath, 'utf8');
    const arr = str.match(/[\u4e00-\u9fa5]+/g);
    if (!arr) {
      console.log(`文件中没有中文, 文件路径: ${filePath}`);
      return;
    }
    const resultStr = str.replace(/[\u4e00-\u9fa5]+/g, (text) => {
      const val = obj[text];
      return val || text;
    });
    writeFileSync(filePath, resultStr);
    console.log(`替换完成, 文件路径: ${filePath}`);
  };

  const replaceFiles = (files: string[], obj: { [key: string]: string }): void => {
    for (let i = 0; i < files.length; i++) {
      const p = `${folderPath}/${files[i]}`;
      replaceFile(p, obj);
    }
  };

  const execute = async (): Promise<void> => {
    const log = (str: string): void => {
      console.log(''.padStart(30, '-') + str + ''.padEnd(30, '-'));
    };
    const files = readdirSync(folderPath);
    const arr = getCnTextArray(files);
    log('获取所有文本内容, 开始翻译文本内容');
    const obj = await translateArray(arr);
    if (!Object.keys(obj).length) {
      console.log('没有翻译出任何内容, 替换中止');
      return;
    }
    console.log('文本对象', obj);
    log('文本翻译完成, 开始替换文件内容');
    replaceFiles(files, obj);
    console.log('替换完成');
  };

  if (originPath) {
    fixIndexAutoImport(originPath);
  }

  if (originPath && folderPath) {
    copyDirectory(originPath, folderPath);
  }

  await execute();
}
