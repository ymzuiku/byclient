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
declare function aesEncode(params: IAESParams): any;
/**
 * 解密
 * return utf8
 * json：从json中的 code 获取数据
 */
declare function aesDecode(params: IAESParams): any;
export declare const AES: {
    config: {
        key: string;
        iv: string;
        padding: string;
        algorithm: string;
    };
    decode: typeof aesDecode;
    encode: typeof aesEncode;
};
export {};
