import path from 'path';
import pinyin from 'pinyin';
import { Config } from './types';

export function getNamespace(filePath: string, config: Config): string {
    const relativePath = path.relative(process.cwd(), filePath);
    // Remove extension
    const parsed = path.parse(relativePath);
    return path.join(parsed.dir, parsed.name);
}

export function defaultCustomizeKey(text: string) {
  const py = pinyin(text, {
    style: pinyin.STYLE_NORMAL,
    compact: false,
  });

  return py
    .flat()
    .map((item: string, index: number) => {
      if (index === 0) {
        return item;
      }
      return item.charAt(0).toUpperCase() + item.slice(1);
    })
    .join('')
    .replace(/\s+/g, '');
}
