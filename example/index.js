const plot = require('../umd');
// const { resolve } = require('path');

const start = async () => {
  await plot.db.init('mongodb://127.0.0.1:27017', 'test');

  plot.dbLocker = {
    test2: ['$eq.user', '$eq.password'],
  };

  plot.app.get('/ping', (req, rep) => {
    rep.send({ hello: 'world' });
  });

  plot.app.post('/ping', (req, rep) => {
    let { username, password } = req.body || {};

    rep.send({ hello: `${username}-${password}` });
  });

  plot.serverless();

  try {
    await plot.app.listen(4010, '0.0.0.0');
  } catch (error) {
    plot.app.log.error(error);
    process.exit(1);
  }
};

start();
