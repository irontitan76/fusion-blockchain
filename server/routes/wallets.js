import express from 'express';
// import { blockchain } from '../';
const router = express.Router();

router.get('/api/wallet', (req, res) => {
  const { blockchain } = req;
  const address = req.wallet.publicKey;

  res.json({
    address,
    balance: Wallet.calculateBalance({ address, chain: blockchain.chain }),
  });
});

export default router;