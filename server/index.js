import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import Blockchain from './blockchain';
import PubSub from './app/pubsub';
import TransactionMiner from './app/transaction-miner';
import TransactionPool from './wallet/transaction-pool';
import Wallet from './Wallet';

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();

const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({
  blockchain,
  pubsub,
  transactionPool,
  wallet,
});

const { GENERATE_PEER_PORT } = process.env;
const DEFAULT_PORT = 8080;
const RANDOM_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
const PEER_PORT = GENERATE_PEER_PORT === 'true' && RANDOM_PORT;
const PORT = PEER_PORT || DEFAULT_PORT;

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const ROOT_NODE_API = `${ROOT_NODE_ADDRESS}/api`;
const ROOT_NODE_API_BLOCKS = `${ROOT_NODE_API}/blocks`;
const ROOT_NODE_API_TRANSACTION_POOLS = `${ROOT_NODE_API}/transaction-pools`;
const ROOT_NODE_API_TRANSACTION_MAPS = `${ROOT_NODE_API_TRANSACTION_POOLS}/maps`;

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
  return res.json(blockchain.chain);
});

app.post('/api/blocks', (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  return res.redirect('/api/blocks');
});

app.get('/api/mine', (req, res) => {
  transactionMiner.mineTransactions();
  res.redirect('/api/blocks');
});

app.post('/api/transactions', (req, res) => {
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

// TODO: Must have :id
app.get('/api/transaction-pools/maps', (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.get('/api/wallet-info', (req, res) => {
  const address = wallet.publicKey;
  res.json({
    address,
    balance: Wallet.calculateBalance({ address, chain: blockchain.chain }),
  });
});

const syncChains = async () => {
  let res;

  try {
    res = await fetch(ROOT_NODE_API_BLOCKS);
  } catch (error) {
    return console.error(JSON.stringify(error));
  }

  if (res.status === 200) {
    const rootChain = await res.json();
    console.log('replace chain on a sync with', rootChain);
    blockchain.replaceChain(rootChain);
  }
};

const syncPoolMaps = async () => {
  let res;

  try {
    res = await fetch(ROOT_NODE_API_TRANSACTION_MAPS);
  } catch (error) {
    return console.error(JSON.stringify(error));
  }

  if (res.status === 200) {
    const rootTransactionPoolMap = await res.json();
    console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
    transactionPool.setMap(rootTransactionPoolMap);
  }
};

const syncWithRootState = async () => {
  await syncChains();
  await syncPoolMaps();
};

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
  
  if (PORT !== DEFAULT_PORT) syncWithRootState();
});