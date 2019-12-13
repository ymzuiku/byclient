'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var mongodb = require('mongodb');
var fastify = _interopDefault(require('fastify'));
var fastifyCors = _interopDefault(require('fastify-cors'));
var lodash = require('lodash');
var crypto = _interopDefault(require('crypto'));
var fs = _interopDefault(require('fs-extra'));
var path = require('path');

const db = (dbName) => db.getDb(dbName);
db.defaultDbName = '';
db.getDb = (dbName = db.defaultDbName) => null;
db.inited = false;
db.init = (uri = 'mongodb://127.0.0.1:27017', defaultDbName = 'test') => {
    if (db.inited) {
        return;
    }
    db.inited = true;
    db.defaultDbName = defaultDbName;
    return new Promise(res => {
        mongodb.MongoClient.connect(uri, {
            // useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(client => {
            db.getDb = dbName => client.db(dbName || db.defaultDbName);
            res();
        });
    });
};

const app = fastify({
    logger: true,
    disableRequestLogging: true,
});
app.register(fastifyCors);

const defyan = 'plot_defyan_v0.0.1';
const sha256 = (str) => {
    const obj = crypto.createHash('sha256');
    obj.update(str + defyan);
    return obj.digest('hex');
};

let dbLocker = {
    dev_user: ['token.$eq', ['username.$eq', 'password.$eq']],
};
// interface ILocker {
//   [key: string]: string[];
// }
// export const setDbLocker = (locker: ILocker) => {
//   Object.keys(locker).forEach(key => {
//     dbLocker[key] = locker[key];
//   });
// };

const serverless = async (url = '/serverless') => {
    app.post(url, async (req, rep) => {
        if (!req.body || !req.body.length) {
            return rep.status(400).send(new Error('body is empty'));
        }
        const body = req.body;
        let nowEvent = 0;
        const recall = async () => {
            // 如果 event 溢出
            if (nowEvent > body.length - 1) {
                return rep.status(500).send(new Error('event is out'));
            }
            // 计算是否是最后一个
            let isNeedSend = false;
            if (nowEvent === body.length - 1) {
                isNeedSend = true;
            }
            let { db: dbName = 'test', col: colName = 'test', block, method, args, argsSha256, argsObjectId, dataFilter, } = body[nowEvent];
            if (method.indexOf('drop') > -1 || method === 'deleteMany') {
                return rep.status(400).send(new Error('can not use drop method oer deleteMany'));
            }
            const col = db(dbName).collection(colName);
            if (argsSha256) {
                argsSha256.forEach(p => {
                    const value = lodash.get(args, p);
                    if (value) {
                        lodash.set(args, p, sha256(value));
                    }
                });
            }
            if (argsObjectId) {
                argsObjectId.forEach(id => {
                    const value = lodash.get(args, id);
                    if (value) {
                        lodash.set(args, id, new mongodb.ObjectId(value));
                    }
                });
            }
            // 处理参数和限制权限
            if (method.indexOf('update') > -1 || method.indexOf('delete') > -1) {
                const locker = dbLocker[colName];
                if (locker) {
                    let lockerError = new Error(`locker: master filter use ${JSON.stringify(locker)}`);
                    for (let i = 0; i < locker.length; i++) {
                        const key = locker[i];
                        if (typeof key === 'string') {
                            const value = lodash.get(args[0], key);
                            if (value) {
                                lockerError = null;
                                break;
                            }
                        }
                        else {
                            let isHaveValue = 0;
                            for (let j = 0; j < key.length; j++) {
                                const subKey = key[j];
                                const value = lodash.get(args[0], subKey);
                                if (value) {
                                    isHaveValue += 1;
                                }
                            }
                            if (isHaveValue === key.length) {
                                lockerError = null;
                                break;
                            }
                        }
                    }
                    if (lockerError) {
                        return rep.status(400).send(lockerError);
                    }
                }
            }
            const data = await col[method](...args);
            if (block) {
                if (!data) {
                    return rep.status(400).send(new Error('block: data void'));
                }
                const keys = Object.keys(block);
                let blockError = null;
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const value = block[key];
                    if (lodash.get(data, key) !== block[key]) {
                        console.log(key, value, data.ops, lodash.get(data, key));
                        blockError = new Error(`block: ${key} is not ${value}`);
                        break;
                    }
                }
                if (blockError) {
                    return rep.status(400).send(blockError);
                }
            }
            if (!isNeedSend) {
                nowEvent += 1;
                await recall();
                return;
            }
            if (!data) {
                return rep.status(400).send({ msg: 'data void' });
            }
            if (data) {
                const { connection, message, ...sendData } = data;
                if (dataFilter) {
                    dataFilter.forEach(key => {
                        lodash.set(sendData, key, undefined);
                    });
                }
                return rep.status(200).send(sendData);
            }
        };
        await recall();
    });
};

const controllersLoader = (dir, indexOf) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const nextDir = path.resolve(dir, file);
        const stat = fs.statSync(nextDir);
        if (stat && stat.isDirectory()) {
            controllersLoader(nextDir, indexOf);
        }
        else if (file.indexOf(indexOf) > 0) {
            require(nextDir);
        }
    });
};

exports.app = app;
exports.controllersLoader = controllersLoader;
exports.db = db;
exports.dbLocker = dbLocker;
exports.serverless = serverless;
