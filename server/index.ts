import { db, app, setCors, setMethodLess } from '../lib';
import * as methods from './methods';

const start = async () => {
  await db.init('mongodb://127.0.0.1:27017', 'test');

  setCors();
  setMethodLess({ ...methods });

  app.get('/ping', async () => {
    return 'pong';
  });

  try {
    await app.listen(4011, '0.0.0.0');
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
