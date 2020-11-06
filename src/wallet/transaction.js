const uuid = require('uuid');

module.exports = class Transaction {
  constructor({ amount, recipient, senderWallet }) {
    this.id = uuid.v1();
    this.outputMap = this.createOutputMap({ amount, recipient, senderWallet });
    this.input = this.createInput({ outputMap: this.outputMap , senderWallet });
  }

  createInput({ outputMap, senderWallet }) {
    return {
      address: senderWallet.publicKey,
      amount: senderWallet.balance,
      signature: senderWallet.sign(outputMap),
      timestamp: Date.now(),
    };
  }

  createOutputMap({ amount, recipient, senderWallet }) {
    return {
      [recipient]: amount,
      [senderWallet.publicKey]: senderWallet.balance - amount,
    };
  }
}