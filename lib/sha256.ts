import crypto from 'crypto';

export const sha256 = (str: string, slat?: string) => {
  const obj = crypto.createHash('sha256');
  obj.update(str + (slat ? slat : ''));

  return obj.digest('hex');
};
