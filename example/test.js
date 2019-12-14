const Axios = require('axios').default;
const { AES } = require('../umd');

AES.config.key = 'D7E1499A578490DF'.slice(0, 16);
AES.config.iv = '304E9E87DB9C1C81'.slice(0, 16);

const start = async () => {
  const lightning = async data => {
    const time = Date.now();

    return new Promise(cb => {
      Axios.post('http://127.0.0.1:4010/lightning', AES.encode({ data, kvi: time, json: true }), {
        headers: { 'content-type': 'application/json', time },
      })
        .then(res => {
          cb(JSON.parse(AES.decode({ data: res.data, kvi: time, json: true })));
        })
        .catch(err => cb(err.response.data));
    });
  };

  // lightning({
  //   method: 'insertOne',
  //   argsSha256: ['0.password'],
  //   // argsObjectId: ['0.id'],
  //   args: [{ name: 'dog', age: '11', password: 'bbb' }],
  // })
  //   .then(res => {
  //     console.log(res.data);
  //   })
  //   .catch(err => {
  //     console.log(err.response.data);
  //   });

  var response = await lightning({
    method: 'insertOne',
    args: [{ name: 'dog', age: 10 }],
  });

  console.log(response);

  // lightning({
  //   col: 'dev_user',
  //   method: 'updateOne',
  //   args: [{ token: { $eq: 'aa' } }, { $set: { createAt: Date.now() } }],
  // }).then(res => {
  //   console.log(res.data);
  // });

  // lightning({
  //   col: 'dev_user',
  //   method: 'insertOne',
  //   // args: [{}, null],
  //   // args: [{ token: { $eq: 'aa' } }, { $set: { createAt: Date.now() } }],
  // }).then(res => {
  //   console.log(res.data);
  // });
};

start();
