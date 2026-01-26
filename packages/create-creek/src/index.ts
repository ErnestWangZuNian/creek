import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import { red, green, bold } from 'kolorist';

async function init() {
  const cwd = process.cwd();

  let targetDir = process.argv[2];
  const defaultTargetDir = 'creek-project';

  let result: prompts.Answers<'projectName'>;

  try {
    result = await prompts(
      [
        {
          type: targetDir ? null : 'text',
          name: 'projectName',
          message: 'Project name:',
          initial: defaultTargetDir,
          onState: (state) => {
            targetDir = state.value.trim() || defaultTargetDir;
          },
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled');
        },
      }
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }

  const { projectName } = result;
  const root = path.join(cwd, targetDir || projectName);

  if (fs.existsSync(root)) {
     console.log(red(`Target directory ${targetDir} already exists.`));
     return;
  }

  console.log(`\nScaffolding project in ${root}...`);

  const templateDir = path.resolve(__dirname, '../templates/default');

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
  console.log(`  pnpm dev`);
}

init().catch((e) => {
  console.error(e);
});
