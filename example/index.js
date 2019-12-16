const lightning = require('../umd');

const start = async () => {
  await lightning.db.init('mongodb://127.0.0.1:27017', 'test');

  lightning.setCors();

  await lightning.serverless({
    url: '/less',
    checkKey: '123456',
    checkTime: 60 * 1000 * 15,
    checkFilter: {
      dev_test: {
        filter: [['$eq.user', '$eq.password'], '$eq:token'],
        trim: [],
      },
    },
    autoRSA: 'test',
  });

  try {
    await lightning.app.listen(4010, '0.0.0.0');
  } catch (error) {
    lightning.app.log.error(error);
    process.exit(1);
  }
};

start();
