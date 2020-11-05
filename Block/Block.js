import { GENESIS_DATA } from '../helpers/config';
import { sha256 } from '../helpers/crypto';

export default class Block {
  constructor({ data, hash, lastHash, timestamp }) {
    this.data = data;
    this.hash = hash;
    this.lastHash = lastHash;
    this.timestamp = timestamp;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }

  static mineBlock({ data, lastBlock }) {
    const timestamp = Date.now();
    const lastHash = lastBlock.hash;
    const hash = sha256(data, lastHash, timestamp);
    return new this({ data, hash, lastHash, timestamp });
  }
};

