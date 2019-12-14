const Axios = require('axios').default;
const { RSA } = require('../umd');

RSA.init(`
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI6ZEQnI7LICgjpmYtwpRhBa5vIVPHTS
6VVHE/WVoK6cduwwJyNX7PYgFHT9CrKJVdd99XmqN2TbNRaFkTetaA0CAwEAAQ==
-----END PUBLIC KEY-----
-----BEGIN RSA PRIVATE KEY-----
MIIBOgIBAAJBAJcEhpW60HpyTQ4ALikyoYkmqb40uTVd5BBWf8jHvXmsP+jv4UgM
Zc9tbSxBC6ug3FsiFaHzLT+6cfSq+HIsFxkCAwEAAQJAZIHVlJc1oxipYdUK485X
pfD+baGnVfY8EAeRmi4dU3khoO3837K7nEF6/zlb0/E59xA3ytw0ww6D7pKIa02S
gQIhAN2qtBZ6AhWxYzXvxc6y43eq74LvMfp7XYfNqkMaaW7RAiEArmiEnojnD3Aj
hEct0npSPpPQC+LygJ2SQTFxBFUaBckCIHtOQe9e31oB2xZd0sMwb6hZxfIn7L1R
cq3gkh3Ry2SBAiBUFiYifSTRp6IoC11HRhxS+Vbr9C4w3kd+UQUJLrKOKQIhAMAb
xRNJjNFCbTEyKb65ydGFYtcwzcX+AUcLlOb/n7G+
-----END RSA PRIVATE KEY-----  
`);

const start = async () => {
  const lightning = async data => {
    return new Promise(cb => {
      Axios.post(
        'http://127.0.0.1:4010/lightning',
        { code: RSA.encode(data) },
        {
          headers: { 'content-type': 'application/json' },
        },
      )
        .then(res => {
          if (res.data) {
            if (res.data.code) {
              return cb(RSA.decode(res.data.code));
            }
            return cb(res.data);
          }
          return res;
        })
        .catch(err => cb(err.response ? err.response.data : err));
    });
  };

  var response = await lightning({
    method: 'insertOne',
    args: [{ name: 'dog你好', age: 10 }],
  });

  console.log(response);
};

start();
