# 旨在解放小型应用的后端工作量

基于 `fastify` 的 serverless

## serverless

```js
const byclient = require('byclient');

const start = async () => {
  await byclient.db.init('mongodb://127.0.0.1:27017');

  // 开发过程中可以取消跨域检测，注意不要在生产中使用
  byclient.setCors();

  // 启动 serverless 服务
  await byclient.serverless({
    url: '/less',
    // 若设定，会限定每个请求体的有效时间，此例子为前后不超过15分钟
    checkTime: 1000 * 60 * 15,
    // 若设定，会校验一个key，只有key正确时才有权限操作
    checkKey: '123456',
    // 拦截某些数据库的操作
    blockDb: ['user'],
    // 拦截某些表的操作
    blockCol: ['pay'],
    // 针对某些表的一些限制, 提高安全性
    impose: {
      user: {
        // 更新、删除某些表的内容时，操作必须添加的 filter
        filter: [['$eq.user', '$eq.password'], '$eq:token'],
        // 移除user表查询之后返回的数据
        remove: ['ops.0.password'],
      },
    },
    // 开启 RSA 加密，自动配置RSA加密方案, 此密钥请设置较长且保留好
    // 若前后端要更新 RSA 密钥，请更新这个密钥，并且重启服务器
    // 开启 autoRSA，之后，可以通过访问服务 /byclient/rsa?name=the-password 拿到客户端密钥，此服务若失败5次，需要间隔1小时方可尝试
    autoRSA: 'the-password',
  });

  try {
    await byclient.app.listen(4010, '0.0.0.0');
  } catch (error) {
    byclient.app.log.error(error);
    process.exit(1);
  }
};

start();
```

设置了 serverless 之后，大部分 mongodb 数据库的操作都迁移到了前端， client 请求。

我们以开启了 autoRSA 加密方案为例，首先启动服务，然后访问以下链接拿到 client 的 RSA 加密密钥：

`http://0.0.0.0:4010/byclient/rsa?name=the-password`

接下来先为客户端创建一个请求方法 client:

```js
const Axios = require('axios').default;
const NodeRSA = require('node-rsa');

const encode = new NodeRSA({ b: 1024 });
encode.setOptions({ encryptionScheme: 'pkcs1' });
encode.importKey(
  `
-----BEGIN RSA PRIVATE KEY-----
MIIBPAIBAAJBAM0weU8cwkKXu0+VG+7L5KJkX3ePIdfva6LL4uF06YeR9YrTGHhd
5/sS7M81MfFzYylLCqO94RJNtgih8MT/essCAwEAAQJAeUAGv0goRv+wkTN0oSTd
Q1T60QTEo/x352iB9maGxTPcLZuM3NwwcwtKN4cZ9aL53Y9SMpYdCjpx67NWcx2S
oQIhAPpmH1s+kL1wTPnl6QXcoXoiVnZh2oFc/nfq2z4CM6fxAiEA0cd27V3OzAFs
saDiqShwoqE2wCaf+8pH805EpsDkansCIQCWg4BhtpAGb1S1+k9B6MdfxPg4HMXd
cOq9Znz3Hxex4QIhAIjDR498huONUjWDtAGgMb505+Lhy4810y6WKj+kpcWdAiEA
8XJBxFjhQuE28aRbV+fVuiHQX1LHOu2FPGc2BewB/eQ=
-----END RSA PRIVATE KEY-----
`,
  'private',
);
const client = async data => {
  return new Promise(cb => {
    Axios.post(
      'http://127.0.0.1:4010/less',
      { code: encode.encryptPrivate({ ...data, _checkTime: Date.now(), _checkKey: '123456' }, 'base64') },
      {
        headers: { 'content-type': 'application/json' },
      },
    )
      .then(res => {
        if (res.data) {
          return cb(res.data);
        }
        return res;
      })
      .catch(err => cb(err.response ? err.response.data : err));
  });
};
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
```

以上示例演示了如何在客户端直接创建、修改、删除数据库的操作，并且演示了如何约定校验\剔除数据、添加非对称加密，以提高一部分安全性。

## 普通服务

byclient 亦可以快速搭建普通的 web 服务：

```js
const byclient = require('byclient');

const start = async () => {
  await byclient.db.init('mongodb://127.0.0.1:27017');

  // 开发过程中可以取消跨域检测
  byclient.setCors();

  // 自动加载文件名包含 .controller.js 的文件
  byclient.controllersLoader(resolve(__dirname, './controllers'), '.controller.js');

  byclient.app.get('/ping', (req, rep) => {
    rep.send({ hello: 'world' });
  });

  byclient.app.post('/ping', (req, rep) => {
    let { username, password } = req.body || {};

    rep.send({ hello: `${username}-${password}` });
  });

  try {
    await byclient.app.listen(4010, '0.0.0.0');
  } catch (error) {
    byclient.app.log.error(error);
    process.exit(1);
  }
};

start();
```
