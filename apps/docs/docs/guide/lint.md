# 代码规范 (@creekjs/lint)

在大型中后台项目中，统一的代码规范是保证代码质量、降低协作成本的基石。CreekJS 提供了 `@creekjs/lint` 包，它是一个开箱即用的、统一的代码规范配置集合。

## 为什么需要 @creekjs/lint？

传统项目中，配置代码规范通常是一件非常繁琐的事情，你需要：
1. 安装大量的 `eslint-plugin-*`, `prettier-*`, `stylelint-*` 依赖。
2. 在项目根目录堆砌各种复杂的 `.eslintrc`, `.prettierrc`, `.stylelintrc` 配置文件。
3. 团队成员之间容易出现配置不一致，导致频繁的合并冲突。
4. 随着各种 Linter 的升级，维护这些依赖版本和解决冲突变成了一种负担。

`@creekjs/lint` 的设计目标就是**将所有的规范约束收敛到一个包中**。业务项目只需一行引用，即可实现全量规范校验，极大降低了规范配置的成本。

## 核心特性与设计

`@creekjs/lint` 底层基于 `@umijs/lint` 的最佳实践，并针对 CreekJS 体系做了专属增强：

### 1. 🎯 开箱即用的 ESLint 配置
- 内置了 React, TypeScript, 甚至 Hooks 的依赖检查规则。
- 自动关闭了一些可能引发不必要警告的规则（如适配 Next.js / Umi 路由的 `a` 标签检查）。
- 强制要求组件使用自闭合语法（`<Component />` 代替 `<Component></Component>`），让代码更简洁。

### 2. 🎨 统一的 Prettier 代码格式化与 Import 排序
- **自动导入排序**：这是该包的一个亮点。它内置了 `@trivago/prettier-plugin-sort-imports`，在保存文件时，会自动按照以下顺序对 `import` 语句进行分组和排序：
  1. React/Antd/Umi 等核心基础库。
  2. 其他第三方 `node_modules` 依赖。
  3. `@creekjs/*` 生态包。
  4. `@/*` 业务内部别名导入。
  5. 相对路径导入 (`./` 或 `../`)。
- 统一了单引号、行宽（100字符）、尾随逗号等格式化风格。

### 3. 💅 Stylelint 样式规范
- 提供了标准的 CSS/LESS/SCSS 样式检查。
- 自动忽略了一些在 Ant Design 或 Less 中常见的特殊函数（如 `fade`）引发的未知函数警告。

### 4. 🔧 统一的 TSConfig 基准
- 提供了一套推荐的 `tsconfig.base.json`，业务项目可直接继承，确保 TypeScript 的编译目标、模块解析策略和严格模式配置保持一致。

---

## 如何在业务项目中使用

如果你的项目是通过 `create-creek` 生成的，这些配置已经自动为你设置好了。如果是手动接入，请参考以下指南：

### 1. 安装依赖

```bash
pnpm add @creekjs/lint -D
```

### 2. ESLint 配置 (`.eslintrc.js`)

```javascript
module.exports = {
  extends: ['@creekjs/lint/eslint/base'],
};
```

### 3. Prettier 配置 (`.prettierrc.js`)

```javascript
module.exports = require('@creekjs/lint/prettier');
```

### 4. Stylelint 配置 (`.stylelintrc.js`)

```javascript
module.exports = {
  extends: ['@creekjs/lint/stylelint'],
};
```

### 5. TypeScript 配置 (`tsconfig.json`)

```json
{
  "extends": "@creekjs/lint/tsconfig.base.json",
  "compilerOptions": {
    // 这里可以覆盖或增加你的自定义配置
  }
}
```

## 结合 Husky 与 Lint-Staged

为了确保规范落地，我们强烈建议结合 Git Hooks 使用。在提交代码前自动执行格式化和检查：

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{md,json}": [
      "prettier --write --no-error-on-unmatched-pattern"
    ]
  }
}
```

配合编辑器（如 VS Code）的“保存时自动格式化 (Format On Save)”功能，开发体验将如丝般顺滑。