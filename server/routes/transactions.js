import express from 'express';
// import { blockchain, pubsub, transactionMiner, transactionPool, wallet } from '../';
const router = express.Router();

router.post('/', (req, res) => {
  const { blockchain, pubsub, transactionPool, wallet } = req;
  const { amount, recipient } = req.body;

  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });

  try {
    if (transaction) {
      transaction.update({ amount, recipient, senderWallet: wallet });
    } else {
      transaction = wallet.createTransaction({
        amount,
        chain: blockchain.chain,
        recipient,
      });  
    }
  } catch (error) {
    return res.status(400).json({ message: error.message, type: 'error' });
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);

  return res.json({ transaction, type: 'success' });
});

router.get('/mine', (req, res) => {
  const { transactionMiner } = req;
  transactionMiner.mineTransactions();
  res.redirect('/api/blocks');
});

export default router;