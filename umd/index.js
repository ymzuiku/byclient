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
    const { reducer = {}, onlyOpenCol, onlyOpenDb } = options;
    // 请求事件
    async function event(reqBody) {
        let out = { error: 'recall no run' };
        if (!reqBody) {
            return (out = { error: 'body or body.code is empty' });
        }
        const body = reqBody.events ? reqBody.events : [reqBody];
        let eventNumber = 0;
        const recall = async () => {
            // 如果 event 溢出
            if (eventNumber > body.length - 1) {
                return (out = { error: 'event is out' });
            }
            // 计算是否是最后一个
            let isNeedSend = false;
            if (eventNumber === body.length - 1) {
                isNeedSend = true;
            }
            let { db: dbName = 'test', col: colName = 'test', block, method, args = [], argsSha256, argsObjectId, remove, } = body[eventNumber];
            dbName = dbName.trim();
            colName = colName.trim();
            if (onlyOpenDb && !onlyOpenDb.has(dbName)) {
                return (out = { error: `permission[db]: ${dbName} is private` });
            }
            if (onlyOpenCol && !onlyOpenCol.has(colName)) {
                return (out = { error: `permission[col]: ${colName} is private` });
            }
            if (!canUseMethod.has(method)) {
                return (out = { error: `can not use "${method}" method` });
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
                if (reducerBack) {
                    if (reducerBack.error) {
                        return (out = reducerBack);
                    }
                    if (reducerBack.nextData) {
                        dbName = reducerBack.nextData.db;
                        colName = reducerBack.nextData.col;
                        block = reducerBack.nextData.block;
                        method = reducerBack.nextData.method;
                        args = reducerBack.nextData.args;
                        argsSha256 = reducerBack.nextData.argsSha256;
                        argsObjectId = reducerBack.nextData.argsObjectId;
                    }
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
                return (out = { error: 'database method error', msg: err, info: { dbName, colName, method } });
            }
            if (block) {
                if (!response) {
                    return (out = { error: 'block: data void' });
                }
                if (method === 'find' && response.length === 0) {
                    return (out = { error: 'block: not find' });
                }
                if (response.result && !response.result.n) {
                    const { connection, message, ...sendData } = response;
                    // 剔除不需要返回的
                    const allTrim = new Set([...(remove || [])]);
                    allTrim.forEach(key => {
                        lodash.set(sendData, key, undefined);
                    });
                    return (out = { error: 'block: data result.n is 0', res: sendData });
                }
            }
            if (!isNeedSend) {
                eventNumber += 1;
                await recall();
                return;
            }
            if (!response) {
                out = { mes: 'data is empty' };
                return;
            }
            if (response) {
                const { connection, message, ...sendData } = response;
                // 剔除不需要返回的
                const allTrim = new Set([...(remove || [])]);
                allTrim.forEach(key => {
                    lodash.set(sendData, key, undefined);
                });
                if (method === 'find') {
                    out = { list: response };
                    return;
                }
                out = sendData;
                return;
            }
        };
        await recall();
        return out;
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
                const body = JSON.parse(data.toString()) || {};
                const _ws = body._ws;
                less(body).then((response) => {
                    console.log(response);
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
        const wss = await createWss({ server: app.server, lessEvent: less });
        return wss;
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
