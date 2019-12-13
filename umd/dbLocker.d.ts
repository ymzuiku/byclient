interface IDbLocker {
    [key: string]: {
        /** 操作时必须设置的filter */
        filter: any[];
        /** 返回时默认修剪的对象 */
        trim: string[];
    };
}
export declare let dbLocker: IDbLocker;
export {};
