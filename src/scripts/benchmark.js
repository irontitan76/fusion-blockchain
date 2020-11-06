const Blockchain = require('../blockchain/index.js');

const benchmarkHexHash = () => {
  const blockchain = new Blockchain();

  blockchain.addBlock({ data: 'initial' });
  console.log(blockchain.chain[blockchain.chain.length - 1]);

  let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

  const times = [];

  for (let i = 0; i < 10000; i++) {
    prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

    blockchain.addBlock({ data: `block${i}` });
    nextBlock = blockchain.chain[blockchain.chain.length - 1];

    nextTimestamp = nextBlock.timestamp;
    timeDiff = nextTimestamp - prevTimestamp;
    times.push(timeDiff);

    average = times.reduce((total, num) => total + num) / times.length;

    console.log(`Time to mine: ${timeDiff}ms. Difficulty ${nextBlock.difficulty}. Average time: ${average}ms.`)
  }
};

benchmarkHexHash();