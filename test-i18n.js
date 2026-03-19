const { createIntl, createIntlCache } = require('react-intl');
const cache = createIntlCache();
const intl = createIntl({ locale: 'zh-CN', messages: { 'test': 'hello' } }, cache);
console.log(intl.formatMessage({ id: 'test', defaultMessage: 'default' }));
