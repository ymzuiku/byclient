import { app } from './app';
import { db } from './db';
import { ObjectId } from 'mongodb';
import { set, get } from 'lodash';
import { sha256 } from './sha256';
import { createRSA } from './createRSA';

interface IImpose {
  [key: string]: {
    /** 操作时必须设置的filter */
    filter: any[];
    /** 返回时默认修剪的对象 */
    remove: string[];
  };
}

interface IEvent {
  db?: string;
  col?: string;
  block: any;
  method: string;
  args?: any[];
  // 用来标记需要转化为 sha256 的args路径
  argsSha256?: string[];
  // 用来标记需要转化为 ObjectId 的args路径
  argsObjectId?: string[];
  remove?: string[];
}

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

interface IOptions {
  url: string;
  checkTime?: number;
  checkKey?: string;
  impose?: IImpose;
  blockDb?: Set<string>;
  blockCol?: Set<string>;
  RSAKey?: string;
}

export const serverless = async (options: IOptions) => {
  const { url = '/less', checkKey, checkTime, impose = {}, blockDb, blockCol, RSAKey } = options;
  let RSA = createRSA();

  if (RSAKey) {
    RSA.init(RSAKey);
  }

  app.post(url, async (req, rep) => {
    if (!req.body || !req.body.code) {
      return rep.status(400).send(new Error('body or body.code is empty'));
    }

    const realData = JSON.parse(RSA.decode(req.body.code));

    if (checkTime) {
      const nowTime = Date.now();
      if (realData._checkTime < nowTime - checkTime || realData._checkTime > nowTime + checkTime) {
        return rep.status(400).send(new Error('no permission!'));
      }
    }
    if (checkKey) {
      if (realData._checkKey !== checkKey) {
        return rep.status(400).send(new Error('no permission!'));
      }
    }

    const body: IEvent[] = realData.events ? realData.events : [realData];

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

      let {
        db: dbName = 'test',
        col: colName = 'test',
        block,
        method,
        args = [],
        argsSha256,
        argsObjectId,
        remove,
      } = body[nowEvent];

      if (blockDb && blockDb.has(dbName)) {
        return rep.status(400).send(new Error('no permission!'));
      }

      if (blockCol && blockCol.has(colName)) {
        return rep.status(400).send(new Error('no permission!'));
      }

      if (!canUseMethod.has(method)) {
        return rep.status(400).send(new Error(`can not use "${method}" method`));
      }
      const col = db(dbName).collection(colName);

      if (argsSha256) {
        argsSha256.forEach((p: string) => {
          const value = get(args, p);

          if (value) {
            set(args, p, sha256(value));
          }
        });
      }

      if (argsObjectId) {
        argsObjectId.forEach((id: string) => {
          const value = get(args, id);

          if (value) {
            set(args, id, new ObjectId(value));
          }
        });
      }

      // 处理参数和限制权限
      if (method.indexOf('update') > -1 || method.indexOf('delete') > -1) {
        const filter = impose[colName] && impose[colName].filter;
        if (filter) {
          let isLockerError = true;
          for (let i = 0; i < filter.length; i++) {
            const key = filter[i];
            if (typeof key === 'string') {
              const value = get(args[0], key);
              if (value) {
                isLockerError = false;
                break;
              }
            } else {
              let isHaveValue = 0;
              for (let j = 0; j < key.length; j++) {
                const subKey = key[j];
                const value = get(args[0], subKey);
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

      let data = await (col as any)[method](...args);

      if (method === 'find') {
        data = data.toArray();
      }

      if (block) {
        if (!data) {
          return rep.status(400).send(new Error('block: data void'));
        }
        const keys = Object.keys(block);
        let blockError: any = null;
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = block[key];

          if (get(data, key) !== block[key]) {
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
        return rep.status(200).send({ code: RSA.encode({ mes: 'data is empty' }) });
      }
      if (data) {
        const { connection, message, ...sendData } = data;

        // 提出不需要返回的
        const allTrim = new Set([...(remove || []), ...((impose[colName] && impose[colName].remove) || [])]);

        allTrim.forEach(key => {
          set(sendData, key, undefined);
        });

        return rep.status(200).send({ code: RSA.encode(sendData) });
      }
    };

    await recall();
  });
};
