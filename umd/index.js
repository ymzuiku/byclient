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
const setCors = () => app.register(fastifyCors);

const sha256 = (str, slat) => {
    const obj = crypto.createHash('sha256');
    obj.update(str + (slat ? slat : ''));
    return obj.digest('hex');
};

let dbLocker = {};
// interface ILocker {
//   [key: string]: string[];
// }
// export const setDbLocker = (locker: ILocker) => {
//   Object.keys(locker).forEach(key => {
//     dbLocker[key] = locker[key];
//   });
// };

/**
 * AES加密的配置
 * 1.密钥
 * 2.偏移向量
 * 3.算法模式CBC
 * 4.补全值
 */
const aesConfig = {
    key: '',
    iv: '',
    padding: 'PKCS7Padding',
    algorithm: 'aes-128-cfb',
};
function getIv(iv, salt) {
    if (typeof salt === 'number') {
        salt = String(salt);
    }
    if (!salt) {
        return iv;
    }
    return iv.slice(0, 16 - 5) + salt.slice(salt.length - 5);
}
/**
 * AES_128_CBC 加密
 * 128位
 * return base64
 * json：将密码放入 code 中
 */
function aesEncode(params) {
    let { data, kvi, json, focusKey } = params;
    if (!aesConfig.key || !data) {
        return data;
    }
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }
    const key = focusKey || AES.config.key;
    const iv = getIv(aesConfig.iv, kvi);
    const algorithm = aesConfig.algorithm;
    // let padding = AES_conf.padding;
    const cipherChunks = [];
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
    cipherChunks.push(cipher.final('base64'));
    if (json) {
        return JSON.stringify({ code: cipherChunks.join('') });
    }
    return cipherChunks.join('');
}
/**
 * 解密
 * return utf8
 * json：从json中的 code 获取数据
 */
function aesDecode(params) {
    let { data, kvi, json, focusKey } = params;
    if (!aesConfig.key || !data) {
        return data;
    }
    console.log(data);
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }
    if (json) {
        data = JSON.parse(data).code;
    }
    const key = focusKey || AES.config.key;
    const iv = getIv(aesConfig.iv, kvi);
    const algorithm = aesConfig.algorithm;
    // let padding = AES_conf.padding;
    const cipherChunks = [];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAutoPadding(true);
    cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
    cipherChunks.push(decipher.final('utf8'));
    return cipherChunks.join('');
}
const AES = {
    config: aesConfig,
    decode: aesDecode,
    encode: aesEncode,
};

const canUseMethod = {
    insert: true,
    insertMany: true,
    insertOne: true,
    update: true,
    updateMany: true,
    updateOne: true,
    replaceOne: true,
    find: true,
    findOne: true,
};
const serverless = async (url = '/lightning') => {
    app.post(url, async (req, rep) => {
        if (!req.body) {
            return rep.status(400).send(new Error('body is empty'));
        }
        const time = req.headers.time;
        if (AES.config.key) {
            req.body = JSON.parse(AES.decode({ data: req.body, kvi: time, json: true }));
        }
        const body = req.body.events ? req.body.events : [req.body];
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
            let { db: dbName = 'test', col: colName = 'test', block, method, args = [], argsSha256, argsObjectId, trim, } = body[nowEvent];
            if (!canUseMethod[method]) {
                return rep.status(400).send(new Error(`can not user ${method} method`));
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
                const filter = dbLocker[colName] && dbLocker[colName].filter;
                if (filter) {
                    let isLockerError = true;
                    for (let i = 0; i < filter.length; i++) {
                        const key = filter[i];
                        if (typeof key === 'string') {
                            const value = lodash.get(args[0], key);
                            if (value) {
                                isLockerError = false;
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
                                isLockerError = false;
                                break;
                            }
                        }
                    }
                    if (isLockerError) {
                        return rep.status(400).send(new Error(`locker: master filter use ${JSON.stringify(filter)}`));
                    }
                }
            }
            let data = await col[method](...args);
            if (method === 'find') {
                data = data.toArray();
            }
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
                return rep.status(200).send(AES.encode({ data: { msg: 'data void' }, kvi: time, json: true }));
            }
            if (data) {
                const { connection, message, ...sendData } = data;
                // 提出不需要返回的
                const allTrim = new Set([...(trim || []), ...((dbLocker[colName] && dbLocker[colName].trim) || [])]);
                allTrim.forEach(key => {
                    lodash.set(sendData, key, undefined);
                });
                return rep.status(200).send(AES.encode({ data: sendData, kvi: time, json: true }));
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

exports.AES = AES;
exports.app = app;
exports.controllersLoader = controllersLoader;
exports.db = db;
exports.dbLocker = dbLocker;
exports.serverless = serverless;
exports.setCors = setCors;
exports.sha256 = sha256;
