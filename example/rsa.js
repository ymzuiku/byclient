const Axios = require('axios').default;
const NodeRSA = require('node-rsa');

const encode = new NodeRSA({ b: 1024 });
encode.setOptions({ encryptionScheme: 'pkcs1' });
encode.importKey(
  `
  -----BEGIN RSA PRIVATE KEY-----
  MIICXAIBAAKBgQCZ78yV/ZI0VSBjvgWTqMprm7eUovcnVBKS8uIg84ZLgHQKUEeR
  FCfidbLVj/ClXD/KBauyQlzKII0Q9ST7IQpxkHERn+mGvAq7+1dF6nGIy25OzyT0
  /eRL0Q+o/yfC+QjgCxJZ0RP2U+Q+b5gor+EKGG4W/4w5eAGJ/RRw+tnyOwIDAQAB
  AoGAILXJ/V1CgghMt6UbPkMxsCgInHb8mcjNoZgm4OWeddC317EzY+qqhv6Hn8XU
  Vu8BRwZpc5mSagj8sMvGre5Zb21a2vPCK5WtavTqkrzE6lkGRCaUXFUlm3qM59NT
  dda4Lfs92pQVA9hIEq0hvUD+ove5P9RtH0llskrx1ozYXSECQQD90FWuVCJTVHko
  /Wx6QkHBeRU2OnhkaSe725eqF4a4Y5X/ZoCOq2bhbwDzbJQNqyE0BSFM3ayIAmtG
  0lPAiulZAkEAm0M7sYRYUN6LbYxC99HooCJ/sa/KsvX2v2v7RMCnIJXohEQZV+Ma
  Go1zgjEy3CfK2RUIH6NXnhnkId6GZuzxswJBAPwhDlwEO6znhwwO4sl4M/XLICUk
  ZB/qzYuxkbFneW6FjqWM3zvaTHK4YAtv2orRakRQrEm9Evxw2rwZhxUHaNECQDSL
  PVFnK4g6uE7bj/JUXHiNFE/q4RtNeDLx9TggRq8VbHoOndELb1MbGcMuqTquUMzE
  fFpQqh88PeNkbnG4sFcCQEHq1RneVG/aZ9lKrQ2UYa599FOpMBDndeZv/1uQRN7G
  ldM39cazWikBMhrLziNqVZOC9m7A+SHYqwJQ5K/bll4=
  -----END RSA PRIVATE KEY-----
`,
  'private',
);
const client = async data => {
  return new Promise(cb => {
    const code = encode.encryptPrivate({ ...data, _checkTime: Date.now(), _checkKey: '123456' }, 'base64');

    Axios.post(
      'http://127.0.0.1:4010/less',
      { code },
      {
        headers: { 'content-type': 'application/json' },
      },
    )
      .then(res => {
        if (res.data) {
          return cb(res.data);
        }
        return res;
      })
      .catch(err => cb(err.response ? err.response.data : err));
  });
};

// test
client({
  method: 'insertOne',
  args: [
    {
      name: 'dog你好',
      list: [
        "1234567890asdfghjklqwertyuiuiop[]|\\xcxcqwertyuiopasdfghhjjklzcxzn ,.c.bv'[]",
        '你好，测试中文，和中文标点符号:；，。/【】、-=，M《》',
        // '测试超过rsa分段',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        // 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        // 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      ],
      age: 10,
    },
  ],
}).then(res => console.log(res));
