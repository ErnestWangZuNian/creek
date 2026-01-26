const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.resolve(__dirname, '../../../apps/pc');
const targetDir = path.resolve(__dirname, '../templates/default');

// Ensure target directory exists
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// Copy files
console.log('Copying template files...');
// Copy all files including hidden ones
execSync(`cp -R ${sourceDir}/ ${targetDir}/`);

// Clean up ignored files
const filesToRemove = ['node_modules', '.umi', 'dist', '.turbo', 'coverage', '.git'];
filesToRemove.forEach(file => {
  const filePath = path.join(targetDir, file);
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { recursive: true, force: true });
  }
});

// Rename .gitignore to _gitignore
const gitignorePath = path.join(targetDir, '.gitignore');
const gitignoreRenamePath = path.join(targetDir, '_gitignore');
if (fs.existsSync(gitignorePath)) {
  fs.renameSync(gitignorePath, gitignoreRenamePath);
}

// Update package.json
console.log('Updating package.json...');
const pkgPath = path.join(targetDir, 'package.json');
const pkg = require(pkgPath);

// Dependencies to inject/update
const dependenciesToInject = {
  '@creekjs/request': 'latest',
  '@creekjs/web-components': 'latest'
};

const devDependenciesToInject = {
  '@creekjs/umi-plugins': 'latest'
};

pkg.dependencies = {
  ...pkg.dependencies,
  ...dependenciesToInject
};

pkg.devDependencies = {
  ...pkg.devDependencies,
  ...devDependenciesToInject
};

// Replace workspace:* with latest
const replaceWorkspace = (deps) => {
  if (!deps) return;
  Object.keys(deps).forEach(key => {
    if (deps[key].startsWith('workspace:')) {
      deps[key] = 'latest';
    }
  });
};

replaceWorkspace(pkg.dependencies);
replaceWorkspace(pkg.devDependencies);

// Reset name
pkg.name = '{{PROJECT_NAME}}';

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log('Template sync complete.');
