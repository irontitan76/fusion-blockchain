import express from 'express';
const router = express.Router();
// import { blockchain, pubsub } from '../';

router.get('/', (req, res) => {
  const { blockchain } = req;
  return res.json(blockchain.chain);
});

router.post('/', (req, res) => {
  const { blockchain, pubsub } = req;
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();

  return res.redirect('/api/blocks');
});

export default router;