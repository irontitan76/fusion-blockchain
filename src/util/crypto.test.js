import { sha256 } from './crypto';

describe('cryptoHash()', () => {
  const result = '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae';

  it('generates a SHA-256 hashed output', () => {
    expect(sha256('foo')).toEqual(result);
  });

  it('produces the same hash with same input order arguments in any order', () => {
    expect(sha256('one', 'two', 'three')).toEqual(sha256('three', 'one', 'two'));
  });
});