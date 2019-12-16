import NodeRSA from 'node-rsa';

export interface IRSA {
  priateKey: NodeRSA;
  publicKey: NodeRSA;
  init: (keyData: string) => void;
  decode: (text: string) => string;
  encode: (data: any) => string;
  createKeys: () => {
    client: string;
    server: string;
    baseClient: string;
    baseServer: string;
  };
}

export const createRSA = () => {
  const RSA: IRSA = {
    priateKey: null as any,
    publicKey: null as any,
    init: keyData => {
      let [a, b] = keyData.split('-----END PUBLIC KEY-----');
      a += `-----END PUBLIC KEY-----`;

      RSA.publicKey = new NodeRSA({ b: 512 });
      RSA.priateKey = new NodeRSA({ b: 512 });
      RSA.publicKey.importKey(a, 'public');
      RSA.priateKey.importKey(b, 'private');
      RSA.publicKey.setOptions({ encryptionScheme: 'pkcs1' });
      RSA.priateKey.setOptions({ encryptionScheme: 'pkcs1' });
    },
    createKeys: () => {
      const client = new NodeRSA({ b: 512 });
      const clientPublic = client.exportKey('public');
      const clientPrivate = client.exportKey('private');

      const server = new NodeRSA({ b: 512 });
      const serverPublic = server.exportKey('public');
      const serverPrivate = server.exportKey('private');

      return {
        client: serverPublic + '\n' + clientPrivate,
        server: clientPublic + '\n' + serverPrivate,
        baseClient: clientPublic + '\n' + clientPrivate,
        baseServer: serverPublic + '\n' + serverPrivate,
      };
    },
    decode: (text: string) => {
      if (!RSA.publicKey) {
        return text;
      }
      return RSA.publicKey.decryptPublic(text, 'utf8');
    },
    encode: (text: any) => {
      if (typeof text !== 'string') {
        text = JSON.stringify(text);
      }
      if (!RSA.publicKey) {
        return text;
      }
      return RSA.priateKey.encryptPrivate(text, 'base64');
    },
  };

  return RSA;
};
