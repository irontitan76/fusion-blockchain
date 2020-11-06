const uuid = require('uuid');
const { verifySignature } = require('../util');

module.exports = class Transaction {
  constructor({ amount, recipient, senderWallet }) {
    this.id = uuid.v1();
    this.outputMap = this.createOutputMap({ amount, recipient, senderWallet });
    this.input = this.createInput({ outputMap: this.outputMap , senderWallet });
  }

  static isValid(transaction) {
    const { input: { amount, address, signature }, outputMap } = transaction;

    const outputTotal = Object.values(outputMap)
      .reduce((total, outputAmount) => outputAmount + total);

    if (amount !== outputTotal) {
      console.error(`invalid transaction from ${address}`);
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`invalid signature from ${address}`);
      return false;
    }

    return true;
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

  update({ amount, recipient, senderWallet }) {
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error('Amount exceeds balance');
    }

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;
    this.input = this.createInput({ outputMap: this.outputMap, senderWallet });
  }
}