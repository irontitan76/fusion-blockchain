const uuid = require('uuid');

module.exports = class Transaction {
  constructor({ amount, recipient, senderWallet }) {
    this.id = uuid.v1();
    this.outputMap = this.createOutputMap({ amount, recipient, senderWallet });
  }

  createOutputMap({ amount, recipient, senderWallet }) {
    return {
      [recipient]: amount,
      [senderWallet.publicKey]: senderWallet.balance - amount,
    };
  }
}