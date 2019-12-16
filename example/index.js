const lightning = require('../umd');

const start = async () => {
  await lightning.db.init('mongodb://127.0.0.1:27017', 'test');

  lightning.setCors();

  lightning.app.get('/rsa/client', (req, rep) => {
    rep.send(`
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
  });

  lightning.serverless({
    url: '/less',
    checkKey: '123',
    checkTime: 60 * 1000 * 15,
    checkFilter: {
      dev_test: {
        filter: [['$eq.user', '$eq.password'], '$eq:token'],
        trim: [],
      },
    },
    RSAKey: `
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJcEhpW60HpyTQ4ALikyoYkmqb40uTVd
5BBWf8jHvXmsP+jv4UgMZc9tbSxBC6ug3FsiFaHzLT+6cfSq+HIsFxkCAwEAAQ==
-----END PUBLIC KEY-----
-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJBAI6ZEQnI7LICgjpmYtwpRhBa5vIVPHTS6VVHE/WVoK6cduwwJyNX
7PYgFHT9CrKJVdd99XmqN2TbNRaFkTetaA0CAwEAAQJABA233UZX7CuEFjLo5odJ
1Zcv73vJDy0bsu/lUlrhiXUgJm7Ellr9B6hE6UO4Qoy01L7ufaImzRsfIc9JkJau
JQIhAOSs0IyWn1tbOcwqLfkRFRd1h5vg6h340BRdK59y0kqLAiEAn6MlebDrOJw7
iaCa6tffyRuAjgK+qlttWGK5QeXNIscCIElA2uXOcmoPhSpT8LoysLD9I13Z5OWJ
CQ8c8ZZ4b8kVAiBuKH6rwtIOdoD/L7y3YdAjTr8fP/WiSQTjgPyl5JXx8QIgbmsI
L5/FGbQ9KqH6LREFOmq6Iz8PFZGGD+Pe1u/MgEA=
-----END RSA PRIVATE KEY-----
    `,
  });

  try {
    await lightning.app.listen(4010, '0.0.0.0');
  } catch (error) {
    lightning.app.log.error(error);
    process.exit(1);
  }
};

start();
