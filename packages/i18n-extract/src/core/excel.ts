import * as XLSX from 'xlsx';
// @ts-ignore
import chalk from 'chalk';
import { CollectedLocales } from '../types';

export function exportExcel(collectedLocales: CollectedLocales, excelPath: string) {
  const rows: any[] = [];
  Object.entries(collectedLocales).forEach(([ns, entries]) => {
      Object.entries(entries).forEach(([key, value]) => {
          rows.push({
              Namespace: ns,
              Key: key,
              'zh-CN': value,
              'en-US': '' // Placeholder
          });
      });
  });
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Locales");
  XLSX.writeFile(wb, excelPath);
  console.log(chalk.green(`Exported Excel to ${excelPath}`));
}
