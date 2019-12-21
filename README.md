# 旨在解放小型应用的后端工作量

基于 `fastify` 的 serverless

## serverLess

```js
const handserver = require('handserver');

const start = async () => {
  await handserver.db.init('mongodb://127.0.0.1:27017');

  // 开发过程中可以取消跨域检测，注意不要在生产中使用
  handserver.setCors();

  // 启动 restful-less 服务
  await handserver.setServerLess({
    url: '/less',
    // [可选]是否开启 websocket
    useWss: true,
    // [可选]只开启某些数据库
    onlyOpenDb: new Set(['development', 'production', 'test', 'release']),
    // [可选]只开启某些表
    onlyOpenCol: new Set(['user', 'dev', 'test', 'product']),
    // [可选]对某些请求做权限管理或接管行为
    reducer: {
      // 若访问的是 product 数据库，并且编辑的是 user 表，进行处理：
      'product:user': (data) {
        // 若返回的对象有error属性，表示拦截后续的行为，并且把对象返回给客户端
        if (data.method.indexOf('find') > -1) {
          // 检查 args[0] 是否有 {name: {$eq: xxxx}} 或 {name: {$ls: xxxx}}, 若没有，返回错误
          if (!handserver.reducerHelper.checkFilter(data.args[0], ['name.$eq||name.$ls'])) {
            return {
              'name.$eq': false,
              error: 'can not edit product:user',
            };
          }
        }
        if (data.method.indexOf('update') > -1) {
          // 若返回了 nextData，将使用 nextData 替换原有的body
          return {
            nextData: {
              // 这里我们也可以修改 data，来干涉后续的行为
              args: [{ ...args[0], password: data.password }, args[1]],
              ...data,
            },
          };
        }

        // 若什么都没返回，将不做处理
        return;
    },
  });

  try {
    await handserver.app.listen(4010, '0.0.0.0');
  } catch (error) {
    handserver.app.log.error(error);
    process.exit(1);
  }
};

start();
```

设置了 restfulLess 之后，大部分 mongodb 数据库的操作都迁移到了前端， client 请求。

接下来先为客户端创建一个请求方法 client:

```js
import { createHttpClient, createWsClient } from 'xhr-ws';
const client = createHttpClient('http://127.0.0.1:4010/less');
```

如果开启了 websocket， 我们也可用 websocket 代替 http：

```js
import { createWsClient } from 'xhr-ws';
const client = createWsClient('ws://127.0.0.1:4010');
```

客户端操作数据库，暂时仅支持以下方法:

- insert
- insertMany
- insertOne
- deleteOne
- update
- updateMany
- updateOne
- replaceOne
- find
- findOne

接下来，我们从客户端发起请求，操作数据库，服务端执行 db.collection[method](...args):

```js
client({
  db: 'test',
  col: 'anima',
  method: 'insertOne',
  args: [{ name: 'dog', age: '11', createAt: Date.now() }],
}).then(res => {
  console.log(res.data);
});

// 我们还可以描述哪些字段存表之前，在后端使用sha256加密，或将字段转为ObjectId:
client({
  db: 'test',
  col: 'user',
  method: 'insertOne',
  argsSha256: ['0.password'], // 调整字段：args[0][password]
  argsObjectId: ['0._id'], // 调整字段：args[0][_id]
  args: [{ _id: '5df3d87143234867f3626f2f', username: 'dog', password: 'bbb', createAt: Date.now() }],
}).then(res => {
  console.log(res.data);
});

// 我们看到，创建之后，整个对象也返回了，我们为了节流，可以屏蔽ops:
client({
  db: 'test',
  col: 'user',
  method: 'insertOne',
  argsSha256: ['0.password'], // 调整字段：args[0][password]
  argsObjectId: ['0._id'], // 调整字段：args[0][_id]
  args: [{ _id: '5df3d87143234867f3626f2f', username: 'dog', password: 'bbb', createAt: Date.now() }],
  // 删除返回值的 ops[0] 字段, 注意，前端设置 remove 仅适合减少数据流量，如要提高数据安全性，请在后端设置 impose.remove
  remove: ['ops.0'],
}).then(res => {
  console.log(res.data);
});

// 更新操作:
client({
  db: 'test',
  col: 'user',
  method: 'updateOne',
  // 若在服务端设置了 impose.user, 其中描述了必须声明对 user 表的操作必须校验 username 和 password
  args: [{ username: { $eq: 'dog' }, password: { $eq: 'bbb' } }, { $set: { money: 100, updateAt: Date.now() } }],
  trim: ['ops.0.password'],
}).then(res => {
  console.log(res.data);
});

// 删除操作:
client({
  db: 'test',
  col: 'user',
  method: 'deleteOne',
  // 若在服务端设置了 impose.user, 其中描述了必须声明对 user 表的操作必须校验 username 和 password
  args: [{ username: { $eq: 'dog' }, password: { $eq: 'bbb' } }],
}).then(res => {
  console.log(res.data);
});

// 复合操作:
client({
  events: [
    {
      db: 'test',
      col: 'user',
      method: 'find',
      // 若查找或者编辑行为不成立，拦截后续的行为
      block: true,
      args: [{ username: { $eq: 'dog' }, password: { $eq: 'bbb' } }],
    },
    {
      db: 'test',
      col: 'user',
      method: 'deleteOne',
      // 若在服务端设置了 impose.user, 其中描述了必须声明对 user 表的操作必须校验 username 和 password
      args: [{ username: { $eq: 'dog' }, password: { $eq: 'bbb' } }],
    },
  ],
}).then(res => {
  console.log(res.data);
});
```

以上示例演示了如何在客户端直接创建、修改、删除数据库的操作，并且演示了如何约定校验\剔除数据、添加非对称加密，以提高一部分安全性。

## 普通服务

handserver 亦可以快速搭建普通的 web 服务：

```js
const handserver = require('handserver');

const start = async () => {
  await handserver.db.init('mongodb://127.0.0.1:27017');

  // 开发过程中可以取消跨域检测
  handserver.setCors();

  // 自动加载文件名包含 .controller.js 的文件
  handserver.controllersLoader(resolve(__dirname, './controllers'), '.controller.js');

  handserver.app.get('/ping', (req, rep) => {
    rep.send({ hello: 'world' });
  });

  handserver.app.post('/ping', (req, rep) => {
    let { username, password } = req.body || {};

    rep.send({ hello: `${username}-${password}` });
  });

  try {
    await handserver.app.listen(4010, '0.0.0.0');
  } catch (error) {
    handserver.app.log.error(error);
    process.exit(1);
  }
};

start();
```
