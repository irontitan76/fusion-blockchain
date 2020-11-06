const { STARTING_BALANCE } = require('../config');
const { ec, sha256 } = require('../util');

module.exports = class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  sign(data) {
    return this.keyPair.sign(sha256(data));
  }
} 