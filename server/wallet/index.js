import Transaction from './transaction';
import { STARTING_BALANCE } from '../config';
import { ec, sha256 } from '../util';

export default class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  static calculateBalance({ address, chain }) {
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    // Skip Genesis Block
    for (let i = chain.length - 1; i > 0; i -= 1) {
      const block = chain[i];

      // eslint-disable-next-line
      for (const transaction of block.data) {
        if (transaction.input.address === address) {
          hasConductedTransaction = true;
        }

        const addressOutput = transaction.outputMap[address];

        if(addressOutput) {
          outputsTotal += addressOutput;
        }
      }

      if (hasConductedTransaction) break;
    }
    
    return hasConductedTransaction
      ? outputsTotal
      : STARTING_BALANCE + outputsTotal;
  }

  createTransaction({ amount, chain, recipient }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        address: this.publicKey,
        chain,
      });
    }

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