# @creekjs/lint

统一的代码规范配置包，集成 ESLint、Prettier 和 Stylelint 配置，确保项目代码风格一致。

## 特性

- 🎯 开箱即用的 ESLint 配置
- 🎨 统一的 Prettier 代码格式化
- 💅 Stylelint CSS 代码规范
- 🔧 支持 TypeScript、React、JSX
- 📦 基于 @umijs/lint 的最佳实践

## 安装

```bash
npm install @creekjs/lint --save-dev
# 或
yarn add @creekjs/lint -D
```

## 使用方法

### ESLint 配置

在项目根目录创建 `.eslintrc.js`：

```javascript
module.exports = {
  extends: ['@creekjs/lint/eslint'],
};
```

或者使用基础配置：

```javascript
module.exports = {
  extends: ['@creekjs/lint/eslint/base'],
};
```

### Prettier 配置

在项目根目录创建 `.prettierrc.js`：

```javascript
module.exports = require('@creekjs/lint/prettier');
```

或在 `package.json` 中配置：

```json
{
  "prettier": "@creekjs/lint/prettier"
}
```

### Stylelint 配置

在项目根目录创建 `.stylelintrc.js`：

```javascript
module.exports = {
  extends: ['@creekjs/lint/stylelint'],
};
```

### TypeScript 配置

在 `tsconfig.json` 中继承基础配置：

```json
{
  "extends": "@creekjs/lint/tsconfig.base.json",
  "compilerOptions": {
    // 你的自定义配置
  }
}
```

## 配置详情

### ESLint 规则

主要包含以下规则配置：

- **jsx-a11y/anchor-is-valid**: 关闭，适配 Next.js Link 组件
- **react/self-closing-comp**: 要求自闭合组件使用自闭合语法
- **react-hooks/exhaustive-deps**: React Hooks 依赖检查

### Prettier 配置

```javascript
{
  printWidth: 100,           // 行宽限制
  singleQuote: true,         // 使用单引号
  trailingComma: 'all',      // 尾随逗号
  proseWrap: 'never',        // 不换行
  endOfLine: 'lf',           // 换行符
  experimentalTernaries: false,
  plugins: [
    'prettier-plugin-packagejson',      // package.json 格式化
    'prettier-plugin-organize-imports'   // import 语句排序
  ]
}
```

### Stylelint 配置

- 继承基础配置
- 忽略 `fade` 函数的未知函数警告

### TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

## 脚本配置

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write .",
    "style:lint": "stylelint **/*.{css,scss,less}",
    "style:fix": "stylelint **/*.{css,scss,less} --fix"
  }
}
```

## IDE 集成

### VS Code

安装推荐插件：
- ESLint
- Prettier - Code formatter
- Stylelint

在 `.vscode/settings.json` 中配置：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  }
}
```

## 环境变量

- `LEGACY_ESLINT`: 设置为 `true` 使用传统 ESLint 配置

## 最佳实践

1. **团队协作**: 确保所有团队成员使用相同的配置
2. **CI/CD**: 在构建流程中集成代码检查
3. **预提交钩子**: 使用 husky 和 lint-staged 在提交前检查代码

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,less}": ["stylelint --fix", "prettier --write"]
  }
}
```

## 许可证

ISC