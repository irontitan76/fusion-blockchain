import { v1 } from 'uuid';
import { verifySignature } from '../util';
import { MINING_REWARD, REWARD_INPUT } from '../config';

export default class Transaction {
  constructor({ amount, input, outputMap, recipient, senderWallet }) {
    this.id = v1();
    this.outputMap = outputMap || this.createOutputMap({ amount, recipient, senderWallet });
    this.input = input || this.createInput({ outputMap: this.outputMap , senderWallet });
  }

  static isValid(transaction) {
    const { input: { amount, address, signature }, outputMap } = transaction;

    const outputTotal = Object.values(outputMap)
      .reduce((total, outputAmount) => outputAmount + total);

    if (amount !== outputTotal) {
      // eslint-disable-next-line no-console
      console.error(`invalid transaction from ${address}`);
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      // eslint-disable-next-line no-console
      console.error(`invalid signature from ${address}`);
      return false;
    }

    return true;
  }

  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  createInput({ outputMap, senderWallet }) {
    return {
      address: senderWallet.publicKey,
      amount: senderWallet.balance,
      signature: senderWallet.sign(outputMap),
      timestamp: Date.now(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
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
      this.outputMap[recipient] += amount;
    }

    this.outputMap[senderWallet.publicKey] -= amount;
    this.input = this.createInput({ outputMap: this.outputMap, senderWallet });
  }
}