const Block = require('./Block.js');
const { sha256 } = require('../util');

module.exports = class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
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

  replaceChain(chain, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer.');
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain is not valid.');
      return;
    }
    
    if (onSuccess) onSuccess();
    console.log('replacing chain with', chain);
    this.chain = chain;
  }
}