interface IImpose {
    [key: string]: {
        /** 操作时必须设置的filter */
        filter: any[];
        /** 返回时默认修剪的对象 */
        remove: string[];
    };
}
interface IOptions {
    url: string;
    checkTime?: number;
    checkKey?: string;
    impose?: IImpose;
    blockDb?: Set<string>;
    blockCol?: Set<string>;
    RSAKey?: string;
}
export declare const serverless: (options: IOptions) => Promise<void>;
export {};
