interface IOptions {
    checkTime?: number;
    checkKey?: string;
}
export declare const serverless: (url?: string, options?: IOptions | undefined) => Promise<void>;
export {};
