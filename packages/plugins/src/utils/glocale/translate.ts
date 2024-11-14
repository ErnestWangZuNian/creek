import axios from 'axios';
//@ts-ignore
import md5 from 'md5';
import { translateWithXunFei } from './xunfei';

export type TranslateOption = {
  appId: string;
  appKey: string;
  apiSecret: string;
  translateType?: 'xunfei';
};

export type FreeTranslateResultType = {
  translatedText: string;
};

export type FreeTranslateErrorType = {
  response: {
    status: string;
    statusText: string;
    response: Record<string, any>;
    data: string;
  };
};

export type BaiduTransLateResponseType = {
  code?: number;
  msg?: string;
  data: BaiduTransLateResultType & BaiduTransLateErrorType;
};

export type BaiduTransLateResultType = {
  from: string;
  to: string;
  trans_result: [{ src: string; dst: 'test' }];
};

export type BaiduTransLateErrorType = {
  error_code: string;
  error_msg: string;
};

/**
 * 免费的翻译
 * @param text 需要翻译的文本
 * @param targetLanguage 目标语言
 * @returns 翻译后的文本
 */
async function freeTranslate(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await axios<FreeTranslateResultType>(
      'http://gplus-translate.caas-cloud-test.geega.com/translate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          q: text,
          source: 'zh',
          target: targetLanguage,
          format: 'text',
          api_key: '',
        },
      },
    );
    const data = response.data;
    return data.translatedText;
  } catch (error) {
    const newError = error as FreeTranslateErrorType;
    const errorResponse = newError.response;
    const errorMsg = `这是免费翻译报出的错误， Error:  ${errorResponse.status} ${errorResponse.statusText} ${errorResponse.data}`;
    return Promise.reject(errorMsg);
  }
}

/**
 * 百度翻译函数
 * @param text 需要翻译的文本
 * @param targetLanguage 目标语言
 * @returns 翻译后的文本
 */
async function baiduTransLate(text: string, targetLanguage: string, appid: string, appKey: string): Promise<string> {
  let salt = new Date().getTime();
  // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
  let from = 'zh';
  let to = targetLanguage;
  let str1 = `${appid}${text}${salt}${appKey}`;
  let sign = md5(str1);

  const res: BaiduTransLateResponseType = await axios.get<BaiduTransLateResponseType['data']>(
    'http://api.fanyi.baidu.com/api/trans/vip/translate',
    {
      params: {
        q: text,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign,
      },
    },
  );
  const { data } = res;

  if (!data.error_code) {
    let result = text;
    if (data.trans_result && Array.isArray(data.trans_result)) {
      data.trans_result.forEach((item) => {
        result = item.dst;
      });
    }
    return result;
  } else {
    const errorMsg = `这是百度翻译 appId: ${appid} appKey: ${appKey} 调用出现的错误，具体错误信息是 error_code:${data.error_code}   error_msg:${data.error_msg} 可以访问百度翻译api文档详细的地址http://api.fanyi.baidu.com/product/113`;
    return Promise.reject(errorMsg);
  }
}

/**
 * 翻译函数
 * @param text 需要翻译的文本
 * @param targetLanguage 目标语言
 * @returns 翻译后的文本
 */
async function translateText(text: string, targetLanguage: string, option?: TranslateOption): Promise<string> {
  let finalText = text;
  try {
    if (option?.translateType === 'xunfei' && option?.appKey && option?.appId && option?.apiSecret) {
      finalText = await translateWithXunFei(text, option);
    } else if (option?.appId && option?.appKey) {
      finalText = await baiduTransLate(text, targetLanguage, option?.appId, option.appKey);
    } else {
      finalText = await freeTranslate(text, targetLanguage);
    }
    return finalText;
  } catch (error) {
    console.log(error, 'error');
    return finalText;
  }
}

/**
 * 转换为英文
 * @param textToTranslate 需要翻译的文本
 * @returns 英文翻译
 */
export const translateEn = (textToTranslate: string, option?: TranslateOption): Promise<string> =>
  translateText(textToTranslate, 'en', option);
