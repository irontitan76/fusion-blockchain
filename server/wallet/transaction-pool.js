import Transaction from './transaction';

export default class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  clear() {
    this.transactionMap = {};
  }

  clearBlockchainTransactions({ chain }) {
    // Skip Genesis Block
    for (let i = 1; i < chain.length; i += 1) {
      const block = chain[i];

      // eslint-disable-next-line
      for (const transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }

  existingTransaction({ inputAddress }) {
   const transactions = Object.values(this.transactionMap);
   return transactions.find((t) => t.input.address === inputAddress);
  }
  
  setMap(transactionMap) {
    this.transactionMap = transactionMap;
  }

  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  validTransactions() {
    const transactions = Object.values(this.transactionMap);
    return transactions.filter((t) => Transaction.isValid(t));
  }
}