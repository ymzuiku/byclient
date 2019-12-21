const handserver = require('../umd');

const start = async () => {
  await handserver.db.init('mongodb://127.0.0.1:27017', 'test');

  handserver.setCors();

  await handserver.setServerLess({
    url: '/less',
    useWss: true,
    // 对每个匹配的请求做处理，通常此处做一些权限管理即可
    reducer: {
      // 若访问的是 product 数据库，并且编辑的是 user 表，进行处理：
      'test:test': async data => {
        // 拦截所有非查询操作
        if (data.method.indexOf('find') > -1) {
          // 若返回的对象有error属性，表示拦截后续的行为，并且把对象返回给客户端

          if (!handserver.reducerHelper.checkFilter(data.args[0], ['name.$eq||name.$eq2'])) {
            return {
              'name.$eq': false,
              // data,
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
