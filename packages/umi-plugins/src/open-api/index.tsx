import { IApi } from "@umijs/max";

const openApi = require('@creekjs/openapi');

export default (api: IApi) => {
    api.describe({
        key: 'openApi',
        config: {
            schema: ({ zod }) => {
                const ApiPrefixParamsSchema = zod.object({
                    path: zod.string(),
                    method: zod.string(),
                    namespace: zod.string(),
                    functionName: zod.string(),
                    autoExclude: zod.boolean().optional(),
                });


                const SingleConfigSchema = zod.object({
                    requestLibPath: zod.string().optional(),
                    requestOptionsType: zod.string().optional(),
                    requestImportStatement: zod.string().optional(),
                    apiPrefix: zod.union([
                        zod.string(),
                        zod.function()
                            .args(ApiPrefixParamsSchema)
                            .returns(zod.string())
                    ]).optional(),
                    serversPath: zod.string().optional(),
                    schemaPath: zod.string().optional(),
                    projectName: zod.string().optional(),
                    namespace: zod.string().optional(),
                    enumStyle: zod.enum(['string-literal', 'enum']).optional(),
                    nullable: zod.boolean().optional(),
                    templatesFolder: zod.string().optional(),
                    dataFields: zod.array(zod.string()).optional(),
                    isCamelCase: zod.boolean().optional(),
                });

                return zod.union([
                    SingleConfigSchema,
                    zod.array(SingleConfigSchema)
                ]);
            }
        },
        enableBy: api.EnableBy.config,
    });

    api.registerCommand({
        name: 'openApi',
        fn() {
            const openApiOptions = api.userConfig.openApi;
            try {
                openApi.generateService(openApiOptions)
            } catch (error) {
                api.logger.error(error);
                process.exit(1);
            }

        }
    })

};
