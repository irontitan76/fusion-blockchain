/* eslint-disable no-console */

import Block from './block';
import Transaction from '../wallet/transaction';
import Wallet from '../wallet/index';
import { sha256 } from '../util/index';
import { REWARD_INPUT, MINING_REWARD } from '../config';

export default class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    for (let i = 1; i < chain.length; i += 1) {
      const block = chain[i];
      const { data, difficulty, hash, lastHash, nonce, timestamp } = block;

      const lastDifficulty = chain[i - 1].difficulty;
      if (Math.abs(lastDifficulty - difficulty) > 1) return false;

      const actualLastHash = chain[i - 1].hash;
      if (lastHash !== actualLastHash) return false;

      const validatedHash = sha256(data, difficulty, lastHash, nonce, timestamp);
      if (hash !== validatedHash) return false;
    }

    return true;
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      data,
      lastBlock: this.chain[this.chain.length - 1],
    });

    this.chain.push(newBlock);
  }

  replaceChain(chain, validateTransactions, onSuccess) {
    if (chain.length <= this.chain.length) {
      // eslint-disable-next-line no-console
      console.error('incoming chain must be longer.');
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      // eslint-disable-next-line no-console
      console.error('incoming chain is not valid.');
      return;
    }

    if (validateTransactions && !this.validTransactionData({ chain })) {
      // eslint-disable-next-line no-console
      console.error('incoming chain has invalid data');
      return;
    }
    
    if (onSuccess) onSuccess();
    // eslint-disable-next-line no-console
    console.log('replacing chain with', chain);
    this.chain = chain;
  }

  validTransactionData({ chain }) {
    // Skip Genesis Block
    for(let i = 1; i < chain.length; i += 1) {
      const block = chain[i];
      const transactionSet = new Set();
      let rewardTransactionsCount = 0;

      // eslint-disable-next-line
      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionsCount += 1;

          if (rewardTransactionsCount > 1) {
            console.error('miner exceeds limit');
            return false;
          }
  
          // Reward transaction should always be first and only
          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error('miner reward amount is invalid');
            return false;
          }
        } else {
          if (!Transaction.isValid(transaction)) {
            console.error('invalid transaction')
            return false;
          }

          // IMPORTANT: Must be `this`.chain to check against.
          const trueBalance = Wallet.calculateBalance({ chain: this.chain });
          if (transaction.input.amount !== trueBalance) {
            console.error('invalid input amount');
            return false;
          }

          if (transactionSet.has(transaction)) {
            console.error('identical transaction appears multiple times in the block');
            return false;
          }

          transactionSet.add(transaction);
        }
      }
    }

    return true;
  }
}