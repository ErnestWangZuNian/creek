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

function mergeIntoAst(ast: any, newEntries: Record<string, string>, cleanup: boolean = false) {
    // Expecting export default { ... }
    let properties: any[] = [];
    let objectExpression: any = null;
    
    traverse(ast, {
        ExportDefaultDeclaration(path: any) {
            if (t.isObjectExpression(path.node.declaration)) {
                objectExpression = path.node.declaration;
                properties = path.node.declaration.properties;
            }
        }
    });

    if (!properties || !objectExpression) return;

    const newKeys = new Set(Object.keys(newEntries));

    // 1. Update or Add new entries
    Object.entries(newEntries).forEach(([key, value]) => {
        // Check if key exists
        const existingProp = properties.find((prop: any) => {
            return (t.isIdentifier(prop.key) && prop.key.name === key) ||
                   (t.isStringLiteral(prop.key) && prop.key.value === key);
        });

        if (!existingProp) {
            const prop = t.objectProperty(
                t.stringLiteral(key),
                t.stringLiteral(value)
            );
            properties.push(prop);
        } else {
             // Optional: Update value if changed? 
             // Usually for zh-CN we want to update the source text if it changed in code.
             // But for en-US we might want to keep the translation.
             // Let's assume for now we don't overwrite existing values unless it's the source language file (zh-CN).
             // But we don't know which file this is easily here without passing more context.
             // However, the user asked about "cleaning up unused keys".
        }
    });

    // 2. Remove unused keys if cleanup is true
    if (cleanup) {
        // Filter out properties that are NOT in newEntries
        // We need to mutate the properties array in place or replace it.
        // AST manipulation: we can remove paths if we were traversing, but here we have the array.
        // We can filter the array and reassign to objectExpression.properties.
        
        const filteredProperties = properties.filter((prop: any) => {
            let key = '';
            if (t.isIdentifier(prop.key)) key = prop.key.name;
            else if (t.isStringLiteral(prop.key)) key = prop.key.value;
            
            // If key is not in newKeys, it's unused.
            // BUT we must be careful about comments. 
            // If we remove the property, comments attached might be lost or shifted.
            // And manual keys?
            
            // User requirement: "我在项目的文件中我又给张三这个删除了 但是在zh-CN 中这个中文已经存在了 这样的话在zh-cn或者en-us中都会存在很多废弃的代码"
            // So they WANT to remove keys that are no longer in source.
            
            return newKeys.has(key);
        });
        
        objectExpression.properties = properties.filter((prop: any) => {
            let key = '';
            if (t.isIdentifier(prop.key)) key = prop.key.name;
            else if (t.isStringLiteral(prop.key)) key = prop.key.value;
            
            return newKeys.has(key);
        });
    }
}

async function writeLocaleFile(filePath: string, entries: Record<string, string>, cleanup: boolean = true) {
    fs.ensureDirSync(path.dirname(filePath));
    
    if (fs.existsSync(filePath)) {
        // Merge
        const content = fs.readFileSync(filePath, 'utf-8');
        try {
            const ast = parser.parse(content, { sourceType: 'module' });
            mergeIntoAst(ast, entries, cleanup);
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
          await writeLocaleFile(targetFile, entries, true);
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
      
      // Cleanup for zh-CN.ts (source of truth)
      await writeLocaleFile(zhTargetFile, allEntries, true);

      // Generate en-US.ts (if it doesn't exist, create empty or merge)
      // Assume en-US.ts is in the same directory as zh-CN.ts
      const localeDir = path.dirname(zhTargetFile);
      const enTargetFile = path.join(localeDir, 'en-US.ts');
      
      // For en-US, we just want to ensure keys exist, value can be empty or same as key or TODO
      // But typically we don't want to overwrite existing translations.
      // Let's create an object with same keys but empty values for new keys.
      
      // We read existing en-US file if it exists to preserve translations
      let existingEnEntries: Record<string, string> = {};
      if (fs.existsSync(enTargetFile)) {
            // This is tricky without parsing. But mergeIntoAst handles merge.
            // The issue is mergeIntoAst(..., cleanup=true) will remove keys not in input.
            // So if we pass `enEntries` which is `allEntries` (Chinese values), 
            // mergeIntoAst will add missing keys (good) and remove extra keys (good for cleanup).
            // But it won't overwrite existing values (because of !existingProp check).
            
            // So simply passing `allEntries` to `writeLocaleFile(enTargetFile, allEntries, true)`
            // will:
            // 1. Add new keys (with Chinese value as placeholder)
            // 2. Keep existing keys (with existing English value)
            // 3. Remove keys that are no longer in `allEntries` (cleanup)
            
            // This is exactly what is needed!
      }
      
      await writeLocaleFile(enTargetFile, allEntries, true);
  }
}
