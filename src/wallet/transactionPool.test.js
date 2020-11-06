const TransactionPool = require('./transactionPool');
const Transaction = require('./transaction');
const Wallet = require('.');

describe('TransactionPool', () => {
  let senderWallet;
  let transaction;
  let transactionPool;

  beforeEach(() => {
    senderWallet = new Wallet();
    transaction = new Transaction({
      amount: 50,
      recipient: 'fake-recipient',
      senderWallet,
    });
    transactionPool = new TransactionPool();
  });

  describe('existingTransaction()', () => {
    it('returns an existing transaction given an input address', () => {
      transactionPool.setTransaction(transaction);

      expect(transactionPool
        .existingTransaction({ inputAddress: senderWallet.publicKey }))
        .toBe(transaction);
    });
  });
  
  describe('setTransaction()', () => {
    it('adds a transaction', () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });
});