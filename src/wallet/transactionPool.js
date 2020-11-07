const Transaction = require('./transaction');
module.exports = class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  clear() {
    this.transactionMap = {};
  }

  clearBlockchainTransactions({ chain }) {
    // Skip Genesis Block
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];

      for (let transaction of block.data) {
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