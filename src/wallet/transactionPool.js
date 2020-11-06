module.exports = class TransactionPool {
  constructor() {
    this.transactionMap = {};
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
}