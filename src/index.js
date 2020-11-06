const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/PubSub');
const TransactionPool = require('./wallet/TransactionPool');
const Wallet = require('./Wallet');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();

const pubsub = new PubSub({ blockchain, transactionPool });

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

app.post('/api/transactions', (req, res) => {
  const { amount, recipient } = req.body;

  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });

  try {
    if (transaction) {
      transaction.update({ amount, recipient, senderWallet: wallet });
    } else {
      transaction = wallet.createTransaction({ amount, recipient });
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