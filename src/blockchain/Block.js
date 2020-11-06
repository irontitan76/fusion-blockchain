const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../config.js');
const { sha256 } = require('../util/crypto.js');

module.exports = class Block {
  constructor({ data, difficulty, hash, lastHash, nonce, timestamp }) {
    this.data = data;
    this.difficulty = difficulty;
    this.hash = hash;
    this.lastHash = lastHash;
    this.nonce = nonce;
    this.timestamp = timestamp;
  }

  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;
    const delta = timestamp - originalBlock.timestamp;

    if (difficulty < 1) return 1;
    if (delta > MINE_RATE) return difficulty - 1;
    return difficulty + 1;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }

  static mineBlock({ data, lastBlock }) {
    const lastHash = lastBlock.hash;
    let hash, timestamp;
    let { difficulty } = lastBlock;
    let nonce = 0;

    do {
      nonce++;
      difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
      hash = sha256(data, difficulty, lastHash, nonce, timestamp );
      timestamp = Date.now();
    } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this({ data, difficulty, hash, lastHash, nonce, timestamp });
  }
};

