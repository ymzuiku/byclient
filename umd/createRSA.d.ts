import NodeRSA from 'node-rsa';
export interface IRSA {
    priateKey: NodeRSA;
    publicKey: NodeRSA;
    init: (keyData: string) => void;
    decode: (text: string) => string;
    encode: (data: any) => string;
    createKeys: () => string;
}
export declare const createRSA: () => IRSA;
