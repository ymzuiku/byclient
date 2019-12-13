const Axios = require('axios').default;

const axios = Axios.create({
  baseURL: 'http://127.0.0.1:4010',
});

const lighting = (...args) => axios.post('/serverless', [...args]);

// lighting({
//   method: 'insertOne',
//   argsSha256: ['0.password'],
//   argsObjectId: ['0.id'],
//   args: [{ name: 'dog', age: '11', password: 'bbb' }],
//   block: {
//     'ops.0.age': '11',
//   },
//   trim: ['ops.0.password'],
// })
//   .then(res => {
//     console.log(res.data);
//   })
//   .catch(err => {
//     console.log(err.toJSON());
//   });

// lighting({
//   col: 'dev_user',
//   method: 'updateOne',
//   args: [{ token: { $eq: 'aa' } }, { $set: { createAt: Date.now() } }],
// }).then(res => {
//   console.log(res.data);
// });

lighting({
  col: 'dev_user',
  method: 'findOne',
  args: [{}, null],
  // args: [{ token: { $eq: 'aa' } }, { $set: { createAt: Date.now() } }],
}).then(res => {
  console.log(res.data);
});
