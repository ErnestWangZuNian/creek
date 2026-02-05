const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const templates = [
  {
    name: 'pc',
    source: path.resolve(__dirname, '../../../apps/pc-demo'),
    target: path.resolve(__dirname, '../templates/pc'),
    dependenciesToInject: {
      '@creekjs/request': 'latest',
      '@creekjs/web-components': 'latest'
    },
    devDependenciesToInject: {
      '@creekjs/lint': 'latest'
    }
  },
  {
    name: 'mobile',
    source: path.resolve(__dirname, '../../../apps/mobile'),
    target: path.resolve(__dirname, '../templates/mobile'),
    dependenciesToInject: {},
    devDependenciesToInject: {}
  }
];

// Clean up templates directory
const templatesDir = path.resolve(__dirname, '../templates');
if (fs.existsSync(templatesDir)) {
  fs.rmSync(templatesDir, { recursive: true, force: true });
}
fs.mkdirSync(templatesDir, { recursive: true });

templates.forEach(template => {
  console.log(`\nSyncing template: ${template.name}...`);
  const { source, target, dependenciesToInject, devDependenciesToInject } = template;

  // Ensure target directory exists
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.mkdirSync(target, { recursive: true });

  // Copy files
  console.log(`  Copying files from ${source} to ${target}...`);
  // Copy all files including hidden ones
  execSync(`cp -R ${source}/ ${target}/`);

  // Clean up ignored files
  const filesToRemove = [
    'node_modules', 
    '.umi', 
    '.umi-production',
    'dist', 
    '.turbo', 
    'coverage', 
    '.git', 
    '.DS_Store',
    '.swc',
    'src/.umi',
    'src/.umi-production'
  ];
  filesToRemove.forEach(file => {
    const filePath = path.join(target, file);
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true });
    }
  });

  // Rename .gitignore to _gitignore
  const gitignorePath = path.join(target, '.gitignore');
  const gitignoreRenamePath = path.join(target, '_gitignore');
  if (fs.existsSync(gitignorePath)) {
    fs.renameSync(gitignorePath, gitignoreRenamePath);
  }

  // Update package.json
  console.log('  Updating package.json...');
  const pkgPath = path.join(target, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = require(pkgPath);

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
    
    // Remove private: true if needed, or keep it. Usually templates for end users shouldn't be private unless they are internal tools.
    // For now I'll keep it as is from source, but maybe remove "private": true?
    // Let's just keep it as is to match original behavior, except name.
    
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  } else {
    console.warn(`  Warning: package.json not found in ${target}`);
  }
});

console.log('\nAll templates synced successfully.');
