import crypto from 'crypto';

export const sha256 = (...inputs) => {
  const hash = crypto.createHash('sha256'); 
  hash.update(inputs.sort().join(' '));
  return hash.digest('hex');
};