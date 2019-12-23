# 前端配合 handserver 实现有数据变化的 mock

使用 handserver 实现 mock，对比传统的 mock 优势有：

1. 不需要配置其他项目，提高 mock 的使用率
2. 有“真实”数据互动，可以在前端真实实现增删查改；更方便多个前端在迭代中可以协同 mock 工作
3. 不需要记忆各类 mock 语法，只需要了解 mongodb 的 API 即可，没有其他学习成本；学习 mongodb API 的收益也可用在其他地方。

## 启动 mock 服务

首先使用 handserver 在后端启动一个开放服务，由前端控制数据库，接口为: http://服务ip:4020/mock

```js
const handserver = require('handserver');

const start = async () => {
  await handserver.db.init('mongodb://127.0.0.1:27017');

  // 取消跨域检测
  handserver.setCors();

  // 启动 mock 服务
  await handserver.setServerLess({
    url: '/mock',
    // 只有 mock 和 test 数据库是开放给前端的
    onlyOpenDb: new Set(['mock', 'test']),
  });

  try {
    await handserver.app.listen(4020, '0.0.0.0');
  } catch (error) {
    handserver.app.log.error(error);
    process.exit(1);
  }
};

start();
```

## 编辑一个前端请求函数 client

```ts
interface IOptions {
  headers: any;
  timeout: number;
}

interface IBodyData {
  url?: any;
  headers?: any;
  db?: string;
  col?: string;
  block?: { [name: string]: any };
  method: string;
  args?: any[];
  // 用来标记需要转化为 sha256 的args路径
  argsSha256?: string[];
  // 用来标记需要转化为 ObjectId 的args路径
  argsObjectId?: string[];
  remove?: string[];
  [other: string]: any;
}

function createHttpClient(url: string, options?: IOptions) {
  return function(data: IBodyData) {
    return new Promise(function(cb) {
      const subUrl = data.url;
      const subHeaders = data.headers;
      const { headers, timeout = 4000 } = options || {};
      const xhr = new XMLHttpRequest();
      function loaded(res: any) {
        if (res && res.target) {
          cb(res.target.response);
        } else {
          cb({ error: 'XMLHttpRequest callback is error' });
        }
      }
      xhr.addEventListener('load', loaded);
      xhr.addEventListener('error', loaded);
      xhr.addEventListener('timeour', function() {
        cb({ error: `time out: ${timeout}ms`, url });
      });
      if (subUrl) {
        xhr.open('POST', url + subUrl, true);
      } else {
        xhr.open('POST', url, true);
      }
      xhr.timeout = timeout;
      xhr.responseType = 'json';
      xhr.setRequestHeader('content-type', 'application/json');
      if (headers) {
        Object.keys(headers).forEach(function(k) {
          xhr.setRequestHeader(k, headers[k]);
        });
      }
      if (subHeaders) {
        Object.keys(subHeaders).forEach(function(k) {
          xhr.setRequestHeader(k, subHeaders[k]);
        });
      }
      xhr.send(JSON.stringify(data));
    });
  };
}

export { createHttpClient };
```

## 使用封装请求函数，方便开发后期移除 mock

```ts
import { createHttpClient } from './createHttpClient';

const mock = createHttpClient('http://0.0.0.0:4020/mock');

// 增加
export const addProductInfo = async (body: any) => {
  // 假定商品不可同名，查询是当前商品是否已经存在同名
  const checker = await mock({
    // 数据库名
    db: 'mock',
    // 表名
    col: 'products',
    // mongodb 方法
    method: 'findOne',
    // mongodb 方法参数
    args: [{ name: { $eq: body.name } }],
  });

  // 根据约定的错误格式，进行返回
  if (checker) {
    return { code: 500, error: '已有相同商品名，不可重复创建', _mock: checker };
  }

  // 若 checker 通过，进行后续的插入行为
  const inserter = await mock({
    db: 'mock',
    col: 'products',
    method: 'insertOne',
    args: [body],
  });

  if (inserter.result.n === 1) {
    // 处理返回数据为接口约定的格式
    return { msg: '操作成功', code: 200, _mock: inserter };
  }

  return { error: '服务器异常', code: 500, _mock: inserter };

  // 当后端接口实现之后，移除 mock 请求，替换以下真实请求
  // const data = await axios.post(`/product/info`);
  // return data;
};

// 查询
export const getProductInfo = async (body: any) => {
  const res = await mock({
    db: 'mock',
    col: 'products',
    method: 'findOne',
    args: [{ pid: { $eq: body.pid } }],
  });

  // 处理返回数据为接口约定的格式
  return { code: 200, data: res, _mock: res };

  // 当后端接口实现之后，移除 mock 请求，替换以下真实请求
  // const data = await axios.get(`/product/info?pid=${body.pid}`);
  // return data;
};

// 更新
export const updateProductInfo = async (body: any) => {
  const res = await mock({
    db: 'mock',
    col: 'products',
    method: 'updateOne',
    args: [{ pid: { $eq: body.pid } }, { $set: body }],
  });

  // 处理返回数据为接口约定的格式
  return { code: 200, data: res };

  // 当后端接口实现之后，移除 mock 请求，替换以下真实请求
  // ...
};

// 删除商品
export const deleteProduct = async (body: any) => {
  const res = await mock({
    db: 'mock',
    col: 'products',
    method: 'deleteOne',
    args: [{ pid: { $eq: body.pid } }],
  });

  if (res.result.n === 1) {
    // 处理返回数据为接口约定的格式
    return { msg: '成功删除商品', code: 200, _mock: res };
  }

  return { error: '服务器异常', code: 500, _mock: res };

  // 当后端接口实现之后，移除 mock 请求，替换以下真实请求
  // ....
};
```

通过以上案例，我们很简单的实现了前端对 mock 数据库任意表的 增删改写，并且给出了校验案例
