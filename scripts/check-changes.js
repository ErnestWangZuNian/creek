#!/usr/bin/env node

/**
 * 检测包变更的 Node.js 脚本
 * 更精确的变更检测逻辑
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ChangeDetector {
    constructor() {
        this.packagesDir = path.join(process.cwd(), 'packages');
        this.lastTag = this.getLastTag();
    }

    getLastTag() {
        try {
            return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
        } catch {
            return null;
        }
    }

    getChangedFiles(since = this.lastTag) {
        if (!since) {
            console.log('没有找到标签，返回所有文件');
            return this.getAllPackageFiles();
        }

        try {
            const output = execSync(`git diff --name-only ${since} HEAD`, { encoding: 'utf8' });
            return output.trim().split('\n').filter(Boolean);
        } catch (error) {
            console.error('获取变更文件失败:', error.message);
            return [];
        }
    }

    getAllPackageFiles() {
        const files = [];
        const packages = fs.readdirSync(this.packagesDir);
        
        packages.forEach(pkg => {
            const pkgPath = path.join(this.packagesDir, pkg);
            if (fs.statSync(pkgPath).isDirectory()) {
                files.push(`packages/${pkg}/package.json`);
            }
        });
        
        return files;
    }

    getChangedPackages() {
        const changedFiles = this.getChangedFiles();
        const changedPackages = new Set();

        changedFiles.forEach(file => {
            const match = file.match(/^packages\/([^/]+)\//); 
            if (match) {
                changedPackages.add(match[1]);
            }
        });

        return Array.from(changedPackages);
    }

    getPackageInfo(packageName) {
        const packagePath = path.join(this.packagesDir, packageName, 'package.json');
        
        if (!fs.existsSync(packagePath)) {
            return null;
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            return {
                name: packageJson.name,
                version: packageJson.version,
                path: path.dirname(packagePath)
            };
        } catch (error) {
            console.error(`解析 ${packagePath} 失败:`, error.message);
            return null;
        }
    }

    async getNpmVersion(packageName) {
        try {
            const output = execSync(`pnpm view ${packageName} version`, { encoding: 'utf8' });
            return output.trim();
        } catch {
            return '0.0.0';
        }
    }

    async checkAllPackages() {
        const changedPackages = this.getChangedPackages();
        const results = [];

        for (const pkgName of changedPackages) {
            const info = this.getPackageInfo(pkgName);
            if (!info) continue;

            const npmVersion = await this.getNpmVersion(info.name);
            
            results.push({
                packageName: pkgName,
                fullName: info.name,
                currentVersion: info.version,
                npmVersion,
                needsPublish: info.version !== npmVersion || this.lastTag === null,
                path: info.path
            });
        }

        return results;
    }

    async run() {
        console.log('🔍 检测包变更...');
        console.log(`📍 最后标签: ${this.lastTag || '无'}`);
        
        const results = await this.checkAllPackages();
        
        if (results.length === 0) {
            console.log('✅ 没有检测到包变更');
            return;
        }

        console.log('\n📦 变更的包:');
        results.forEach(result => {
            const status = result.needsPublish ? '🚀 需要发布' : '⏭️  跳过';
            console.log(`  ${status} ${result.fullName}`);
            console.log(`    当前版本: ${result.currentVersion}`);
            console.log(`    NPM 版本: ${result.npmVersion}`);
            console.log('');
        });

        // 输出 JSON 格式供脚本使用
        if (process.argv.includes('--json')) {
            console.log('\n' + JSON.stringify(results, null, 2));
        }
    }
}

if (require.main === module) {
    const detector = new ChangeDetector();
    detector.run().catch(console.error);
}

module.exports = ChangeDetector;