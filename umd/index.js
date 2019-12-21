'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var mongodb = require('mongodb');
var WebSocket = _interopDefault(require('ws'));
var lodash = require('lodash');
var crypto = _interopDefault(require('crypto'));
var fastify = _interopDefault(require('fastify'));
var fastifyCors = _interopDefault(require('fastify-cors'));
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
            connectTimeoutMS: 3000,
            socketTimeoutMS: 3000,
            // useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(client => {
            db.getDb = dbName => client.db(dbName || db.defaultDbName);
            res();
        });
    });
};

const sha256 = (str, slat) => {
    const obj = crypto.createHash('sha256');
    obj.update(str + (slat ? slat : ''));
    return obj.digest('hex');
};

const canUseMethod = new Set([
    'insert',
    'insertMany',
    'insertOne',
    'deleteOne',
    'update',
    'updateMany',
    'updateOne',
    'replaceOne',
    'find',
    'findOne',
]);
function getByDbAndCol(obj, dbName, colName) {
    if (obj[`${dbName}:*`]) {
        return obj[`${dbName}:*`];
    }
    else if (obj[`*:${colName}`]) {
        return obj[`*:${colName}`];
    }
    else if (obj[`${dbName}:${colName}`]) {
        return obj[`${dbName}:${colName}`];
    }
    return null;
}
const createLess = async (options) => {
    const { reducer = {} } = options;
    // 请求事件
    async function event(reqBody) {
        if (!reqBody) {
            return { error: 'body or body.code is empty' };
        }
        const body = reqBody.events ? reqBody.events : [reqBody];
        let eventNumber = 0;
        const recall = async () => {
            // 如果 event 溢出
            if (eventNumber > body.length - 1) {
                return { error: 'event is out' };
            }
            // 计算是否是最后一个
            let isNeedSend = false;
            if (eventNumber === body.length - 1) {
                isNeedSend = true;
            }
            let { db: dbName = 'test', col: colName = 'test', block, method, args = [], argsSha256, argsObjectId, remove, } = body[eventNumber];
            if (!canUseMethod.has(method)) {
                return { error: `can not use "${method}" method` };
            }
            // 处理argsSha256
            if (argsSha256) {
                argsSha256.forEach((p) => {
                    const value = lodash.get(args, p);
                    if (value) {
                        lodash.set(args, p, sha256(value));
                    }
                });
            }
            if (argsObjectId) {
                argsObjectId.forEach((id) => {
                    const value = lodash.get(args, id);
                    if (value) {
                        lodash.set(args, id, new mongodb.ObjectId(value));
                    }
                });
            }
            const col = db(dbName).collection(colName);
            const reducerEvent = getByDbAndCol(reducer, dbName, colName);
            if (reducerEvent) {
                const reducerBack = await reducerEvent({
                    db: dbName,
                    col: colName,
                    block,
                    method,
                    args,
                    argsSha256,
                    argsObjectId,
                    remove,
                }, col);
                if (reducerBack && reducerBack.error) {
                    return reducerBack;
                }
                if (reducerBack && reducerBack.nextData) {
                    dbName = reducerBack.nextData.db;
                    colName = reducerBack.nextData.col;
                    block = reducerBack.nextData.block;
                    method = reducerBack.nextData.method;
                    args = reducerBack.nextData.args;
                    argsSha256 = reducerBack.nextData.argsSha256;
                    argsObjectId = reducerBack.nextData.argsObjectId;
                }
            }
            let response;
            try {
                if (method === 'find') {
                    response = await col[method](...args).toArray();
                }
                else {
                    response = await col[method](...args);
                }
            }
            catch (err) {
                return { error: 'database method error', msg: err, info: { dbName, colName, method } };
            }
            if (block) {
                if (!response) {
                    return { error: 'block: data void' };
                }
                const keys = Object.keys(block);
                let blockError = null;
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const value = block[key];
                    if (lodash.get(response, key) !== block[key]) {
                        blockError = `block: ${key} is not ${value}`;
                        break;
                    }
                }
                if (blockError) {
                    return { error: blockError };
                }
            }
            if (!isNeedSend) {
                eventNumber += 1;
                await recall();
                return;
            }
            if (!response) {
                return { mes: 'data is empty' };
            }
            if (response) {
                const { connection, message, ...sendData } = response;
                // 剔除不需要返回的
                const allTrim = new Set([...(remove || [])]);
                allTrim.forEach(key => {
                    lodash.set(sendData, key, undefined);
                });
                return { error: sendData };
            }
        };
        const response = await recall();
        return response;
    }
    return event;
};

const createWss = (params) => {
    const { lessOptions, lessEvent, server } = params;
    const wss = new WebSocket.Server({ server });
    let less = lessEvent;
    if (!less && lessOptions) {
        less = createLess(lessOptions);
    }
    wss.on('connection', function connection(ws) {
        if (wss.onConnection) {
            wss.onConnection(ws);
        }
        ws.on('message', function incoming(data) {
            if (less) {
                const body = JSON.parse(data.toString());
                const _ws = body._ws;
                less(body).then((response) => {
                    response._ws = _ws;
                    ws.send(JSON.stringify(response));
                });
            }
            if (wss.onMessage) {
                wss.onMessage(ws);
            }
        });
    });
    return wss;
};

const app = fastify({
    logger: process.env.log !== 'false',
    disableRequestLogging: true,
});
const setCors = () => app.register(fastifyCors);
const setServerLess = async (options) => {
    const less = await createLess(options);
    app.post(options.url || '/less', async (req, rep) => {
        const data = await less(req.body);
        return rep.send(data);
    });
    if (options.useWss) {
        await createWss({ server: app.server, lessEvent: less });
    }
    return;
};

const controllersLoader = (dir, indexOf, params) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const nextDir = path.resolve(dir, file);
        const stat = fs.statSync(nextDir);
        if (stat && stat.isDirectory()) {
            controllersLoader(nextDir, indexOf);
        }
        else if (file.indexOf(indexOf) > 0) {
            const ctrl = require(nextDir);
            if (typeof ctrl === 'function') {
                ctrl(params);
            }
        }
    });
};

function checkFilter(obj, matchs) {
    let isMatch = true;
    for (let i = 0; i < matchs.length; i++) {
        const match = matchs[i];
        const list = match.split('||');
        console.log(list);
        let subMatch = false;
        list.forEach(m => {
            const txt = m.trim();
            if (lodash.get(obj, txt)) {
                subMatch = true;
            }
        });
        if (!subMatch) {
            isMatch = false;
            break;
        }
    }
    return isMatch;
}

var reducerHelper = /*#__PURE__*/Object.freeze({
  __proto__: null,
  checkFilter: checkFilter
});

exports.app = app;
exports.controllersLoader = controllersLoader;
exports.createWss = createWss;
exports.db = db;
exports.reducerHelper = reducerHelper;
exports.setCors = setCors;
exports.setServerLess = setServerLess;
exports.sha256 = sha256;
