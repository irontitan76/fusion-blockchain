import hexToBinary from 'hex-to-binary';
import Block from './block';
import { sha256 } from '../util';
import { GENESIS_DATA, MINE_RATE } from '../config';

describe('Block', () => {
  const data = ['blockchain', 'data'];
  const difficulty = 1;
  const hash = 'foo-hash';
  const lastHash = 'bar-hash';
  const nonce = 1;
  const timestamp = 2000;
  const block = new Block ({ data, difficulty, hash, lastHash, nonce, timestamp });

  it('has a data, hash, lastHash, and timestamp property', () => {
    expect(block.data).toEqual(data);
    expect(block.difficulty).toEqual(difficulty);
    expect(block.hash).toEqual(hash);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.nonce).toEqual(nonce);
    expect(block.timestamp).toEqual(timestamp);
  });

  describe('genesis()', () => {
    const genesisBlock = Block.genesis();

    it('returns a Block instance', () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it('returns the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe('mineBlock()', () => {
    const data = 'mined data';
    const lastBlock = Block.genesis();
    const minedBlock = Block.mineBlock({ data, lastBlock });

    it('returns a Block instance', () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it('sets the data', () => {
      expect(minedBlock.data).toEqual(data);
    });

    it('sets a SHA-256 hash based on the proper inputs', () => {
      expect(minedBlock.hash).toEqual(sha256(
        data,
        lastBlock.hash,
        minedBlock.difficulty,
        minedBlock.nonce,
        minedBlock.timestamp,
      ));
    });

    it('sets the `lastHash` to the `hash` of the last block', () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });

    it('sets a timestamp', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });
  
    it('sets a `hash` that matches the difficulty criteria', () => {
      expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
        .toEqual('0'.repeat(minedBlock.difficulty))
    });
  
    it('adjusts the difficulty', () => {
      const { difficulty } = lastBlock;
      const possibleResults = [difficulty + 1, difficulty - 1];

      expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
    });
  });

  describe('adjustDifficulty()', () => {
    it('raises the difficulty for a quickly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block,
        timestamp: block.timestamp + MINE_RATE - 100,
      })).toEqual(block.difficulty + 1);
    });


    it('lowers the difficulty for a slowly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block,
        timestamp: block.timestamp + MINE_RATE + 100,
      })).toEqual(block.difficulty - 1);
    });

    it('has a lower limit of 1', () => {
      block.difficulty = -1;
      expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
    });
  });
});