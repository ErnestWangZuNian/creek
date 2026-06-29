
const swaggerOpenApi = require('@umijs/openapi');

import type { GenerateServiceProps } from '@umijs/openapi';

export enum OpenApiChannel {
    swagger = 'swagger',
    yapi = 'yapi'
}

export type BaseOpenApiGenerateServiceProps = GenerateServiceProps & {
    openApiChannel?: OpenApiChannel;
    /**
     * 是否使用 operationId 生成函数名，默认为 false
     * 为 false 时使用 HTTP method + URL 生成稳定的函数名
     */
    useOperationId?: boolean;
}

export type OpenApiGenerateServiceProps = BaseOpenApiGenerateServiceProps;

const generateServiceMap = {
    [OpenApiChannel.swagger]: swaggerOpenApi.generateService
}

/**
 * 基于 method + path 生成稳定的函数名
 * 例如: GET /pet/{petId} → getPetByPetId
 *       POST /store/order → postStoreOrder
 */
function genFunctionNameByMethodPath(method: string, path: string): string {
    const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const pathPart = path
        .split('/')
        .filter(Boolean)
        .map((segment) => {
            // 处理路径参数 {param} → ByParam
            if (/^\{.+\}$/.test(segment)) {
                const paramName = segment.slice(1, -1);
                return `By${upperFirst(paramName)}`;
            }
            // 处理 kebab-case 如 user-list → UserList
            return segment
                .split('-')
                .map((part) => upperFirst(part))
                .join('');
        })
        .join('');

    return `${method.toLowerCase()}${pathPart}`;
}

export const generateService = async (openApiGenerateServiceProps: OpenApiGenerateServiceProps | OpenApiGenerateServiceProps[]) => {
    let arrayOpenApiGenerateService = Array.isArray(openApiGenerateServiceProps) ? openApiGenerateServiceProps : [openApiGenerateServiceProps];

    arrayOpenApiGenerateService = arrayOpenApiGenerateService.map(item => {
        item.openApiChannel = item.openApiChannel ?? OpenApiChannel.swagger;
        item.projectName = item.projectName ?? '';

        // 默认使用 method + URL 生成函数名，而非 operationId
        const useOperationId = item.useOperationId ?? false;
        if (!useOperationId) {
            const userHook = item.hook ?? {};
            item.hook = {
                ...userHook,
                customFunctionName: (data: { method: string; path: string; operationId?: string }) => {
                    return genFunctionNameByMethodPath(data.method, data.path);
                },
            };
        }

        return item;
    });

    for (const generateservice of arrayOpenApiGenerateService) {
        await generateServiceMap[generateservice.openApiChannel](generateservice);
    }
}


