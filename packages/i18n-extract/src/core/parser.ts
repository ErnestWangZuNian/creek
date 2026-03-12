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
import prettier from 'prettier';
import { CollectedLocales, Config } from '../types';
import { getNamespace } from '../utils';

async function formatCode(code: string, filePath: string) {
    try {
        const options = await prettier.resolveConfig(filePath) || {};
        return await prettier.format(code, { ...options, filepath: filePath });
    } catch (e) {
        console.warn(chalk.yellow(`Prettier formatting failed for ${filePath}: ${e}`));
        return code;
    }
}

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

async function processCode(
    content: string, 
    filePath: string, 
    config: Config, 
    collectedLocales: CollectedLocales
): Promise<{ code: string; hasChanges: boolean }> {
  try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'classProperties', 'decorators-legacy'],
      });

      let hasChanges = false;
      const namespace = getNamespace(filePath, config);
      const replacements: Array<{ start: number; end: number; text: string }> = [];

      traverse(ast, {
        CallExpression(path: any) {
            // Check for t('key')
            if (t.isIdentifier(path.node.callee) && path.node.callee.name === config.tFunction) {
                const args = path.node.arguments;
                if (args.length > 0 && t.isStringLiteral(args[0])) {
                    const key = args[0].value;
                    if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
                    
                    // Mark as used. We don't know the value, so we use a special marker or the key itself.
                    // If the key already exists in collectedLocales (from Chinese string), we don't overwrite it.
                    if (!collectedLocales[namespace][key]) {
                        collectedLocales[namespace][key] = 'PRESERVED_TRANSLATION'; 
                        // Note: If 'PRESERVED_TRANSLATION' ends up in the file, it means it's a new key without translation.
                        // But usually this key should already exist in the locale file.
                        // The generator will see this key and KEEP it in the locale file.
                        // If it's a new key, it will be added with this value (which is not ideal, but better than crashing).
                        // Ideally we should use the key as the default value if we don't know the Chinese.
                         collectedLocales[namespace][key] = key; 
                    }
                }
            }
        },
        StringLiteral(path: any) {
          const { value } = path.node;
          if (/[\u4e00-\u9fa5]/.test(value)) {
            // Check for ignore comments
            let comments: any[] = [];
            let p = path;
            // Check current node and parents up to 3 levels (e.g. VariableDeclarator -> VariableDeclaration)
            for (let i = 0; i < 3; i++) {
                if (p.node) {
                     comments.push(...(p.node.leadingComments || []));
                     comments.push(...(p.node.trailingComments || []));
                     comments.push(...(p.node.innerComments || []));
                }
                if (p.parentPath) {
                    p = p.parentPath;
                } else {
                    break;
                }
            }
            if (comments.some((c: any) => c.value.includes('i18n-ignore'))) return;

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
            
            const fullKey = config.customizeKey(value, filePath);

            // JSX Attribute check (e.g. title="中文")
            if (path.parent.type === 'JSXAttribute') {
                if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
                collectedLocales[namespace][fullKey] = value;

                const tCall = t.jsxExpressionContainer(
                    t.callExpression(t.identifier(config.tFunction), [
                        t.stringLiteral(fullKey),
                        t.stringLiteral(value)
                    ])
                );
                 
                // Generate code for replacement
                const { code: newCode } = generate(tCall, { jsescOption: { minimal: true } });
                replacements.push({
                    start: path.node.start,
                    end: path.node.end,
                    text: newCode
                });
                hasChanges = true;
                return;
            }

            if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
            collectedLocales[namespace][fullKey] = value;

            const tCall = t.callExpression(t.identifier(config.tFunction), [
              t.stringLiteral(fullKey),
              t.stringLiteral(value),
            ]);
            
            const { code: newCode } = generate(tCall, { jsescOption: { minimal: true } });
            replacements.push({
                start: path.node.start,
                end: path.node.end,
                text: newCode
            });
            hasChanges = true;
          }
        },
        JSXText(path: any) {
          const { value } = path.node;
          if (/[\u4e00-\u9fa5]/.test(value)) {
            // Check for ignore comments
            // For JSX Text, comments are typically in a JSXExpressionContainer sibling
            // e.g. {/* i18n-ignore */} 中文
            if (path.container && typeof path.key === 'number') {
                const prevSibling = path.container[path.key - 1];
                if (
                    prevSibling && 
                    t.isJSXExpressionContainer(prevSibling) && 
                    t.isJSXEmptyExpression(prevSibling.expression) &&
                    prevSibling.expression.innerComments &&
                    prevSibling.expression.innerComments.some((c: any) => c.value.includes('i18n-ignore'))
                ) {
                    return;
                }
            }
            
            // Also check parent (JSXElement) comments
             let p = path;
             for (let i = 0; i < 3; i++) {
                 if (p.node) {
                      const comments = [
                        ...(p.node.leadingComments || []),
                        ...(p.node.trailingComments || []),
                        ...(p.node.innerComments || [])
                      ];
                      if (comments.some((c: any) => c.value.includes('i18n-ignore'))) return;
                 }
                 if (p.parentPath) {
                     p = p.parentPath;
                 } else {
                     break;
                 }
             }

            const cleanValue = value.trim();
            if (!cleanValue) return;

            const fullKey = config.customizeKey(cleanValue, filePath);

            if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
            collectedLocales[namespace][fullKey] = cleanValue;

            const tCall = t.callExpression(t.identifier(config.tFunction), [
              t.stringLiteral(fullKey),
              t.stringLiteral(cleanValue),
            ]);
            
            const { code: newCode } = generate(t.jsxExpressionContainer(tCall), { jsescOption: { minimal: true } });
            replacements.push({
                start: path.node.start,
                end: path.node.end,
                text: newCode
            });
            hasChanges = true;
          }
        },
      });

      if (hasChanges) {
        // Apply replacements in reverse order
        replacements.sort((a, b) => b.start - a.start);
        
        let newContent = content;
        for (const { start, end, text } of replacements) {
            // Check boundaries
            if (start !== undefined && end !== undefined) {
                 newContent = newContent.slice(0, start) + text + newContent.slice(end);
            }
        }

        // Check for import
        let hasImportT = false;
        let lastImportEnd = 0;
        
        traverse(ast, {
            ImportDeclaration(path: any) {
                lastImportEnd = path.node.end;
                path.node.specifiers.forEach((spec: any) => {
                    if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported) && spec.imported.name === config.tFunction) {
                        hasImportT = true;
                    }
                });
            }
        });

        if (!hasImportT) {
            const importStr = config.importStatement || "import { t } from '@/utils/i18n';";
            // Insert after last import if exists, else at top
            if (lastImportEnd > 0) {
                 // Try to insert on a new line after the last import
                 newContent = newContent.slice(0, lastImportEnd) + '\n' + importStr + newContent.slice(lastImportEnd);
            } else {
                 newContent = importStr + '\n' + newContent;
            }
        }
        
        const formatted = await formatCode(newContent, filePath);
        return { code: formatted, hasChanges: true };
      }
      return { code: content, hasChanges: false };
  } catch (e) {
      console.warn(chalk.yellow(`Failed to parse code in ${filePath}: ${e}`));
      return { code: content, hasChanges: false };
  }
}

