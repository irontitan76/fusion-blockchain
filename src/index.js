const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/PubSub');

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

const { GENERATE_PEER_PORT } = process.env;
const DEFAULT_PORT = 8080;
const RANDOM_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
const PEER_PORT = GENERATE_PEER_PORT === 'true' && RANDOM_PORT;
const PORT = PEER_PORT || DEFAULT_PORT;

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const ROOT_NODE_ADDRESS_BLOCKS = `${ROOT_NODE_ADDRESS}/api/blocks`;

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect('/api/blocks');
});

const syncChains = async () => {

  try {
    const res = await fetch(ROOT_NODE_ADDRESS_BLOCKS);

    if (res.status === 200) {
      const rootChain = await res.json();

      console.log('replace chain on a sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
  
  if (PORT !== DEFAULT_PORT) syncChains();
});