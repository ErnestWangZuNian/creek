import fs from 'fs-extra';
import { green, red } from 'kolorist';
import minimist from 'minimist';
import path from 'path';
import prompts from 'prompts';

async function init() {
  const cwd = process.cwd();

  const argv = minimist(process.argv.slice(2));
  let targetDir = argv._[0];
  let platform = argv.platform || argv.p;
  const defaultTargetDir = 'creek-project';

  let result: any;

  try {
    result = await prompts(
      [
        {
          type: targetDir ? null : 'text',
          name: 'projectName',
          message: 'Project name:',
          initial: defaultTargetDir,
          onState: (state: any) => {
            targetDir = state.value.trim() || defaultTargetDir;
          },
        },
        {
          type: platform ? null : 'select',
          name: 'platform',
          message: 'Select platform:',
          choices: [
            { title: 'PC (Admin/Web)', value: 'pc' },
            { title: 'Mobile (Taro)', value: 'mobile' },
          ],
          initial: 0,
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled');
        },
      } as any
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }

  const { projectName } = result;
  // If platform is provided via args, use it, otherwise use prompt result
  platform = platform || result.platform;
  
  const root = path.join(cwd, targetDir || projectName);

  if (fs.existsSync(root)) {
     console.log(red(`Target directory ${targetDir} already exists.`));
     return;
  }

  console.log(`\nScaffolding project in ${root}...`);

  const templateDir = path.resolve(__dirname, `../templates/${platform}`);
  
  if (!fs.existsSync(templateDir)) {
    console.log(red(`Template for ${platform} not found at ${templateDir}`));
    return;
  }

  await fs.copy(templateDir, root);

  // Rename _gitignore to .gitignore
  const gitignorePath = path.join(root, '.gitignore');
  const gitignoreRenamePath = path.join(root, '_gitignore');
  if (fs.existsSync(gitignoreRenamePath)) {
    await fs.move(gitignoreRenamePath, gitignorePath);
  }

  // Update package.json name
  const pkgPath = path.join(root, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = path.basename(root);
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  console.log(`\n${green('Done. Now run:')}\n`);
  console.log(`  cd ${path.relative(cwd, root)}`);
  console.log(`  pnpm install`);

  if (platform === 'mobile') {
    console.log(`  pnpm dev:h5    (for H5)`);
    console.log(`  pnpm dev:weapp (for WeChat Mini Program)`);
  } else {
    console.log(`  pnpm dev`);
  }
}

init().catch((e) => {
  console.error(e);
});
