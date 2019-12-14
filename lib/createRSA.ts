import NodeRSA from 'node-rsa';

export interface IRSA {
  priateKey: NodeRSA;
  publicKey: NodeRSA;
  init: (keyData: string) => void;
  decode: (text: string) => string;
  encode: (data: any) => string;
  createKeys: () => string;
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
      // RSA.key.setOptions({ encryptionScheme: 'pkcs1' });
    },
    createKeys: () => {
      const key = new NodeRSA({ b: 512 });
      let out = '';
      out += key.exportKey('public');
      out += key.exportKey('private');
      return out;
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
