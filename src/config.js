const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;
const MINING_REWARD = 50;
const REWARD_INPUT = { address: '*authorized-reward*' };
const STARTING_BALANCE = 1000;

const GENESIS_DATA = {
  data: [],
  difficulty: INITIAL_DIFFICULTY,
  hash: 'genesis',
  lastHash: '----',
  nonce: 0,
  timestamp: 1,
};

module.exports = {
  GENESIS_DATA,
  MINE_RATE,
  MINING_REWARD,
  REWARD_INPUT,
  STARTING_BALANCE,
};