import fs from 'fs-extra';
import path from 'path';
// @ts-ignore
import * as parser from '@babel/parser';
// @ts-ignore
import traverse from '@babel/traverse';
// @ts-ignore
import generate from '@babel/generator';
import * as t from '@babel/types';
// @ts-ignore
import chalk from 'chalk';
import { CollectedLocales, Config } from '../types';

function mergeIntoAst(ast: any, newEntries: Record<string, string>) {
    // Expecting export default { ... }
    let properties: any[] = [];
    
    traverse(ast, {
        ExportDefaultDeclaration(path: any) {
            if (t.isObjectExpression(path.node.declaration)) {
                properties = path.node.declaration.properties;
            }
        }
    });

    if (!properties) return;

    Object.entries(newEntries).forEach(([key, value]) => {
        // Check if key exists
        const exists = properties.some((prop: any) => {
            return (t.isIdentifier(prop.key) && prop.key.name === key) ||
                   (t.isStringLiteral(prop.key) && prop.key.value === key);
        });

        if (!exists) {
            const prop = t.objectProperty(
                t.stringLiteral(key),
                t.stringLiteral(value)
            );
            properties.push(prop);
        }
    });
}

async function writeLocaleFile(filePath: string, entries: Record<string, string>) {
    fs.ensureDirSync(path.dirname(filePath));
    
    if (fs.existsSync(filePath)) {
        // Merge
        const content = fs.readFileSync(filePath, 'utf-8');
        try {
            const ast = parser.parse(content, { sourceType: 'module' });
            mergeIntoAst(ast, entries);
            const { code } = generate(ast, { jsescOption: { minimal: true } }, content);
            fs.writeFileSync(filePath, code, 'utf-8');
            console.log(chalk.cyan(`Merged locale file: ${filePath}`));
            return;
        } catch (e) {
            console.warn(chalk.yellow(`Failed to parse existing locale file ${filePath}, overwriting...`));
        }
    }

    // Create new
    const fileContent = `export default ${JSON.stringify(entries, null, 2)};`;
    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(chalk.cyan(`Generated locale file: ${filePath}`));
}

export async function generateLocales(collectedLocales: CollectedLocales, config: Config) {
  if (config.useDirectoryAsNamespace) {
      // Multiple files mode
      const localeRoot = path.dirname(path.resolve(process.cwd(), config.localePath)); // src/locales
      const localeFileName = path.basename(config.localePath, path.extname(config.localePath)); // zh-CN

      const baseDir = path.join(localeRoot, localeFileName); // src/locales/zh-CN

      for (const [namespace, entries] of Object.entries(collectedLocales)) {
          let relativePath = namespace;
          if (relativePath.startsWith('src/')) {
              relativePath = relativePath.replace('src/', '');
          }
          
          const targetFile = path.join(baseDir, `${relativePath}.ts`);
          await writeLocaleFile(targetFile, entries);
      }
  } else {
      // Single file mode
      // Generate zh-CN.ts
      const zhTargetFile = path.resolve(process.cwd(), config.localePath);
      
      // Flatten entries 
      const allEntries: Record<string, string> = {};
      
      for (const [namespace, entries] of Object.entries(collectedLocales)) {
          Object.entries(entries).forEach(([key, value]) => {
              // Since customizeKey now returns the full key (with prefix if needed),
              // we just need to collect them.
              allEntries[key] = value;
          });
      }
      
      await writeLocaleFile(zhTargetFile, allEntries);

      // Generate en-US.ts (if it doesn't exist, create empty or merge)
      // Assume en-US.ts is in the same directory as zh-CN.ts
      const localeDir = path.dirname(zhTargetFile);
      const enTargetFile = path.join(localeDir, 'en-US.ts');
      
      // For en-US, we just want to ensure keys exist, value can be empty or same as key or TODO
      // But typically we don't want to overwrite existing translations.
      // Let's create an object with same keys but empty values for new keys.
      
      const enEntries: Record<string, string> = {};
       Object.keys(allEntries).forEach(key => {
           enEntries[key] = key; // Or leave empty? Usually better to put key as placeholder or Chinese text
           // Let's use Chinese text as placeholder so it's visible what needs translation
           // OR use key.
           // Let's use empty string or a placeholder.
           // User said: "没有英文就是默认的中文" -> implies fallback or just copy Chinese?
           // "只生成一个zh-cn.ts就好了" -> User initially said "默认生成zh-CN.ts和en-US", then "没有英文就是默认的中文 只生成一个zh-cn.ts就好了"
           // Wait, the user said: "默认生成zh-CN.ts和en-US 没有英文就是默认的中文 只生成一个zh-cn.ts就好了"
           // This is contradictory. 
           // Interpretation 1: Generate both. If no EN translation, use CN text.
           // Interpretation 2: "只生成一个zh-cn.ts就好了" overrides the first part?
           // Let's look at the prompt again: "默认生成zh-CN.ts和en-US 没有英文就是默认的中文 只生成一个zh-cn.ts就好了 不用按照目录和文件区分"
           // It seems the user changed their mind mid-sentence? Or maybe "只生成一个zh-cn.ts就好了" refers to the file structure (single file vs multiple)?
           // "不用按照目录和文件区分" -> Single file mode.
           
           // Let's assume the user wants BOTH files (zh-CN and en-US), single file for each language.
           // And for en-US, if no translation, use Chinese text (default behavior of some tools) or just empty.
           // I will generate en-US.ts as well, populating it with Chinese values as placeholders (or empty strings if preferred).
           // Let's use Chinese values as placeholders so the app doesn't break/show blank.
           enEntries[key] = allEntries[key]; 
       });

       await writeLocaleFile(enTargetFile, enEntries);
  }
}
