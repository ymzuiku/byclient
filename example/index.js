const lightning = require('../umd');

const start = async () => {
  await lightning.db.init('mongodb://127.0.0.1:27017', 'test');

  lightning.dbLocker = {
    dev_test: {
      filter: ['$eq.user', '$eq.password'],
      trim: [],
    },
  };

  lightning.setCors();
  // const AES = lightning.AES;
  // AES.config.key = 'D7E1499A578490DF'.slice(0, 16);
  // AES.config.iv = '304E9E87DB9C1C81'.slice(0, 16);

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
