# 接口生成 (@creekjs/openapi)

在前后端分离的开发模式中，前端通常需要根据后端提供的接口文档（如 Swagger）来手动编写 API 请求代码和 TypeScript 类型定义。这不仅耗时耗力，而且当后端接口发生变更时，前端很难及时同步，极易引发潜在的 Bug。

`@creekjs/openapi` 是一个强大的工具，它可以读取后端的 OpenAPI/Swagger 规范文件，**一键自动生成所有接口的请求函数和类型定义**，并完美对接 `@creekjs/request` 网络层。

## 核心功能与优势

- **🚀 零手写类型与请求**：通过解析后端 Swagger JSON，自动生成标准的 TypeScript 类型（请求参数、响应体）以及调用函数。
- **🔌 深度集成网络层**：生成的代码自动使用项目内的 `@creekjs/request`，无缝继承防重、Loading、错误拦截等所有底层网络特性。
- **🔄 随时保持同步**：当后端更新接口时，只需运行一行命令，前端代码即可自动覆盖更新。类型系统的严格校验会在编译时就暴露因接口变更导致的问题。
- **🧩 强依赖于 Umi 生态**：底层基于 `@umijs/openapi` 做了二次封装。

---

## 最佳实践：PC Demo 中的真实案例

在 CreekJS 的标准模板 `apps/pc-demo` 中，我们以 Swagger 官方的宠物商店 (`petstore`) 为例，展示了如何配置和使用 OpenAPI 生成代码。

### 1. 配置数据源

在项目的配置文件（如 `.umirc.ts` 或独立的 `openapi.config.ts`）中配置 Swagger 地址和请求库路径：

```typescript
// apps/pc-demo/.umirc.ts
import { defineConfig } from '@umijs/max';

export default defineConfig({
  // ... 其他配置
  openApi: {
    // 后端 Swagger JSON 的地址
    schemaPath: 'https://petstore.swagger.io/v2/swagger.json',
    // 指定生成的服务代码使用哪个请求库
    requestLibPath: "import { request } from '@creekjs/request';",
  },
});
```

### 2. 生成代码

在 `package.json` 中配置了脚本：

```json
{
  "scripts": {
    "openApi": "max openApi"
  }
}
```

运行 `pnpm openApi` 后，工具会在 `src/service` 目录下自动生成对应的业务代码。

#### 生成的类型定义 (`typings.d.ts`)

工具会提取后端定义的所有实体模型：

```typescript
// src/service/typings.d.ts
declare namespace API {
  type Pet = {
    id?: number;
    category?: Category;
    name: string;
    photoUrls: string[];
    tags?: Tag[];
    /** pet status in the store */
    status?: 'available' | 'pending' | 'sold';
  };
  
  type deletePetParams = {
    /** Pet id to delete */
    petId: number;
  };
  // ... 其他类型
}
```

#### 生成的请求函数 (`pet.ts`)

工具会为每一个 API 路径生成一个具名的异步函数，并携带完整的 JSDoc 注释：

```typescript
// src/service/pet.ts
import { request } from '@creekjs/request';

/** Finds Pets by status Multiple status values can be provided with comma separated strings GET /pet/findByStatus */
export async function findPetsByStatus(
  params: API.findPetsByStatusParams,
  options?: { [key: string]: any },
) {
  return request<API.Pet[]>('/pet/findByStatus', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** Deletes a pet DELETE /pet/${param0} */
export async function deletePet(
  params: API.deletePetParams,
  options?: { [key: string]: any },
) {
  const { petId: param0, ...queryParams } = params;
  return request<any>(`/pet/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
```

### 3. 在业务组件中使用

在业务组件中，开发者可以直接引入这些自动生成的函数，享受极致的 TypeScript 自动提示体验。

比如在 `apps/pc-demo/src/pages/Demo/index.tsx` 的表格中调用查询和删除：

```tsx | pure
import { findPetsByStatus, deletePet } from '@/service/pet';

// 在表格组件的 request 属性中直接使用
<CreekTable
  request={async (params) => {
    // params 带有严格的类型提示
    const status = params.status ? [params.status] : ['available', 'pending', 'sold'];
    return findPetsByStatus({
      status: status.join(',') as any,
      ...params,
    });
  }}
  // ...
/>

// 在删除操作中使用
const handleRemove = async (selectedRow: API.Pet) => {
  await deletePet({
    petId: selectedRow.id!, // TypeScript 会知道需要传 petId
  });
  message.success('删除成功');
  actionRef.current?.reload();
};
```

**总结**：通过 `@creekjs/openapi` 配合 `@creekjs/request`，前端开发者可以完全从枯燥的“对接口”、“写类型”、“写防重”中解放出来，将核心精力集中在真正的业务逻辑和交互体验上。