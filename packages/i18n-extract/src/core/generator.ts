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
    
    // Also need to remove ImportDeclarations if we are switching from multi-file to single-file
    // The previous multi-file entry file has imports.
    // If we are now writing a single file with all keys, we should remove those imports.
    // But `mergeIntoAst` is generic.
    
    // We can filter out imports in traverse.
    const importsToRemove: any[] = [];

    traverse(ast, {
        ImportDeclaration(path: any) {
            // If we are cleaning up, we might want to remove imports that look like locale sub-files?
            // Or if we are in single file mode, we probably don't want ANY imports if we are dumping all keys.
            // But user might have other imports.
            
            // However, the issue is specifically about the generated imports from multi-file mode:
            // import locale0 from './zh-CN/app';
            
            // If we detect we are writing a flat object (newEntries has keys), and the file has imports
            // AND we are in cleanup mode, maybe we should remove imports that are used in the export default object spread?
            
            // But in single file mode, we replace the export default object with a flat object (properties).
            // The spreads will be gone because we are rewriting the properties.
            // But the imports will remain at the top.
            
            if (cleanup) {
                 // Check if import source is from ./zh-CN/ or ./en-US/
                 // This is a heuristic.
                 const source = path.node.source.value;
                 if (source.startsWith('./zh-CN/') || source.startsWith('./en-US/')) {
                     importsToRemove.push(path);
                 }
            }
        },
        ExportDefaultDeclaration(path: any) {
            if (t.isObjectExpression(path.node.declaration)) {
                objectExpression = path.node.declaration;
                properties = path.node.declaration.properties;
            }
        }
    });

    importsToRemove.forEach(p => p.remove());

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
             // If the existing value is same as key (placeholder) AND new value is different, update it?
             // Or if we are in zh-CN file, we always want to update the value to match source code.
             // But mergeIntoAst doesn't know if it's zh-CN or en-US.
             
             // However, for en-US generation logic below, we are passing `enEntries` where new keys have zh value.
             // If `existingProp` exists, it means key is already there.
             // If we want to update it only if it was a placeholder (key === value), we can check.
             
             // But usually, `mergeIntoAst` is used for 2 purposes:
             // 1. zh-CN: Sync with source code. Should UPDATE value if changed.
             // 2. en-US: Add new keys. Should KEEP existing value.
             
             // Maybe we need a flag `updateValue`?
             // Or we can infer?
             
             // Let's add `updateValue` parameter to `mergeIntoAst`.
             // But wait, changing function signature affects callers.
             // `cleanup` is already a flag.
             
             // Let's assume:
             // If `cleanup` is true (which is used for zh-CN generation), we probably want to update values too?
             // Actually `cleanup` is also used for en-US generation in my previous change.
             
             // If I change the value here, I risk overwriting manual English translations with Chinese if I'm not careful.
             // BUT, `newEntries` passed for en-US only contains Chinese values for NEW keys or Fallback.
             // It also contains existing translations if we read them correctly.
             
             // In `generateLocales`:
             // For zh-CN: `entries` comes from `collectedLocales` (source code values). We WANT to update.
             // For en-US: `enSubEntries` or `allEnEntries` comes from merge of existing + new (zh).
             // If we constructed `newEntries` correctly, it should contain the "correct" value we want to write.
             // So if `newEntries` has a value, we should probably use it?
             
             // The issue is `existingEnMainEntries` read from file might be stale if we don't update it in memory?
             // No, `readEntries` reads what's on disk.
             
             // If `generateLocales` constructs `allEnEntries` correctly:
             // Priority 1: Existing main file (disk)
             // Priority 2: Existing sub file (disk)
             // Priority 3: Zh value (new)
             
             // So `allEnEntries` SHOULD have the correct value (preserving English).
             // So if `mergeIntoAst` updates the value to `allEnEntries[key]`, it should be safe/correct!
             // Because `allEnEntries[key]` IS the existing English value if it existed.
             
             // So, we SHOULD update the value here to `value` (from `newEntries`).
             
             if (t.isStringLiteral(existingProp.value)) {
                 existingProp.value.value = value;
             }
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
  const localeRoot = path.dirname(path.resolve(process.cwd(), config.localePath)); // src/locales
  const localeFileName = path.basename(config.localePath, path.extname(config.localePath)); // zh-CN
  const enFileName = 'en-US'; 

  const zhEntryFile = path.resolve(process.cwd(), config.localePath);
  const enEntryFile = path.join(localeRoot, `${enFileName}.ts`);
  
  const zhBaseDir = path.join(localeRoot, localeFileName); // src/locales/zh-CN
  const enBaseDir = path.join(localeRoot, enFileName); // src/locales/en-US

  if (config.useDirectoryAsNamespace) {
      // Multiple files mode
      
      // Ensure directories exists
      fs.ensureDirSync(zhBaseDir);
      fs.ensureDirSync(enBaseDir);

      const generatedFiles: string[] = [];
      const allEntries: Record<string, string> = {};

      // If switching from single file to multi file, we might want to read existing single file
      // and populate sub-files if possible?
      // But collectedLocales already has the structure based on file paths.
      // So we just generate files.
      
      // However, existing translations in single file might be lost if we don't migrate them?
      // collectedLocales only has keys found in source code (with Chinese values).
      // It doesn't have English translations.
      // So if we switch from single file to multi file, we lose English translations unless we read them.
      
      // Let's try to read existing single file translations if they exist.
      let existingZhEntries: Record<string, string> = {};
      let existingEnEntries: Record<string, string> = {};
      
      // Helper to read default export object from file
      const readEntries = (filePath: string): Record<string, string> => {
          if (!fs.existsSync(filePath)) return {};
          try {
              const content = fs.readFileSync(filePath, 'utf-8');
              const ast = parser.parse(content, { sourceType: 'module' });
              let props: any[] = [];
              traverse(ast, {
                  ExportDefaultDeclaration(path: any) {
                      if (t.isObjectExpression(path.node.declaration)) {
                          props = path.node.declaration.properties;
                      }
                  }
              });
              const entries: Record<string, string> = {};
              props.forEach((prop: any) => {
                 let key = '';
                 let value = '';
                 if (t.isIdentifier(prop.key)) key = prop.key.name;
                 else if (t.isStringLiteral(prop.key)) key = prop.key.value;
                 
                 if (t.isStringLiteral(prop.value)) value = prop.value.value;
                 if (key) entries[key] = value;
              });
              return entries;
          } catch (e) {
              return {};
          }
      };

      // Check if entry files exist and are NOT just imports (i.e. old single file format)
      // If they contain actual keys, we should load them.
      // But how to distinguish? 
      // Multi-file entry usually has imports and spread. Single file has big object.
      // We can just load all keys.
      
      existingZhEntries = readEntries(zhEntryFile);
      existingEnEntries = readEntries(enEntryFile);
      
      for (const [namespace, entries] of Object.entries(collectedLocales)) {
          let relativePath = namespace;
          if (relativePath.startsWith('src/')) {
              relativePath = relativePath.replace('src/', '');
          }
          
          const zhTargetFile = path.join(zhBaseDir, `${relativePath}.ts`);
          const enTargetFile = path.join(enBaseDir, `${relativePath}.ts`);
          
          generatedFiles.push(relativePath);

          // 1. Generate/Update zh-CN sub-file
          await writeLocaleFile(zhTargetFile, entries, true);
          
          // 2. Generate/Update en-US sub-file
          // We need to construct entries for en-US.
          // Sources: 
          // a. Existing en sub-file (handled by writeLocaleFile merge)
          // b. Existing single en file (migration)
          // c. New keys from zh (use zh value as default)
          
          const enSubEntries: Record<string, string> = {};
          
          // Populate with existing translations from single file if available
          Object.keys(entries).forEach(key => {
              if (existingEnEntries[key]) {
                  enSubEntries[key] = existingEnEntries[key];
              } else {
                  // Fallback to zh value
                  enSubEntries[key] = entries[key] || key;
              }
          });

          await writeLocaleFile(enTargetFile, enSubEntries, true);
      }

      // Generate index.ts for export
      const imports: string[] = [];
      const spreads: string[] = [];
      
      generatedFiles.forEach((file, index) => {
          const varName = `locale${index}`;
          const importPath = `./${localeFileName}/${file}`;
          imports.push(`import ${varName} from '${importPath}';`);
          spreads.push(`...${varName},`);
      });
      
      const entryContent = `${imports.join('\n')}\n\nexport default {\n  ${spreads.join('\n  ')}\n};\n`;
      fs.writeFileSync(zhEntryFile, entryContent, 'utf-8');
      console.log(chalk.green(`Updated entry file: ${zhEntryFile}`));

      const enImports: string[] = [];
      const enSpreads: string[] = [];
      
      generatedFiles.forEach((file, index) => {
          const varName = `locale${index}`;
          const importPath = `./${enFileName}/${file}`;
          enImports.push(`import ${varName} from '${importPath}';`);
          enSpreads.push(`...${varName},`);
      });
      
      const enEntryContent = `${enImports.join('\n')}\n\nexport default {\n  ${enSpreads.join('\n  ')}\n};\n`;
      fs.writeFileSync(enEntryFile, enEntryContent, 'utf-8');
      console.log(chalk.green(`Updated entry file: ${enEntryFile}`));

  } else {
      // Single file mode
      
      // If switching from multi-file to single file, we need to collect all sub-files?
      // Actually, collectedLocales has all current keys.
      // But we might lose existing English translations if they are in sub-files.
      
      // So we should try to read existing sub-files if they exist.
      let existingEnSubEntries: Record<string, string> = {};
      
      // Also need to read existing en-US.ts content if it exists, to preserve translations that are already there
      // (e.g. if we run multiple times in single file mode)
      const readEntries = (filePath: string): Record<string, string> => {
          if (!fs.existsSync(filePath)) return {};
          try {
              const content = fs.readFileSync(filePath, 'utf-8');
              const ast = parser.parse(content, { sourceType: 'module' });
              let props: any[] = [];
              traverse(ast, {
                  ExportDefaultDeclaration(path: any) {
                      if (t.isObjectExpression(path.node.declaration)) {
                          props = path.node.declaration.properties;
                      }
                  }
              });
              const entries: Record<string, string> = {};
              props.forEach((prop: any) => {
                 let key = '';
                 let value = '';
                 if (t.isIdentifier(prop.key)) key = prop.key.name;
                 else if (t.isStringLiteral(prop.key)) key = prop.key.value;
                 if (t.isStringLiteral(prop.value)) value = prop.value.value;
                 if (key) entries[key] = value;
              });
              return entries;
          } catch (e) { return {}; }
      };

      const existingEnMainEntries = readEntries(enEntryFile);

      if (fs.existsSync(enBaseDir)) {
          // Read all .ts files in enBaseDir recursively?
          // For simplicity, let's just assume flat structure or we can use glob if needed.
          // But wait, collectedLocales has the namespace structure.
          // We can construct the path and read.
           for (const namespace of Object.keys(collectedLocales)) {
              let relativePath = namespace;
              if (relativePath.startsWith('src/')) {
                  relativePath = relativePath.replace('src/', '');
              }
              const enSubFile = path.join(enBaseDir, `${relativePath}.ts`);
              
              const subEntries = readEntries(enSubFile);
              Object.assign(existingEnSubEntries, subEntries);
           }
      }

      // Flatten entries 
      const allEntries: Record<string, string> = {};
      
      for (const [namespace, entries] of Object.entries(collectedLocales)) {
          Object.entries(entries).forEach(([key, value]) => {
              allEntries[key] = value;
          });
      }
      
      // Cleanup for zh-CN.ts (source of truth)
      await writeLocaleFile(zhEntryFile, allEntries, true);

      // Generate en-US.ts
      // Merge:
      // 1. Existing en-US.ts entries (from existingEnMainEntries)
      // 2. Existing en sub-files entries (migration from existingEnSubEntries)
      // 3. New keys from allEntries (default to zh value)
      
      const allEnEntries: Record<string, string> = {};
      
      Object.keys(allEntries).forEach(key => {
           // Priority: 
           // 1. Existing main file translation (highest priority, keep what we have)
           // 2. Existing sub-file translation (if migrating)
           // 3. Zh value (default)
           
           // If existing value is same as key, we consider it as not translated and overwrite with zh value (placeholder)
           if (existingEnMainEntries[key] && existingEnMainEntries[key] !== key) {
               allEnEntries[key] = existingEnMainEntries[key];
           } else if (existingEnSubEntries[key] && existingEnSubEntries[key] !== key) {
               allEnEntries[key] = existingEnSubEntries[key];
           } else {
               allEnEntries[key] = allEntries[key];
           }
      });
      
      await writeLocaleFile(enEntryFile, allEnEntries, true);

      // Clean up directories if they exist
      if (fs.existsSync(zhBaseDir)) {
          fs.removeSync(zhBaseDir);
          console.log(chalk.yellow(`Removed directory: ${zhBaseDir}`));
      }
      if (fs.existsSync(enBaseDir)) {
          fs.removeSync(enBaseDir);
          console.log(chalk.yellow(`Removed directory: ${enBaseDir}`));
      }
  }
}
