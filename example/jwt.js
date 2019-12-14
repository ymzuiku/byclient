const Axios = require('axios').default;
const { AES } = require('../umd');

const start = async () => {
  const lightning = async data => {
    const time = Date.now();

    return new Promise(cb => {
      console.log(data);
      Axios.post('http://127.0.0.1:4010/lightning', data, {
        headers: { 'content-type': 'application/json', time },
      })
        .then(res => {
          cb(res.data ? res.data : res);
        })
        .catch(err => cb(err.response ? err.response.data : err));
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
    args: [{ name: 'dog你好', age: 10 }],
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
