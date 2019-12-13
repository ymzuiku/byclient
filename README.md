# 旨在解放小型应用的后端工作量

一个抽象了登录注册流程，及 serverless 的服务端，基于 `fastify`

## 普通服务

```js
const lightning = require('lightning-base');

const start = async () => {
  await lightning.db.init('mongodb://127.0.0.1:27017');

  // 自动加载文件名包含 .controller.js 的文件
  lightning.controllersLoader(resolve(__dirname, './controllers'), '.controller.js');

  lightning.app.get('/ping', (req, rep) => {
    rep.send({ hello: 'world' });
  });

  lightning.app.post('/ping', (req, rep) => {
    let { username, password } = req.body || {};

    rep.send({ hello: `${username}-${password}` });
  });

  try {
    await lightning.app.listen(4010, '0.0.0.0');
  } catch (error) {
    lightning.app.log.error(error);
    process.exit(1);
  }
};

start();
```

## serverless

```js
const lightning = require('lightning-base');

const start = async () => {
  await lightning.db.init('mongodb://127.0.0.1:27017');

  // 安全性：描述哪些表的update、delete操作需要校验的对象
  lightning.dbLocker = {
    user: ['token.$eq', ['username.$eq', 'password.$eq']],
  };

  // 启动 serverless 服务
  lightning.serverless();

  try {
    await lightning.app.listen(4010, '0.0.0.0');
  } catch (error) {
    lightning.app.log.error(error);
    process.exit(1);
  }
};

start();
```

设置了 serverless 之后，大部分 mongodb 数据库的操作都迁移到了前端， client 请求：

```js
const Axios = require('axios').default;

const axios = Axios.create({
  baseURL: 'http://127.0.0.1:4010',
});

const lighting = (...args) => axios.post('/serverless', [...args]);

// 发起此请求，服务端执行 db.collection[method](...args):
lighting({
  db: 'test',
  col: 'anima',
  method: 'insertOne',
  args: [{ name: 'dog', age: '11', createAt: Date.now() }],
})
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err.toJSON());
  });

// 我们还可以描述哪些字段存表之前，在后端使用sha256加密，或将字段转为ObjectId:
lighting({
  db: 'test',
  col: 'user',
  method: 'insertOne',
  argsSha256: ['0.password'], // 调整字段：args[0][password]
  argsObjectId: ['0._id'], // 调整字段：args[0][_id]
  args: [{ _id: '5df3d87143234867f3626f2f', username: 'dog', password: 'bbb', createAt: Date.now() }],
})
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err.toJSON());
  });

// 我们看到，创建之后，密码也返回了；我们可以对返回值做一些删除:
lighting({
  db: 'test',
  col: 'user',
  method: 'insertOne',
  argsSha256: ['0.password'], // 调整字段：args[0][password]
  argsObjectId: ['0._id'], // 调整字段：args[0][_id]
  args: [{ _id: '5df3d87143234867f3626f2f', username: 'dog', password: 'bbb', createAt: Date.now() }],
  // 删除返回值的 ops[0].password 字段
  dataFilter: ['ops.0.password'],
})
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err.toJSON());
  });

// 更新操作:
lighting({
  db: 'test',
  col: 'user',
  method: 'updateOne',
  // 上文在服务端设置了 dbLocker, 其中描述了必须声明对 user 表的操作必须校验 username 和 password
  args: [{ username: { $eq: 'dog' }, password: { $eq: 'bbb' } }, { $set: { money: 100, updateAt: Date.now() } }],
  dataFilter: ['ops.0.password'],
})
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err.toJSON());
  });

// 删除操作:
lighting({
  db: 'test',
  col: 'user',
  method: 'deleteOne',
  // 上文在服务端设置了 dbLocker, 其中描述了必须声明对 user 表的操作必须校验 username 和 password
  args: [{ username: { $eq: 'dog' }, password: { $eq: 'bbb' } }],
})
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err.toJSON());
  });
```

示例演示了如何在客户端直接创建、修改、删除数据库的操作，并且演示了如何约定校验，以提高一部分安全性。
