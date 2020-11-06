const { sha256 } = require('.');

describe('cryptoHash()', () => {
  const result = 'b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b';

  it('generates a SHA-256 hashed output', () => {
    expect(sha256('foo')).toEqual(result);
  });

  it('produces the same hash with same input order arguments in any order', () => {
    expect(sha256('one', 'two', 'three')).toEqual(sha256('three', 'one', 'two'));
  });

  it('produces a unique hash when the input properties have changed', () => {
    const foo = {};
    const originalHash = sha256(foo);

    foo['a'] = 'a';

    expect(sha256(foo)).not.toEqual(originalHash);
  });
});