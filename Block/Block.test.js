import Block from './Block';
import { sha256 } from '../helpers/crypto';
import { GENESIS_DATA } from '../helpers/config';

describe('Block', () => {
  const data = ['blockchain', 'data'];
  const hash = 'foo-hash';
  const lastHash = 'bar-hash';
  const timestamp = 'a-date';
  const block = new Block ({ data, hash, lastHash, timestamp });

  it('has a data, hash, lastHash, and timestamp property', () => {
    expect(block.data).toEqual(data);
    expect(block.hash).toEqual(hash);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.timestamp).toEqual(timestamp);
  });

  describe('genesis()', () => {
    const genesisBlock = Block.genesis();

    console.log('genesisBlock', genesisBlock);

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

    console.log('lastBlock', lastBlock);
    console.log('minedBlock', minedBlock);

    it('returns a Block instance', () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it('sets the data', () => {
      expect(minedBlock.data).toEqual(data);
    });

    it('sets a SHA-256 hash based on the proper inputs', () => {
      expect(minedBlock.hash)
        .toEqual(sha256(minedBlock.timestamp, lastBlock.hash, data));
    });

    it('sets the `lastHash` to the `hash` of the last block', () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });

    it ('sets a timestamp', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });
  });
});