'use strict';
/*
IMPORTANT: testrpc must be running during these tests,
at least for now. 8/25/2016 4:48pm
*/

const test = require('blue-tape');
const tapSpec = require('tap-spec');
const Ethereum = require('../libs/ethereum/ethereum.js');

const lol = console.log.bind(console);

const helper = {
  fromBytes: (byteArray) => {
    const hashes = [];
    const web3 = Ethereum.init();
    for (var i = 0; i < byteArray.length; i += 2) {
      let hashAddress = (web3.toAscii(byteArray[i]) + web3.toAscii(byteArray[i + 1]));
      hashAddress = hashAddress.split('').filter(char => {
        return char.match(/[A-Za-z0-9]/);
      }).join('');
      hashes.push(hashAddress);
    }
    return hashes;
  },
  split: (inputHash) => {
    const half1 = inputHash.substring(0,23);
    const half2 = inputHash.substring(23,46);
    return [half1, half2];
  }
};


test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

const hashObjs = {
  hash1: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
  hash2: 'QmcSwTAwqbtGTt1MBobEjKb8rPwJJzfCLorLMs5m97axDW',
  hash3: 'QmRtDCqYUyJGWhGRhk1Bbk4PvE9mbCS1HKkDAo6xUAqN4H',
  hash4: 'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH',
};

test('web3 isConnected test true/false', t => {
  t.plan(1);

  const status = Ethereum.check();
  // console.log('ethereum.check() : ', status);
  t.equal(status, true, 'successful connection should return true');
  t.end();
});

test('web3.eth.accounts should return an array', t => {
  t.plan(1);

  const acctArr = Ethereum.accounts;
  const typeOfAcctArr = Array.isArray(acctArr);

  t.equal(typeOfAcctArr, true, 'Ethereum.accounts should return an array');
});

// var rand = myArray[Math.floor(Math.random() * myArray.length)];

test('Deploying', t => {
  Ethereum.init();

  let ins;

  const deployOptions = {
    from: Ethereum.account,
    value: 10
  };

  Ethereum.deploy('Sender', [helper.split(hashObjs.hash1), 10,] , deployOptions)
  .then(instance => {
    ins = instance;
    t.equal(instance.address.length, 42 , 'Contract address should be a length of 42');
    t.end();
  })
  .catch(err => {
    t.end(err);
  });
});

test('Deploying DeStore Contract', t => {
  Ethereum.init();

  let destoreInstance;
  const deployOptions = {
    from: Ethereum.account,
    value: 10
  };

  Ethereum.deploy('DeStore', [helper.split(hashObjs.hash1), 10], deployOptions)
    .then(instance => {
      destoreInstance = instance;
      t.equal(instance.address.length, 42, 'Contract address should have a length of 42');
      t.end();
    })
    .catch(err => {
      t.end(err);
    });
});

test('Add receivers to DeStore Contract', t => {
  Ethereum.init();

  let destoreInstance;
  const deployOptions = {
    from: Ethereum.account,
    value: 10
  };

  return Ethereum.deploy('DeStore', [helper.split(hashObjs.hash1), 10], deployOptions)
    .then(instance => {
      destoreInstance = instance;
      instance.addReceiver(500)
      .then(tx => {
      return destoreInstance.checkReceiverStorage();
    })
    .then(tx => {
      t.equal(tx.c[0], 500, 'checkReceiverStorage should return the available storage parameter passed to addReceiver');
    })
    .catch(err => {
      console.error(err);
    });
  });
});
