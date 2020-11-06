const Transaction = require('./Transaction');
const Wallet = require('.');

describe('Transaction', () => {
  let amount;
  let recipient;
  let senderWallet;
  let transaction;

  beforeEach(() => {
    amount = 50
    recipient = 'recipient-public-key';
    senderWallet = new Wallet();
    transaction = new Transaction({ amount, recipient, senderWallet });
  });

  it('has an `id`', () => {
    expect(transaction).toHaveProperty('id');
  });

  describe('outputMap', () => {
    it('has an outputMap', () => {
      expect(transaction).toHaveProperty('outputMap');
    });

    it('outputs the amount to recipient', () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });

    it('outputs the remaining balance for `senderWallet`', () => {
      expect(transaction.outputMap[senderWallet.publicKey])
        .toEqual(senderWallet.balance - amount);
    });
  });
});