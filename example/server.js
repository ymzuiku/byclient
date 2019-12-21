const handserver = require('../umd');

const start = async () => {
  await handserver.db.init('mongodb://127.0.0.1:27017', 'test');

  handserver.setCors();

  await handserver.setRestfulLess({
    url: '/less',
    useWss: true,
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
    await handserver.app.listen(4010, '0.0.0.0');
  } catch (error) {
    handserver.app.log.error(error);
    process.exit(1);
  }
};

start();
