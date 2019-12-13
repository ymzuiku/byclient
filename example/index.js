const lightning = require('../umd');
// const { resolve } = require('path');

const start = async () => {
  await lightning.db.init('mongodb://127.0.0.1:27017', 'test');

  lightning.dbLocker = {
    dev_test: {
      filter: ['$eq.user', '$eq.password'],
      trim: [],
    },
  };

  lightning.setCors();

  lightning.app.get('/ping', (req, rep) => {
    rep.send({ hello: 'world' });
  });

  lightning.app.post('/ping', (req, rep) => {
    let { username, password } = req.body || {};

    rep.send({ hello: `${username}-${password}` });
  });

  lightning.serverless();

  try {
    await lightning.app.listen(4010, '0.0.0.0');
  } catch (error) {
    lightning.app.log.error(error);
    process.exit(1);
  }
};

start();
