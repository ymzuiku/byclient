# 旨在解放小型应用的后端工作量

基于 `fastify` 的 serverless

## 普通服务

```js
const lightning = require('lightning-base');

const start = async () => {
  await lightning.db.init('mongodb://127.0.0.1:27017');

  // 开发过程中可以取消跨域检测
  lightning.setCors();

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

  // 开发过程中可以取消跨域检测，注意不要在生产中使用
  lightning.setCors();

  // 启动 serverless 服务
  lightning.serverless({
    url: '/less',
    // 若设定，会限定每个请求体的有效时间，此例子为前后不超过15分钟
    checkTime: 1000 * 60 * 15,
    // 若设定，会校验一个key，只有key正确时才有权限操作
    checkKey: '123456',
    // 拦截某些数据库的操作
    blockDb: new Set(['pay']),
    // 拦截某些表的操作
    blockDb: new Set(['pay']),
    // 针对某些表的一些限制, 提高安全性
    impose: {
      user: {
        // 更新、删除某些表的内容时，操作必须添加的 filter
        filter: [['$eq.user', '$eq.password'], '$eq:token'],
        // 移除某些数据
        remove: ['ops.0.password'],
      },
    },
    // 若设置,开启RSA加密，请提前交换客户端和服务端的公钥
    RSAKey: `
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJcEhpW60HpyTQ4ALikyoYkmqb40uTVd
5BBWf8jHvXmsP+jv4UgMZc9tbSxBC6ug3FsiFaHzLT+6cfSq+HIsFxkCAwEAAQ==
-----END PUBLIC KEY-----
-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJBAI6ZEQnI7LICgjpmYtwpRhBa5vIVPHTS6VVHE/WVoK6cduwwJyNX
7PYgFHT9CrKJVdd99XmqN2TbNRaFkTetaA0CAwEAAQJABA233UZX7CuEFjLo5odJ
1Zcv73vJDy0bsu/lUlrhiXUgJm7Ellr9B6hE6UO4Qoy01L7ufaImzRsfIc9JkJau
JQIhAOSs0IyWn1tbOcwqLfkRFRd1h5vg6h340BRdK59y0kqLAiEAn6MlebDrOJw7
iaCa6tffyRuAjgK+qlttWGK5QeXNIscCIElA2uXOcmoPhSpT8LoysLD9I13Z5OWJ
CQ8c8ZZ4b8kVAiBuKH6rwtIOdoD/L7y3YdAjTr8fP/WiSQTjgPyl5JXx8QIgbmsI
L5/FGbQ9KqH6LREFOmq6Iz8PFZGGD+Pe1u/MgEA=
-----END RSA PRIVATE KEY-----
    `,
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

设置了 serverless 之后，大部分 mongodb 数据库的操作都迁移到了前端， client 请求：

```js
import { Lightning } from 'lightning-axios';

const lightning = Lightning({
  url: 'http://0.0.0.0:4010/lightning',
  // 若后端设置了 checkKey, 前端就必须传递预定密钥
  checkKey: '123456',
  // 若后端设置了 RSAKey, 前端必须设置交互后的密钥
  // public key 和 private key 要交换，不显性传递
  RSAKey: `
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI6ZEQnI7LICgjpmYtwpRhBa5vIVPHTS
6VVHE/WVoK6cduwwJyNX7PYgFHT9CrKJVdd99XmqN2TbNRaFkTetaA0CAwEAAQ==
-----END PUBLIC KEY-----
-----BEGIN RSA PRIVATE KEY-----
MIIBOgIBAAJBAJcEhpW60HpyTQ4ALikyoYkmqb40uTVd5BBWf8jHvXmsP+jv4UgM
Zc9tbSxBC6ug3FsiFaHzLT+6cfSq+HIsFxkCAwEAAQJAZIHVlJc1oxipYdUK485X
pfD+baGnVfY8EAeRmi4dU3khoO3837K7nEF6/zlb0/E59xA3ytw0ww6D7pKIa02S
gQIhAN2qtBZ6AhWxYzXvxc6y43eq74LvMfp7XYfNqkMaaW7RAiEArmiEnojnD3Aj
hEct0npSPpPQC+LygJ2SQTFxBFUaBckCIHtOQe9e31oB2xZd0sMwb6hZxfIn7L1R
cq3gkh3Ry2SBAiBUFiYifSTRp6IoC11HRhxS+Vbr9C4w3kd+UQUJLrKOKQIhAMAb
xRNJjNFCbTEyKb65ydGFYtcwzcX+AUcLlOb/n7G+
-----END RSA PRIVATE KEY-----   
`,
});

// 发起此请求，服务端执行 db.collection[method](...args):
lighting({
  db: 'test',
  col: 'anima',
  method: 'insertOne',
  args: [{ name: 'dog', age: '11', createAt: Date.now() }],
}).then(res => {
  console.log(res.data);
});

// 客户端操作数据库，暂时仅支持以下 method:
// const canUseMethod = new Set([
//   'insert',
//   'insertMany',
//   'insertOne',
//   'deleteOne',
//   'update',
//   'updateMany',
//   'updateOne',
//   'replaceOne',
//   'find',
//   'findOne',
// ]);

// 我们还可以描述哪些字段存表之前，在后端使用sha256加密，或将字段转为ObjectId:
lighting({
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
lighting({
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
lighting({
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
lighting({
  db: 'test',
  col: 'user',
  method: 'deleteOne',
  // 若在服务端设置了 impose.user, 其中描述了必须声明对 user 表的操作必须校验 username 和 password
  args: [{ username: { $eq: 'dog' }, password: { $eq: 'bbb' } }],
}).then(res => {
  console.log(res.data);
});
```

示例演示了如何在客户端直接创建、修改、删除数据库的操作，并且演示了如何约定校验\剔除数据、添加非对称加密，以提高一部分安全性。
