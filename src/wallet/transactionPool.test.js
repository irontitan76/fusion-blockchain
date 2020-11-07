const Blockchain = require('../blockchain');
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

  describe('clear()', () => {
    it('clears the transactions', () => {
      transactionPool.clear();
      expect(transactionPool.transactionsMap).toEqual({});
    });
  });

  describe('clearBlockchainTransactions()', () => {
    it('clears the pool of any existing transactions', () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap = {};

      for (let i = 0; i < 6; i++) {
        const transaction = new Wallet().createTransaction({
          amount: 20,
          recipient: 'foo',
        });

        transactionPool.setTransaction(transaction);

        if (i % 2 === 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedTransactionMap[transaction.id] = transaction;
        }
      }

      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });
      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
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

  describe('validTransactions()', () => {
    let errorMock;
    let validTransactions;

    beforeEach(() => {
      errorMock = jest.fn();
      validTransactions = [];

      global.console.error = errorMock;

      for (let i = 0; i < 10; i++) {
        transaction = new Transaction({
          amount: 30,
          recipient: 'any-recipient',
          senderWallet,
        });

        if (i % 3 === 0) {
          transaction.input.amount = 999999;
        } else if (i % 3 === 1) {
          transaction.input.signature = new Wallet().sign('foo');
        } else {
          validTransactions.push(transaction);
        }

        transactionPool.setTransaction(transaction);
      }
    });

    it('return valid transactions', () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });

    it('logs errors for invalid transactions', () => {
      transactionPool.validTransactions();
      expect(errorMock).toHaveBeenCalled();
    });
  });
});