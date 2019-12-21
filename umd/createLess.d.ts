interface IImpose {
    [key: string]: {
        /** 操作时必须设置的filter */
        filter: any[];
        /** 返回时默认修剪的对象 */
        remove: string[];
    };
}
export interface ILessOptions {
    url?: string;
    useWss?: boolean;
    checkTime?: number;
    checkKey?: string;
    impose?: IImpose;
    blockDb?: string[];
    blockCol?: string[];
    autoRSA?: string;
    rsaURL?: string;
    responseRSA?: boolean;
}
export declare const createLess: (options: ILessOptions) => Promise<(reqBody: any, send: any) => Promise<any>>;
export {};
