const Transaction = require('../wallet/transaction');

module.exports = class TransactionMiner {
  constructor({ blockchain, pubsub, transactionPool, wallet }) {
    this.blockchain = blockchain;
    this.pubsub = pubsub;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
  }
  
  /*    
    Get the valid transactions from transaction pool
    Generate the miner's rewards
    Add a block consisting of these blockchain transactions
    Broadcast the updated blockchain
    Clear the pool
  */
  mineTransactions() {
    const validTransactions = this.transactionPool.validTransactions();
    const rewardTransaction = Transaction.rewardTransaction({
      minerWallet: this.wallet,
    });

    validTransactions.push(rewardTransaction);

    this.blockchain.addBlock({ data: validTransactions });
    this.pubsub.broadcastChain();
    this.transactionPool.clear();
  }
}