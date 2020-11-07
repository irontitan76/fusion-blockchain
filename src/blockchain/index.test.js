const Blockchain = require('.');
const Block = require('./Block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const { sha256 } = require('../util');

describe('Blockchain', () => {
  let blockchain;
  let errorMock;
  let logMock;
  let newChain;
  let originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();  
    errorMock = jest.fn();
    logMock = jest.fn();
    newChain = new Blockchain();

    originalChain = blockchain.chain;

    global.console.error = errorMock;
    global.console.log = logMock;
  });

  it('contains a `chain` array instance', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('starts with the genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('adds new block to the chain', () => {
    const newData = 'foobar';
    blockchain.addBlock({ data: newData });
    
    const addedBlock = blockchain.chain[blockchain.chain.length - 1];
    expect(addedBlock.data).toEqual(newData);
  });

  describe('isValidChain()', () => {
    describe('when the chain does not start with the genesis block', () => {
      it('returns false', () => {
        blockchain.chain[0] = { data: 'fake-genesis' };
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe('when the chain starts with the genesis blocks and has multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({ data: 'Bears' });
        blockchain.addBlock({ data: 'Beets' });
        blockchain.addBlock({ data: 'Battlestar Galatica' });
      });

      describe('and a lastHash reference has changed', () => {
        it('returns false', () => {
          blockchain.chain[2].lastHash = 'broken-lastHash';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with an invalid field', () => {
        it('returns false', () => {
          blockchain.chain[2].data = 'some-bad-and-evil-data';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with jumped difficulty', () => {
        it('returns false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1];
          const lastHash = lastBlock.hash;
          const timestamp = Date.now();
          const nonce = 0;
          const data = [];
          const difficulty = lastBlock.difficulty - 3;
          const hash = sha256(data, difficulty, lastHash, nonce, timestamp);
          const badBlock = new Block({
            data,
            difficulty,
            hash,
            lastHash,
            nonce,
            timestamp,
          });

          blockchain.chain.push(badBlock);
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain does not contain any invalid blocks', () => {
        it('returns true', () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

    // something's wrong with replaceChain and isValidChain order of tests
    describe('replaceChain()', () => {
      describe('when the new chain is NOT longer', () => {
        beforeEach(() => {
          newChain.chain[0] = { new: 'chain' };
          blockchain.replaceChain(newChain.chain);
        });
  
        it('does NOT replace the chain', () => {
          expect(blockchain.chain).toEqual(originalChain);
        });
  
        it('logs an error', () => {
          expect(errorMock).toHaveBeenCalled();
        });
      });
  
      describe('when the new chain is longer', () => {
        beforeEach(() => {
          newChain.addBlock({ data: 'Bears' });
          newChain.addBlock({ data: 'Beets' });
          newChain.addBlock({ data: 'Battlestar Galatica' });
        });
  
        describe('and the chain is invalid', () => {
          beforeEach(() => {
            newChain.chain[2].hash = 'some-fake-hash';
            blockchain.replaceChain(newChain.chain);
          });
  
          it('does NOT replace the chain', () => {
            expect(blockchain.chain).toEqual(originalChain);
          });
  
          it('logs an error', () => {
            expect(errorMock).toHaveBeenCalled();
          });
        });
  
        describe('and the new chain is valid', () => {
          beforeEach(() => {
            blockchain.replaceChain(newChain.chain);
          });
  
          it('does replace the chain', () => {
            console.log(blockchain.chain);
            console.log(newChain.chain);
            expect(blockchain.chain).toEqual(newChain.chain);
          });
  
          it('logs a message about chain replacement', () => {
            expect(logMock).toHaveBeenCalled();
          });
        })
      });

      describe('and the `validateTransactions` flag is true', () => {
        it('calls validateTransactionData()', () => {
          const validTransactionsDataMock = jest.fn();

          blockchain.validTransactionData = validTransactionsDataMock;
          newChain.addBlock({ data: 'foo' });
          blockchain.replaceChain(newChain.chain, true);

          expect(validTransactionsDataMock).toHaveBeenCalled();
        })
      })
    });

  describe('validTransactionData()', () => {
    let rewardTransaction;
    let transaction;
    let wallet;

    beforeEach(() => {
      wallet = new Wallet();
      rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
      transaction = wallet.createTransaction({
        amount: 20,
        recipient: 'foo-address',
      });
    });

    describe('and the transaction data is valid', () => {
      it('returns true', () => {
        newChain.addBlock({ data: [transaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
        expect(errorMock).not.toHaveBeenCalled();
      });
    });

    describe('and the transaction data has multiple rewards', () => {
      it('returns false', () => {
        newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('and the transaction data has at least one malformed `outputMap`', () => {
      describe('and the transaction is NOT a reward transaction', () => {
        it('returns false and logs error', () => {
          transaction.outputMap[wallet.publicKey] = 999999;
          newChain.addBlock({ data: [transaction, rewardTransaction ]});
          expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('and the transaction is a reward transaction', () => {
        it('returns false and logs error', () => {
          rewardTransaction.outputMap[wallet.publicKey] = 999999;
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });

    describe('and the transaction data has at least one malformed `input`', () => {
      it('returns false and logs error', () => {
        wallet.balance = 9000;

        const evilOutputMap = {
          [wallet.publicKey]: 8900,
          fooRecipient: 100,
        };

        const evilTransaction = {
          input: {
            address: wallet.publicKey,
            amount: wallet.balance,
            signature: wallet.sign(evilOutputMap),
            timestamp: Date.now(),
          },
          outputMap: evilOutputMap,
        };

        newChain.addBlock({ data: [evilTransaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();  
      });
    });

    describe('and a block contains multiple identical transactions', () => {
      it('returns false and logs error', () => {
        newChain.addBlock({ data: [transaction, transaction, transaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });
  });
});