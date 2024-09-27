const { generateService } = require('@umijs/openapi')

generateService({
    schemaPath: "http://10.113.75.223:30948/swagger/doc.json",
    serversPath: './servers',
})