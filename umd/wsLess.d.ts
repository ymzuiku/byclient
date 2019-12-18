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
    blockDb?: string[];
    blockCol?: string[];
    autoRSA?: boolean;
    RSAKey?: string;
    rsaURL?: string;
    responseRSA?: boolean;
}
export declare const wsLess: (options: IOptions) => Promise<void>;
export {};
