import swaggerOpenApi, { GenerateServiceProps } from '@umijs/openapi';

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

export const generateService = (openApiGenerateServiceProps: OpenApiGenerateServiceProps | OpenApiGenerateServiceProps[]) => {
    let arrayOpenApiGenerateService = Array.isArray(openApiGenerateServiceProps) ? openApiGenerateServiceProps : [openApiGenerateServiceProps];
    
    arrayOpenApiGenerateService = arrayOpenApiGenerateService.map(item => {
        item.openApiChannel = item.openApiChannel || OpenApiChannel.swagger;
        item.projectName = item.projectName || '';
        const _item = item;
        return _item;
    });

    arrayOpenApiGenerateService.forEach(generateservice => {
        generateServiceMap[generateservice.openApiChannel](generateservice)
    })
}


