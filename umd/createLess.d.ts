import { Collection } from 'mongodb';
interface IReducerBack {
    error: any;
    nextData: any;
}
interface IBodyData {
    db?: string;
    col?: string;
    block?: {
        [name: string]: any;
    };
    method: string;
    args?: any[];
    argsSha256?: string[];
    argsObjectId?: string[];
    remove?: string[];
    [other: string]: any;
}
export interface ILessOptions {
    url?: string;
    useWss?: boolean;
    reducer?: {
        [dbAndCol: string]: (data: IBodyData, col: Collection<any>) => IReducerBack;
    };
}
export declare const createLess: (options: ILessOptions) => Promise<(reqBody: any) => Promise<any>>;
export {};
