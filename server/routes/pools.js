import express from 'express';
// import { transactionPool } from '../';
const router = express.Router();

// TODO: Must have :id
router.get('/transaction-maps', (req, res) => {
  const { transactionPool } = req;
  res.json(transactionPool.transactionMap);
});

export default router;