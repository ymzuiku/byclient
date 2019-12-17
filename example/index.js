const byclient = require('../umd');

const start = async () => {
  await byclient.db.init('mongodb://127.0.0.1:27017', 'test');

  byclient.setCors();

  await byclient.serverless({
    url: '/less',
    checkKey: '123456',
    checkTime: 60 * 1000 * 15,
    checkFilter: {
      dev_test: {
        filter: [['$eq.user', '$eq.password'], '$eq:token'],
        trim: [],
      },
    },
    blockCol: ['user.delete.test'],
    autoRSA: 'test',
  });

  try {
    await byclient.app.listen(4010, '0.0.0.0');
  } catch (error) {
    byclient.app.log.error(error);
    process.exit(1);
  }
};

start();
