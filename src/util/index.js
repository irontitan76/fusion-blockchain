const crypto = require('crypto');
const EC = require('elliptic').ec;

const ec = new EC('secp256k1');

const verifySignature = ({ data, publicKey, signature }) => {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
  return keyFromPublic.verify(sha256(data), signature);
};

const sha256 = (...inputs) => {
  const hash = crypto.createHash('sha256'); 
  hash.update(inputs.sort().join(' '));
  return hash.digest('hex');
};

module.exports = { ec, sha256, verifySignature };
