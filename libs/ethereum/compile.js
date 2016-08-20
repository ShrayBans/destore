'use strict';

// compiles Solidity (.sol) files
const fs = require('fs');
const solc = require('solc'); // https://github.com/ethereum/solc-js
const init = require('./init.js');

const contractsConfig = require('./../config/contracts.js');

// @ contracts - string or array - array of string contract names
// @ directoryPath - string - directory path to where contract is contained
//   optional. if not given will be taken from config
// returns compiled contracts object
module.exports = (contractFiles, isSolc, directoryPath) => {
  // to handle cases when there's no array of contract files, only contract file
  if (typeof contractFiles === 'string') {
    contractFiles = [contractFiles];
  }
  if (!directoryPath) directoryPath = contractsConfig.path;
  if (directoryPath[directoryPath.length - 1] !== '/') directoryPath += '/';

  const input = {};
  contractFiles.forEach(function(contract) {
    if (!contract.endsWith('.sol')) contract += '.sol';
    const contractPath = directoryPath + contract;
    console.log('contract path: ' + contractPath);
    input[contract] = fs.readFileSync(contractPath).toString();
  });

  const output = solc.compile({sources: input}, 1);

  if (output.errors) {
    throw new Error('Unable to compile Solidity contract: ' + JSON.stringify(output.errors));
  }

  // to have contract data in the proper format
  const contractsCompiled = {};
  for (let contractName in output.contracts) {
    const out = output.contracts[contractName];
    contractsCompiled[contractName] = {};

    // for ether-pudding
    contractsCompiled[contractName].unlinked_binary = out.bytecode;
    contractsCompiled[contractName].abi = JSON.parse(out.interface);

    // for web3
    contractsCompiled[contractName].code = out.bytecode;
    contractsCompiled[contractName].runtimeBytecode = out.runtimeBytecode;
    contractsCompiled[contractName].info = {};
    contractsCompiled[contractName].info.abiDefinition = JSON.parse(out.interface);
  }
  return contractsCompiled;
};