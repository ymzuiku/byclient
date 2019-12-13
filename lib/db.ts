import { Db, MongoClient } from 'mongodb';

export const db = (dbName?: string): Db => db.getDb(dbName);
db.defaultDbName = '';
db.getDb = (dbName = db.defaultDbName): Db => null as any;
db.inited = false;
db.init = (uri = 'mongodb://127.0.0.1:27017', defaultDbName = 'test') => {
  if (db.inited) {
    return;
  }
  db.inited = true;

  db.defaultDbName = defaultDbName;
  return new Promise(res => {
    MongoClient.connect(uri, {
      // useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(client => {
      db.getDb = dbName => client.db(dbName || db.defaultDbName);
      res();
    });
  });
};
