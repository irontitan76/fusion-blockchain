const Transaction = require('./Transaction');
const Wallet = require('.');
const { verifySignature } = require('../util');
const { MINING_REWARD, REWARD_INPUT } = require('../config');

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

  describe('update()', () => {
    let nextAmount;
    let nextRecipient;
    let originalSenderOutput;
    let originalSignature;

    describe('and the amount is invalid', () => {
      it('throws an error', () => {
        expect(() => transaction.update({
          amount: 999999,
          recipient: 'foo',
          senderWallet,
        })).toThrow('Amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {
      beforeEach(() => {
        nextAmount = 50;
        nextRecipient = 'next-recipient';
        originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
        originalSignature = transaction.outputMap.signature;
  
        transaction.update({
          amount: nextAmount,
          recipient: nextRecipient,
          senderWallet,
        });
      });
  
      it('outputs the amount to the next recipient', () => {
        expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
      });
  
      it('subtracts the amount from the original sender output amount', () => {
        expect(transaction.outputMap[senderWallet.publicKey])
          .toEqual(originalSenderOutput - nextAmount);
      });
  
      it('maintains a total output value that matches the input amount', () => {
        const outputMapTotal = Object.values(transaction.outputMap)
          .reduce((total, outputAmount) => outputAmount + total);
  
        expect(outputMapTotal).toEqual(transaction.input.amount)
      });
  
      it('re-signs the transaction', () => {
        expect(transaction.input.signature).not.toEqual(originalSignature);
      });

      describe('and another update for the same recipient', () => {
        let addedAmount;

        beforeEach(() => {
          addedAmount = 80;
          transaction.update({
            amount: addedAmount,
            recipient: nextRecipient,
            senderWallet,
          });
        });

        it('adds to the recipient amount', () => {
          expect(transaction.outputMap[nextRecipient])
            .toEqual(nextAmount + addedAmount);
        });

        it('subtracts the amount from the original sender output amount', () => {
          expect(transaction.outputMap[senderWallet.publicKey])
            .toEqual(originalSenderOutput - nextAmount - addedAmount);
        });
      });
    });
  });
  
  describe('isValid()', () => {
    let errorMock;

    beforeEach(() => {
      errorMock = jest.fn();

      global.console.error = errorMock;
    });

    describe('when the transaction is valid', () => {
      it('returns true', () => {
        expect(Transaction.isValid(transaction)).toBe(true);
      });
    });

    describe('when the transaction is invalid', () => {
      describe('and a transaction outputMap is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.outputMap[senderWallet.publicKey] = 999999;
          expect(Transaction.isValid(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('and the transaction input signature is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.input.signature = new Wallet().sign('data');
          expect(Transaction.isValid(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });

  describe('rewardTransaction()', () => {
    let minerWallet;
    let rewardTransaction;

    beforeEach(() => {
      minerWallet = new Wallet();
      rewardTransaction = Transaction.rewardTransaction({ minerWallet });
    });

    it('creates a transaction with reward input', () => {
      expect(rewardTransaction.input).toEqual(REWARD_INPUT);
    });

    it('creates ones transactions for the miner with the `MINING_REWARD`', () => {
      expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD)
    })
  });
});