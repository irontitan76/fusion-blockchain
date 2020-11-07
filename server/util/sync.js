import fetch from 'node-fetch';

export const syncChains = async (url, blockchain) => {
  let res;

  try {
    res = await fetch(url);
  } catch (error) {
    return console.error(JSON.stringify(error));
  }

  if (res.status === 200) {
    const rootChain = await res.json();
    console.log('replace chain on a sync with', rootChain);
    blockchain.replaceChain(rootChain);
  }
};

export const syncPoolMaps = async (url, transactionPool) => {
  let res;

  try {
    res = await fetch(url);
  } catch (error) {
    return console.error(JSON.stringify(error));
  }

  if (res.status === 200) {
    const rootTransactionPoolMap = await res.json();
    console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
    transactionPool.setMap(rootTransactionPoolMap);
  }
};