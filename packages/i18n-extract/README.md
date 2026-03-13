# @creekjs/i18n-extract

一个强大的中文国际化提取工具，支持 TypeScript、React、Vue 文件，能够自动识别中文并替换为国际化函数调用，同时生成对应的语言包文件。

## 功能特性

- **多语言支持**：支持 `.ts`, `.tsx`, `.js`, `.jsx`, `.vue` 文件。
- **自动提取与替换**：
  - 自动识别代码中的中文字符串。
  - 自动将其替换为 `t('key', 'value')`（函数名可配置）。
  - 自动添加 `import { t } from '@/utils/i18n'` 导入语句（路径可配置）。
- **Vue 支持**：
  - 支持 Vue 2/3 的 `<template>` 中文提取。
  - 支持 Vue 组件属性（如 `title="中文"`）提取。
  - 支持 `<script>` 块中的中文提取。
- **智能合并**：生成的语言包文件会保留已有的翻译，只新增未翻译的词条，避免覆盖。
- **目录结构镜像**：生成的语言包文件会严格镜像源代码的目录结构，方便管理。
  - 例如：`src/pages/Demo/index.tsx` -> `src/locales/zh-CN/pages/Demo/index.ts`
- **Excel 导出**：支持将所有提取到的词条导出为 Excel 文件，方便翻译人员使用。
- **高度可配置**：支持自定义 key 生成规则、t 函数名称、导入语句等。

## 安装

```bash
npm install @creekjs/i18n-extract --save-dev
# 或者
yarn add @creekjs/i18n-extract -D
```

## 使用方法

### CLI 命令

```bash
creek-i18n [options]
```

#### 选项

- `-p, --path <path>`: 指定要扫描的源码路径（Glob 模式，例如 `src/**/*.{ts,tsx}`）。
- `-o, --out <path>`: 指定生成的语言包输出目录（例如 `src/locales`）。
- `-c, --config <path>`: 指定配置文件路径（默认为 `i18n.config.ts` 或 `i18n.config.js`）。
- `--excel <path>`: 导出 Excel 文件的路径（例如 `./translations.xlsx`）。

### 配置文件

在项目根目录下创建 `i18n.config.ts` 或 `i18n.config.js`：

```typescript
// i18n.config.ts
module.exports = {
  // 语言文件类型 (ts/js/json)
  localeFileType: 'ts',
  
  // 语言包输出的主入口文件路径
  // 注意：实际生成的翻译文件会存放在该文件同级目录下以文件名命名的文件夹中
  // 例如：src/locales/zh-CN.ts -> 生成的文件在 src/locales/zh-CN/ 目录下
  localePath: './src/locales/zh-CN.ts',
  
  // 要扫描的文件路径 (Glob)
  path: 'src/**/*.{ts,tsx,js,jsx,vue}',
  
  // 排除的文件/目录
  exclude: ['**/node_modules/**', '**/dist/**', '**/.umi/**', '**/locales/**'],
  
  // 国际化函数名称 (默认为 't')
  tFunction: 't',
  
  // 国际化函数的导入语句
  importStatement: 'import { t } from "@/utils/i18n"',
  
  // 是否使用目录结构作为命名空间 (默认为 true)
  // 开启后，生成的语言文件将镜像源码目录结构
  useDirectoryAsNamespace: true,
  
  // 自定义 key 生成规则 (可选)
  // text: 中文原文
  // filePath: 当前文件路径
  // customizeKey: (text, filePath) => {
  //   return someHashFunction(text); 
  // }
  
  // 开启 React Hooks 模式 (useT)
  // 默认为 false
  useT: false,

  // 指定哪些目录下的文件使用 useT 模式
  // 默认为 ['pages', 'components']
  // 只有在这些目录下的文件，并且是 React 组件或 Hook 时，才会注入 useT
  useTDirs: ['pages', 'components'],

  // useT 的 Hook 名称
  // 默认为 'useT'
  useTFunction: 'useT',

  // useT 的导入语句
  // 默认为 'import { useT } from "@/utils/i18n"'
  useTImportStatement: 'import { useT } from "@/utils/i18n"',
};
```

## 响应式支持 (useT)

为了支持 React 组件中的语言切换响应式更新，工具支持 `useT` Hook 模式。

### 配置

在 `i18n.config.ts` 中开启 `useT`：

```typescript
module.exports = {
  // ... 其他配置
  useT: true,
  useTDirs: ['pages', 'components'], // 指定生效目录
};
```

### 效果

**处理前：**

```tsx
import React from 'react';

export const Demo = () => {
  return <div>你好</div>;
};
```

**处理后：**

```tsx
import { useT } from '@/utils/i18n'; // 自动添加 useT 导入
import React from 'react';

export const Demo = () => {
  const t = useT(); // 自动注入 hook 调用
  return <div>{t('demo.nihao', '你好')}</div>;
};
```

注意：
- `useT` 模式只会在 `useTDirs` 配置的目录下的 React 组件或自定义 Hook 中生效。
- 对于非组件函数或不在指定目录下的文件，仍然会使用全局 `t` 函数。

## 示例

### React 组件

**处理前：**

```tsx
import React from 'react';
import { Button } from 'antd';

export const Demo = () => {
  return (
    <div>
      <div>你好，世界</div>
      <Button>点击我</Button>
      <div title="标题">属性测试</div>
    </div>
  );
};
```

**处理后：**

```tsx
import { t } from "@/utils/i18n"; // 自动添加导入
import React from 'react';
import { Button } from 'antd';

export const Demo = () => {
  return (
    <div>
      <div>{t("nihaoshijie", "你好，世界")}</div>
      <Button>{t("dianjiwo", "点击我")}</Button>
      <div title={t("biaoti", "标题")}>{t("shuxingceshi", "属性测试")}</div>
    </div>
  );
};
```

### Vue 组件

**处理前：**

```vue
<template>
  <div title="标题">
    你好，Vue
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: '欢迎'
    }
  }
}
</script>
```

**处理后：**

```vue
<template>
  <div :title="$t('biaoti')">
    {{ $t('nihaovue') }}
  </div>
</template>

<script>
import { t } from "@/utils/i18n"; // 自动添加导入
export default {
  data() {
    return {
      msg: t('huanying', '欢迎')
    }
  }
}
</script>
```

## 导出 Excel

你可以将提取到的所有翻译导出为 Excel 文件，方便交付给翻译团队：

```bash
creek-i18n -c i18n.config.ts --excel ./translations.xlsx
```

生成的 Excel 包含以下列：
- `Namespace`: 命名空间（文件路径）
- `Key`: 翻译键值
- `zh-CN`: 中文原文
- `en-US`: 英文翻译占位符
