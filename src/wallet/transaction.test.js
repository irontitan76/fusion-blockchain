const Transaction = require('./Transaction');
const Wallet = require('.');
const { verifySignature } = require('../util');

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

  describe('input', () => {
    it('has an `input`', () => {
      expect(transaction).toHaveProperty('input');
    });

    it('has a `timestamp` in the input', () => {
      expect(transaction.input).toHaveProperty('timestamp');
    });

    it('sets the `amount` to the `senderWallet` balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });

    it('sets the `address` to the `senderWallet` publicKey', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it('signs the input', () => {
      const isVerified = verifySignature({
        data: transaction.outputMap,
        publicKey: senderWallet.publicKey,
        signature: transaction.input.signature,
      });

      expect(isVerified).toBe(true);
    });
  });
});