/**
 * 机器翻译 WebAPI 接口调用示例
 * 运行前：请先填写Appid、APIKey、APISecret
 * 运行方法：直接运行 main() 即可
 * 结果： 控制台输出结果信息
 *
 * 1.接口文档（必看）：https://www.xfyun.cn/doc/nlp/xftrans/API.html
 * 2.错误码链接：https://www.xfyun.cn/document/error-code （错误码code为5位数字）
 * @author iflytek
 */
const CryptoJS = require('crypto-js');
const axios = require('axios');

// 系统配置
const config = {
  // 请求地址
  hostUrl: 'https://itrans.xfyun.cn/v2/its',
  host: 'itrans.xfyun.cn',
  uri: '/v2/its',
};

// 请求获取请求体签名
function getDigest(body) {
  return 'SHA-256=' + CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(JSON.stringify(body)));
}

// 生成请求body
function getPostBody(text, from, to, option) {
  let digestObj = {
    //填充common
    common: {
      app_id: option.appId,
    },
    //填充business
    business: {
      from: from,
      to: to,
    },
    //填充data
    data: {
      text: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text)),
    },
  };
  return digestObj;
}

// 鉴权签名
function getAuthStr(date, digest, option) {
  let signatureOrigin = `host: ${config.host}\ndate: ${date}\nPOST ${config.uri} HTTP/1.1\ndigest: ${digest}`;
  let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, option.apiSecret);
  let signature = CryptoJS.enc.Base64.stringify(signatureSha);
  let authorizationOrigin = `api_key="${option.appKey}", algorithm="hmac-sha256", headers="host date request-line digest", signature="${signature}"`;
  return authorizationOrigin;
}

export const translateWithXunFei = async (text: string, option: any) => {
  const transVar = {
    text,
    from: 'cn',
    to: 'en',
  };
  const date = new Date().toUTCString();
  const postBody = getPostBody(transVar.text, transVar.from, transVar.to, option);
  const digest = getDigest(postBody);
  const response = await axios.post(config.hostUrl, postBody, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json,version=1.0',
      Host: config.host,
      Date: date,
      Digest: digest,
      Authorization: getAuthStr(date, digest, option),
    },
  });
  const data = response.data.data;
  return data.result.trans_result.dst;
};
