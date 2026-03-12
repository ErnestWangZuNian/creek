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
import { getNamespace } from '../utils';

function getImportAst(statement: string): t.ImportDeclaration {
    try {
        const ast = parser.parse(statement, { sourceType: 'module' });
        if (ast.program.body.length > 0 && t.isImportDeclaration(ast.program.body[0])) {
            return ast.program.body[0];
        }
    } catch (e) {
        console.error(chalk.red(`Invalid import statement in config: ${statement}`));
    }
    // Fallback
    return t.importDeclaration(
        [t.importSpecifier(t.identifier('t'), t.identifier('t'))],
        t.stringLiteral('@/utils/i18n')
    );
}

function processCode(
    content: string, 
    filePath: string, 
    config: Config, 
    collectedLocales: CollectedLocales
): { code: string; hasChanges: boolean } {
  try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'classProperties', 'decorators-legacy'],
      });

      let hasChanges = false;
      const namespace = getNamespace(filePath, config);

      traverse(ast, {
        StringLiteral(path: any) {
          const { value } = path.node;
          if (/[\u4e00-\u9fa5]/.test(value)) {
            if (path.parent.type === 'ImportDeclaration') return;
            if (
              path.parent.type === 'CallExpression' &&
              t.isMemberExpression(path.parent.callee) &&
              t.isIdentifier(path.parent.callee.object) &&
              path.parent.callee.object.name === 'console'
            ) {
              return;
            }
            if (
                path.parent.type === 'CallExpression' &&
                t.isIdentifier(path.parent.callee) &&
                path.parent.callee.name === config.tFunction
            ) {
                return;
            }
            
            // Generate full key if single file mode
            // With the new default config, customizeKey ALREADY returns the full key (with prefix)
            // But we need to handle if user provided custom logic that doesn't include prefix
            
            // Actually, let's simplify. 
            // If useDirectoryAsNamespace is false, we assume customizeKey returns the key we want to use in code.
            // And generator will use that same key.
            
            const fullKey = config.customizeKey(value, filePath);

            // JSX Attribute check (e.g. title="中文")
            if (path.parent.type === 'JSXAttribute') {
                if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
                
                // We store the key as returned by customizeKey.
                // Generator needs to be updated to NOT prepend prefix if customizeKey already does it?
                // Or we rely on generator to flatten.
                
                collectedLocales[namespace][fullKey] = value;

                const tCall = t.jsxExpressionContainer(
                    t.callExpression(t.identifier(config.tFunction), [
                        t.stringLiteral(fullKey),
                        t.stringLiteral(value)
                    ])
                );
                 path.replaceWith(tCall);
                 hasChanges = true;
                 return;
            }

            if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
            collectedLocales[namespace][fullKey] = value;

            const tCall = t.callExpression(t.identifier(config.tFunction), [
              t.stringLiteral(fullKey),
              t.stringLiteral(value),
            ]);
            
            path.replaceWith(tCall);
            hasChanges = true;
          }
        },
        JSXText(path: any) {
          const { value } = path.node;
          if (/[\u4e00-\u9fa5]/.test(value)) {
            const cleanValue = value.trim();
            if (!cleanValue) return;

            const fullKey = config.customizeKey(cleanValue, filePath);

            if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
            collectedLocales[namespace][fullKey] = cleanValue;

            const tCall = t.callExpression(t.identifier(config.tFunction), [
              t.stringLiteral(fullKey),
              t.stringLiteral(cleanValue),
            ]);
            
            path.replaceWith(t.jsxExpressionContainer(tCall));
            hasChanges = true;
          }
        },
      });

      if (hasChanges) {
        let hasImportT = false;
        traverse(ast, {
            ImportDeclaration(path: any) {
                path.node.specifiers.forEach((spec: any) => {
                    if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported) && spec.imported.name === config.tFunction) {
                        hasImportT = true;
                    }
                });
            }
        });

        if (!hasImportT) {
            const importDecl = getImportAst(config.importStatement);
            ast.program.body.unshift(importDecl);
        }

        const { code } = generate(ast, {
            decoratorsBeforeExport: true,
            jsescOption: { minimal: true },
        }, content);
        
        return { code, hasChanges: true };
      }
      return { code: content, hasChanges: false };
  } catch (e) {
      console.warn(chalk.yellow(`Failed to parse code in ${filePath}: ${e}`));
      return { code: content, hasChanges: false };
  }
}

function processReactFile(filePath: string, content: string, config: Config, collectedLocales: CollectedLocales) {
    const { code, hasChanges } = processCode(content, filePath, config, collectedLocales);
    if (hasChanges) {
        fs.writeFileSync(filePath, code, 'utf-8');
        console.log(chalk.green(`Processed: ${filePath}`));
    }
}

function processVueFile(filePath: string, content: string, config: Config, collectedLocales: CollectedLocales) {
    let newContent = content;
    let hasChanges = false;
    const namespace = getNamespace(filePath, config);

    // 1. Process Script Block
    const scriptRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/g;
    newContent = newContent.replace(scriptRegex, (match, openTag, scriptContent, closeTag) => {
        const { code, hasChanges: scriptChanged } = processCode(scriptContent, filePath, config, collectedLocales);
        if (scriptChanged) {
            hasChanges = true;
            return `${openTag}${code}${closeTag}`;
        }
        return match;
    });

    // 2. Template Text: >中文<
    const templateTextRegex = />([^<]*?[\u4e00-\u9fa5]+[^<]*?)</g;
    newContent = newContent.replace(templateTextRegex, (match, text) => {
        const cleanText = text.trim();
        if (!cleanText) return match;
        
        const keyPart = config.customizeKey(cleanText, filePath);
        if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
        collectedLocales[namespace][keyPart] = cleanText;
        
        hasChanges = true;
        // Replace with {{ $t('key') }}
        return `>{{ $${config.tFunction}('${keyPart}') }}<`; 
    });

    // 3. Attributes: title="中文"
    const attrRegex = /\s([a-zA-Z0-9-]+)="([^"]*?[\u4e00-\u9fa5]+[^"]*?)"/g;
    newContent = newContent.replace(attrRegex, (match, attr, value) => {
        const keyPart = config.customizeKey(value, filePath);
        if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
        collectedLocales[namespace][keyPart] = value;
        
        hasChanges = true;
        // Replace with :title="$t('key')"
        return ` :${attr}="$${config.tFunction}('${keyPart}')"`;
    });

    if (hasChanges) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(chalk.green(`Processed Vue: ${filePath}`));
    }
}

export function processFile(filePath: string, config: Config, collectedLocales: CollectedLocales) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!/[\u4e00-\u9fa5]/.test(content)) return;

  const ext = path.extname(filePath);
  if (ext === '.vue') {
      processVueFile(filePath, content, config, collectedLocales);
  } else {
      processReactFile(filePath, content, config, collectedLocales);
  }
}
