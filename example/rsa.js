const Axios = require('axios').default;
const NodeRSA = require('node-rsa');

const encode = new NodeRSA({ b: 1024 });
encode.setOptions({ encryptionScheme: 'pkcs1' });
encode.importKey(
  `
-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCNcfM13k4EMXA6OvlT8t6DfQfAIIdwXB84FejbMMzdKRYZUmHT
AsLaQcxIVd7eUhpUCjgJnSKpEI1gRByal3YGv0QAzTMzGE36EXjgJo0EUoAnBRAb
XmOqI5T7GZqI+Ox8jvfDVA5yadwcVQVTwuXQwefuvNfJXKNu4RbcnuvHtwIDAQAB
AoGAG9zsmhn2qGDMyMvBPcZECwbgNfqyc3HSPIwkWLleQdrMHaTa3GRY2gHIKh+w
TX9C7Hcu3sXzg/Zcwy/nqpRXjWUo6XfFbRsHcJvLFglc+xuWNw/iR39V8FlN9ACE
cBXqVdeLyHeXb45+uW3DbxX53IyeSGPYF9tyA0toc4k+5tECQQDXUVlOVxMBkgN3
XqlBrRLkvXsPm0quGB+8wFZjcukHCiuwx8Q4tJKDMBJ4SyDcsKCG53G/pIlTmSSs
sPQjSH0NAkEAqCt5MyH8yHnRp6HaKXcJA8PPGEpF7ccqH8uJGXPgnznZN/GSnJot
1S0/6HMIjhD4GmzbVfKmuNoW24bixy4O0wJAPghIw2IgrqYja4ORHcPAGrhgONnT
hR6cHiQHf3U+n3GVrsOOy4tyXms+FvwGBq64QMVzJvQ/QB9xynLck0GyDQJAZrh/
RKNrA42daVZsqs1B3WHaeszLYA06hsdNTBXCy5+LNifB1RQ8EK2eDr9NJ3HoCkQZ
yar4+YqFUbxXgzB37wJBAJcR/dMuic4qNLja1ZMLSfyY1TPSgdbetNnLResoHAr0
vDaDEPapT7AMRgj1qXXGs0/d9MIDeobDQwLqMOXGPqc=
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
