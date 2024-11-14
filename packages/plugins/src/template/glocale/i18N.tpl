import KiwiIntl from "{{{kiwiIntlPath}}}";

import { languageStorage, LANGUAGE_LIST,  CURRENT_LANGUAGE_KEY,  IS_EN_US,
  IS_ZH_CN, LanguageEnum  } from "{{{constantsPath}}}";

import en_US from "{{{en_US}}}";
import zh_CN from "{{{zh_CN}}}";

let I18N = KiwiIntl.init(languageStorage.get() || "zh-CN", {
  "en-US": en_US,
  "zh-CN": zh_CN,
});

export { I18N, languageStorage, LANGUAGE_LIST,  CURRENT_LANGUAGE_KEY,  IS_EN_US,
  IS_ZH_CN, LanguageEnum };
