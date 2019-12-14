import crypto from 'crypto';

/**
 * AES加密的配置
 * 1.密钥
 * 2.偏移向量
 * 3.算法模式CBC
 * 4.补全值
 */
const aesConfig = {
  key: '', // 密钥
  iv: '', // 偏移向量
  padding: 'PKCS7Padding', // 补全值
  algorithm: 'aes-128-cbc', // 编码类型
};

function getIv(iv: string, salt?: string) {
  if (typeof salt === 'number') {
    salt = String(salt);
  }
  if (!salt) {
    return iv;
  }

  return iv.slice(0, 16 - 5) + salt.slice(salt.length - 5);
}

export interface IAESParams {
  data: any;
  kvi?: string;
  json?: boolean;
  focusKey?: string;
}

/**
 * AES_128_CBC 加密
 * 128位
 * return base64
 * json：将密码放入 code 中
 */
function aesEncode(params: IAESParams) {
  let { data, kvi, json, focusKey } = params;

  if (!aesConfig.key || !data) {
    return data;
  }
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }

  const key = focusKey || AES.config.key;
  const iv = getIv(aesConfig.iv, kvi);
  const algorithm = aesConfig.algorithm;
  // let padding = AES_conf.padding;

  const cipherChunks = [];
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  cipher.setAutoPadding(true);
  cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
  cipherChunks.push(cipher.final('base64'));
  if (json) {
    return JSON.stringify({ code: cipherChunks.join('') });
  }
  return cipherChunks.join('');
}

/**
 * 解密
 * return utf8
 * json：从json中的 code 获取数据
 */
function aesDecode(params: IAESParams) {
  let { data, kvi, json, focusKey } = params;

  if (!aesConfig.key || !data) {
    return data;
  }

  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }

  if (json) {
    data = JSON.parse(data).code;
  }

  const key = focusKey || AES.config.key;
  const iv = getIv(aesConfig.iv, kvi);
  const algorithm = aesConfig.algorithm;
  // let padding = AES_conf.padding;

  const cipherChunks = [];
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
  cipherChunks.push(decipher.final('utf8'));

  return cipherChunks.join('');
}

export const AES = {
  config: aesConfig,
  decode: aesDecode,
  encode: aesEncode,
};
