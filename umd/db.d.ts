import { Db } from 'mongodb';
export declare const db: {
    (dbName?: string | undefined): Db;
    defaultDbName: string;
    getDb(dbName?: string): Db;
    inited: boolean;
    init(uri?: string, defaultDbName?: string): Promise<unknown> | undefined;
};
