const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;
const STARTING_BALANCE = 1000;

const GENESIS_DATA = {
  data: [],
  difficulty: INITIAL_DIFFICULTY,
  hash: 'genesis',
  lastHash: '----',
  nonce: 0,
  timestamp: 1,
};

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE };