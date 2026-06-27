
const swaggerOpenApi = require('@umijs/openapi');

import type { GenerateServiceProps } from '@umijs/openapi';

export enum OpenApiChannel {
    swagger = 'swagger',
    yapi = 'yapi'
}

export type BaseOpenApiGenerateServiceProps = GenerateServiceProps & {
    openApiChannel?: OpenApiChannel
}

export type OpenApiGenerateServiceProps = BaseOpenApiGenerateServiceProps;

const generateServiceMap = {
    [OpenApiChannel.swagger]: swaggerOpenApi.generateService
}

export const generateService = async (openApiGenerateServiceProps: OpenApiGenerateServiceProps | OpenApiGenerateServiceProps[]) => {
    let arrayOpenApiGenerateService = Array.isArray(openApiGenerateServiceProps) ? openApiGenerateServiceProps : [openApiGenerateServiceProps];

    arrayOpenApiGenerateService = arrayOpenApiGenerateService.map(item => {
        item.openApiChannel = item.openApiChannel ?? OpenApiChannel.swagger;
        item.projectName = item.projectName ?? '';
        return item;
    });

    for (const generateservice of arrayOpenApiGenerateService) {
        await generateServiceMap[generateservice.openApiChannel](generateservice);
    }
}


