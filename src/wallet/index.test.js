const Blockchain = require('../blockchain');
const Wallet = require('.');
const Transaction = require('./transaction');
const { STARTING_BALANCE } = require('../config');
const { verifySignature } = require('../util');

describe('Wallet', () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('has a `balance`', () => {
    expect(wallet).toHaveProperty('balance');
  });

  it('has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey');
  });

  describe('createTransaction()', () => {
    describe('and the amount exceeds the balance', () => {
      it('throws an error', () => {
        expect(() => wallet.createTransaction({
          amount: 999999,
          recipient: 'foo-recipient',
        })).toThrow('Amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {
      let amount;
      let recipient;
      let transaction;

      beforeEach(() => {
        amount = 50;
        recipient = 'foo-recipient';
        transaction = wallet.createTransaction({ amount, recipient });
      })
      
      it('creates an instance of `Transaction`', () => {
        expect(transaction instanceof Transaction).toBe(true);
      });

      it('matches the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it('outputs the amount to the recipient', () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });

    describe('and a chain is passed', () => {
      it('calls `Wallet.calculateBalance`', () => {
        const calculateBalanceMock = jest.fn();
        const originalCalculateBalance = Wallet.calculateBalance;
        Wallet.calculateBalance = calculateBalanceMock;

        wallet.createTransaction({
          amount: 10,
          chain: new Blockchain().chain,
          recipient: 'foo',
        });

        expect(calculateBalanceMock).toHaveBeenCalled();

        Wallet.calculateBalance = originalCalculateBalance;
      });
    });
  });

  describe('calculateBalance()', () => {
    let blockchain;

    beforeEach(() => {
      blockchain = new Blockchain();
    });

    describe('and there are no outputs for the wallet', () => {
      it('returns the `STARTING_BALANCE`', () => {
        const actualBalance = Wallet.calculateBalance({
          address: wallet.publicKey,
          chain: blockchain.chain,
        });

        expect(actualBalance).toEqual(STARTING_BALANCE);
      });
    });

    describe('and there are outputs for the wallet', () => {
      let transactionOne;
      let transactionTwo;

      beforeEach(() => {
        transactionOne = new Wallet().createTransaction({
          amount: 50,
          recipient: wallet.publicKey,
        });

        transactionTwo = new Wallet().createTransaction({
          amount: 75,
          recipient: wallet.publicKey,
        });

        blockchain.addBlock({ data: [transactionOne, transactionTwo] });
      });

      it('adds the sum of all outputs to wallet balance', () => {
        const actualBalance = Wallet.calculateBalance({
          address: wallet.publicKey,
          chain: blockchain.chain,
        });

        expect(actualBalance).toEqual(
          STARTING_BALANCE +
          transactionOne.outputMap[wallet.publicKey] +
          transactionTwo.outputMap[wallet.publicKey]
        );
      });
    
      describe('and the wallet has made a transaction', () => {
        let recentTransaction;

        beforeEach(() => {
          recentTransaction = wallet.createTransaction({
            amount: 40,
            recipient: 'foo-address',
          });

          blockchain.addBlock({ data: [recentTransaction] });
        });

        it('returns the output amount of the recent transaction', () => {
          expect(Wallet.calculateBalance({
            address: wallet.publicKey,
            chain: blockchain.chain,
          })).toEqual(recentTransaction.outputMap[wallet.publicKey]);
        });

        describe('and there are outputs next to and after the recent transaction', () => {
          let sameBlockTransaction;
          let nextBlockTransaction;

          beforeEach(() => {
            recentTransaction = Wallet.createTransaction({
              amount: 60,
              recipient: 'bar-address',
            });

            sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
            blockchain.addBlock({
              data: [recentTransaction, sameBlockTransaction],
            });

            nextBlockTransaction = Wallet.createTransaction({
              amount: 70,
              recipient: wallet.publicKey,
            });

            blockchain.addBlock({ data: [nextBlockTransaction] });

            it('includes the output amounts in the returned balance', () => {
              const actualBalance = Wallet.calculateBalance({
                address: wallet.publicKey,
                chain: blockchain.chain,
              });

              expect(actualBalance).toEqual(
                nextBlockTransaction.outputMap[wallet.publicKey] +
                recentTransaction.outputMap[wallet.publicKey] +
                sameBlockTransaction.outputMap[wallet.publicKey]
              );
            });
          });
        });
      });
    });
  });

  describe('signing data', () => {
    const data = 'foobar';

    it('verifies a signature', () => {
      const isVerified = verifySignature({
        data,
        publicKey: wallet.publicKey,
        signature: wallet.sign(data),
      });

      expect(isVerified).toBe(true);

    });

    it('does not verify an invalid signature', () => {
      const isVerified = verifySignature({
        data,
        publicKey: wallet.publicKey,
        signature: new Wallet().sign(data),
      });

      expect(isVerified).toBe(false);
    });
  });
});