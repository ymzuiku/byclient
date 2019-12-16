const Axios = require('axios').default;
const NodeRSA = require('node-rsa');

const decode = new NodeRSA({ b: 512 });
decode.setOptions({ encryptionScheme: 'pkcs1' });
decode.importKey(
  `
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI9UlD+q0TEPH2U2wLHM6Pl+kwadrHxS
gMBr9IaLNwg3etHbzKktJ/tpKxtygOUm9F1+bmJOQvkamQpPYql/P+kCAwEAAQ==
-----END PUBLIC KEY-----
`,
  'public',
);

const encode = new NodeRSA({ b: 512 });
encode.setOptions({ encryptionScheme: 'pkcs1' });
encode.importKey(
  `
-----BEGIN RSA PRIVATE KEY-----
MIIBPAIBAAJBAM0weU8cwkKXu0+VG+7L5KJkX3ePIdfva6LL4uF06YeR9YrTGHhd
5/sS7M81MfFzYylLCqO94RJNtgih8MT/essCAwEAAQJAeUAGv0goRv+wkTN0oSTd
Q1T60QTEo/x352iB9maGxTPcLZuM3NwwcwtKN4cZ9aL53Y9SMpYdCjpx67NWcx2S
oQIhAPpmH1s+kL1wTPnl6QXcoXoiVnZh2oFc/nfq2z4CM6fxAiEA0cd27V3OzAFs
saDiqShwoqE2wCaf+8pH805EpsDkansCIQCWg4BhtpAGb1S1+k9B6MdfxPg4HMXd
cOq9Znz3Hxex4QIhAIjDR498huONUjWDtAGgMb505+Lhy4810y6WKj+kpcWdAiEA
8XJBxFjhQuE28aRbV+fVuiHQX1LHOu2FPGc2BewB/eQ=
-----END RSA PRIVATE KEY-----
`,
  'private',
);
const client = async data => {
  return new Promise(cb => {
    Axios.post(
      'http://127.0.0.1:4010/less',
      { code: encode.encryptPrivate({ ...data, _checkTime: Date.now(), _checkKey: '123456' }, 'base64') },
      {
        headers: { 'content-type': 'application/json' },
      },
    )
      .then(res => {
        if (res.data) {
          if (res.data.code) {
            return cb(decode.decryptPublic(res.data.code, 'utf8'));
          }
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
  args: [{ name: 'dog你好', age: 10 }],
}).then(res => console.log(res));
