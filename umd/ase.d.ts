export interface IASEParams {
    data: any;
    kvi?: string;
    json?: boolean;
    focusKey?: string;
}
/**
 * AES_128_CBC 加密
 * 128位
 * return base64
 * json：将密码放入 crypto 中
 */
declare function aseEncode(params: IASEParams): any;
/**
 * 解密
 * return utf8
 * json：从json中的 crypto 获取数据
 */
declare function aseDecode(params: IASEParams): any;
export declare const ASE: {
    config: {
        key: string;
        iv: string;
        padding: string;
        algorithm: string;
    };
    decode: typeof aseDecode;
    encode: typeof aseEncode;
};
export {};
