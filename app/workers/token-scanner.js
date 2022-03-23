const web3js = require('web3');
const ERC20 = require('../services/erc20');
const erc20Abi = require('../config/erc20-abi.json');
const nodeList = require('../config/node-list.json');
const tokenRepository = require('../repositories/token');

const wsOption = {
  timeout: 10000,
  clientConfig: {
    keepalive: true,
    keepaliveInterval: 3000
  },
  reconnect: {
    auto: true,
    delay: 2000,
    maxAttempts: 5,
    onTimeout: true
  },
  reconnectDelay: 1
};

const getProvider = (rpc, type) => {
  try {
    if (type == 'ipc' && !rpc.endsWith('.ipc')) {
      throw new Error(`ipc provider is not valid`);
    }

    let prov;

    if ((rpc.startsWith('ws') || rpc.startsWith('http')) && type != 'ipc') {
      prov = rpc;
      if (rpc.startsWith('ws')) {
        prov = new web3js.providers.WebsocketProvider(rpc, wsOption);
      }
    }
    if (rpc.endsWith('.ipc') && type == 'ipc') {
      const net = require('net');
      prov = new web3js.providers.IpcProvider(rpc, net);
    }

    return prov;
  } catch (err) {
    return err;
  }
}

const getTransactionReceipt = async(web3, txhash) => {
  try {
    let receipt;
    while(!receipt || receipt == null) {
      receipt = await web3.eth.getTransactionReceipt(txhash);
    }

    return Promise.resolve(receipt);
  } catch (err) {
    return Promise.reject(err);
  }
}

const run = async() => {
  try {
    nodeList.map(async (node) => {
      const provider = getProvider(node.url, 'ws');
      const web3 = new web3js(provider);

      subscription = web3.eth.subscribe('pendingTransactions', function (error) {
        if (error) {
          console.error(`error node ${node.short}: ${error.message}`);
        }
      });

      subscription.on('data', async function(txhash) {
        const tx = await web3.eth.getTransaction(txhash);
        if (tx && (!tx.to || tx.to == null)) {
          try {
            const receipt = await getTransactionReceipt(web3, txhash);
            if (receipt && receipt.contractAddress) {
              const erc20Contract = new web3.eth.Contract(erc20Abi, receipt.contractAddress);
              const erc20 = new ERC20(erc20Contract);
              try {
                const decimals = await erc20.getDecimals();
                const name = await erc20.getName();
                const symbol = await erc20.getSymbol();
                let owner = await erc20.getOwner();
                owner = !owner ? tx.from : owner;

                await tokenRepository.save({
                  address: receipt.contractAddress,
                  name,
                  symbol,
                  decimals,
                  owner,
                  network_name: node.name,
                  network_short: node.short,
                  explore_token: `${node.explorer}/token/${receipt.contractAddress}`,
                  explore_owner: `${node.explorer}/address/${owner}`,
                  created_at: Date.now()
                });

                console.log(`new contract creation detected on ${node.short}! address ${receipt.contractAddress}`);
              } catch (err) {
              }
            }
          } catch (errReceipt) {
          }
        }
      });
    });
  } catch (err) {
    return Promise.reject(err);
  }
}

module.exports = {
  Run: run
};