async function processReactFile(filePath: string, content: string, config: Config, collectedLocales: CollectedLocales) {
    const { code, hasChanges } = await processCode(content, filePath, config, collectedLocales);
    if (hasChanges) {
        fs.writeFileSync(filePath, code, 'utf-8');
        console.log(chalk.green(`Processed: ${filePath}`));
    }
}

async function processVueFile(filePath: string, content: string, config: Config, collectedLocales: CollectedLocales) {
    let newContent = content;
    let hasChanges = false;
    const namespace = getNamespace(filePath, config);

    // 1. Process Script Block
    const scriptRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/g;
    // We cannot use replace with async callback. We must use a loop or something else.
    // Or just format the whole file at the end.
    
    // For script block, we need to extract and process.
    // Since replace callback cannot be async, we have to collect replacements first.
    
    // Actually, processCode is async now. So we can't use replace(regex, callback).
    
    // Let's refactor script processing.
    const matches = [];
    let match;
    while ((match = scriptRegex.exec(newContent)) !== null) {
        matches.push({
            fullMatch: match[0],
            openTag: match[1],
            content: match[2],
            closeTag: match[3],
            index: match.index
        });
    }
    
    // Process in reverse so indices don't shift? No, we replace specific parts.
    // Or just replace sequentially.
    
    for (const m of matches) {
        const { code, hasChanges: scriptChanged } = await processCode(m.content, filePath, config, collectedLocales);
        if (scriptChanged) {
             hasChanges = true;
             newContent = newContent.replace(m.fullMatch, `${m.openTag}${code}${m.closeTag}`);
        }
    }

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

    // 2.1 Scan for existing {{ $t('key') }} in template
    const existingTemplateRegex = new RegExp(`\\{\\{\\s*\\$${config.tFunction}\\('([^']+)'\\)\\s*\\}\\}`, 'g');
    let tm;
    while ((tm = existingTemplateRegex.exec(newContent)) !== null) {
        const key = tm[1];
        if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
        if (!collectedLocales[namespace][key]) {
            collectedLocales[namespace][key] = key;
        }
    }

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

    // 3.1 Scan for existing :title="$t('key')" in attributes
    const existingAttrRegex = new RegExp(`:[a-zA-Z0-9-]+="\\$${config.tFunction}\\('([^']+)'\\)"`, 'g');
    let am;
    while ((am = existingAttrRegex.exec(newContent)) !== null) {
        const key = am[1];
        if (!collectedLocales[namespace]) collectedLocales[namespace] = {};
        if (!collectedLocales[namespace][key]) {
            collectedLocales[namespace][key] = key;
        }
    }

    if (hasChanges) {
        const formatted = await formatCode(newContent, filePath);
        fs.writeFileSync(filePath, formatted, 'utf-8');
        console.log(chalk.green(`Processed Vue: ${filePath}`));
    }
}

export async function processFile(filePath: string, config: Config, collectedLocales: CollectedLocales) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!/[\u4e00-\u9fa5]/.test(content)) return;

  const ext = path.extname(filePath);
  if (ext === '.vue') {
      await processVueFile(filePath, content, config, collectedLocales);
  } else {
      await processReactFile(filePath, content, config, collectedLocales);
  }
}
