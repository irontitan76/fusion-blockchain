import crypto from 'crypto';
import EC from 'elliptic';

export const ec = new EC.ec('secp256k1');

export const verifySignature = ({ data, publicKey, signature }) => {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
  return keyFromPublic.verify(sha256(data), signature);
};

export const sha256 = (...inputs) => {
  const hash = crypto.createHash('sha256'); 
  hash.update(inputs.map((input) => JSON.stringify(input)).sort().join(' '));
  return hash.digest('hex');
};
