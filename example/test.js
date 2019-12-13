const Axios = require('axios').default;

const axios = Axios.create({
  baseURL: 'http://127.0.0.1:4010',
});

const lighting = (...args) => axios.post('/serverless', [...args]);

// lighting({
//   byId: '5df3d87143234867f3626f2f',
//   method: 'insertOne',
//   argsSha256: ['0.password'],
//   argsObjectId: ['0.id'],
//   args: [{ name: 'dog', age: '11', password: 'bbb' }],
//   block: {
//     'ops.0.age': '11',
//   },
//   dataFilter: ['ops.0.password'],
// })
//   .then(res => {
//     console.log(res.data);
//   })
//   .catch(err => {
//     console.log(err.toJSON());
//   });

// lighting({
//   byId: '5df3d87143234867f3626f2f',
//   method: 'insertMany',
//   args: [
//     [
//       { name: 'dog', age: '11', password: 111 },
//       { name: 'cat', age: '11' },
//     ],
//   ],
// }).then(res => {
//   console.log(res.data);
// });

// lighting({
//   byId: '5df3d87143234867f3626f2f',
//   method: 'updateOne',
//   args: [null, { $set: { name: 'aaa' } }],
// }).then(res => {
//   console.log(res.data);
// });

// lighting({
//   col: 'dev_user',
//   byId: '5df3d87143234867f3626f2f',
//   method: 'insertOne',
//   args: [{ username: 'dog', password: '11', token: 'aa', createAt: Date.now() }],
// }).then(res => {
//   console.log(res.data);
// });

lighting({
  col: 'dev_user',
  byId: '5df3d87143234867f3626f2f',
  method: 'updateOne',
  args: [{ token: { $eq: 'aa' } }, { $set: { createAt: Date.now() } }],
}).then(res => {
  console.log(res.data);
});
