import { program } from 'commander';
import glob from 'glob';
// @ts-ignore
import chalk from 'chalk';
import { resolveConfig } from './config';
import { exportExcel } from './core/excel';
import { generateLocales } from './core/generator';
import { processFile } from './core/parser';
import { CollectedLocales } from './types';

program
  .version('1.0.0')
  .option('-p, --path <path>', 'Path to source files')
  .option('-o, --out <path>', 'Output directory for locale files')
  .option('-c, --config <path>', 'Path to config file')
  .option('--excel <path>', 'Path to export excel file')
  .parse(process.argv);

const cliOptions = program.opts();

async function run() {
  const config = resolveConfig(cliOptions);

  const files = glob.sync(config.path, {
    ignore: config.exclude,
  });

  console.log(chalk.blue(`Found ${files.length} files to scan...`));

  // Global collection of locales
  const collectedLocales: CollectedLocales = {};

  for (const file of files) {
    try {
      await processFile(file, config, collectedLocales);
    } catch (error) {
      console.error(chalk.red(`Error processing ${file}:`), error);
    }
  }

  // Generate Locale Files
  await generateLocales(collectedLocales, config);

  // Export to Excel
  if (config.excelPath) {
    exportExcel(collectedLocales, config.excelPath);
  }
}

run();
