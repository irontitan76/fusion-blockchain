const Transaction = require('./transaction');
const { STARTING_BALANCE } = require('../config');
const { ec, sha256 } = require('../util');

module.exports = class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  createTransaction({ amount, recipient }) {
    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    return new Transaction({
      amount,
      recipient,
      senderWallet: this,
    });
  }

  sign(data) {
    return this.keyPair.sign(sha256(data));
  }
} 