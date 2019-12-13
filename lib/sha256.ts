import crypto from 'crypto';

export const sha256 = (str: string) => {
  const obj = crypto.createHash('sha256');
  obj.update(str + sha256.slat);

  return obj.digest('hex');
};

sha256.slat = 'lightning_slat_v0.0.1';
