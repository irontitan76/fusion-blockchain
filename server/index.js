import express from 'express';
import bodyParser from 'body-parser';
import { blocks, pools, transactions, wallets } from './routes';
import { syncChains, syncPoolMaps } from './util/sync';

import Blockchain from './blockchain';
import PubSub from './app/pubsub';
import TransactionMiner from './app/transaction-miner';
import TransactionPool from './wallet/transaction-pool';
import Wallet from './Wallet';

export const blockchain = new Blockchain();
export const transactionPool = new TransactionPool();
export const wallet = new Wallet();
export const pubsub = new PubSub({ blockchain, transactionPool });
export const transactionMiner = new TransactionMiner({
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
const ROOT_NODE_BLOCKS_ADDRESS = `${ROOT_NODE_ADDRESS}/api/blocks`;
const ROOT_NODE_MAPS_ADDRESS = `${ROOT_NODE_ADDRESS}/api/pools/transaction-maps`;

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.blockchain = blockchain;
  req.pubsub = pubsub;
  req.transactionMiner = transactionMiner;
  req.transactionPool = transactionPool;
  req.wallet = wallet;

  next();
});

app.use('/api/blocks', blocks);
app.use('/api/pools', pools);
app.use('/api/transactions', transactions);
app.use('/api/wallets', wallets);

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
  
  if (PORT !== DEFAULT_PORT) {
    syncChains(ROOT_NODE_BLOCKS_ADDRESS, blockchain);
    syncPoolMaps(ROOT_NODE_MAPS_ADDRESS, transactionPool);
  };
});