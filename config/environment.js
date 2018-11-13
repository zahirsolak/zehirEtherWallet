/* eslint-env node */
'use strict';
module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'zehirwallet',
    environment,
    rootURL: '/zehirwallet/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    ETH: {
      // Callisto Network Params
      url: "https://clo-testnet3.0xinfra.com"
    },
    donation: {
      CLO: "0x905545a953A47041028e771472E0420B44b2a4B0"
    },
    testFunction:function(){
      alert('testFunction');
    },
    privateKeyForTest:'2468d512f259637cea4c690aeb811cdd7a9af164af775ea03d8e2e21707491be',
    currentNetwork: null,
    currentNetworkKey: null,
    defaultNetworkKey: 'CLO_testnet',
    network: {
      CLO: {
        key: "CLO",
        name: "CLO",
        description: "Callisto Network Mainnet",
        symbol: "CLO",
        url: "https://clo-geth.0xinfra.com",
        chainId:820,
        gasLimit: 150000
      },
      CLO_testnet: {
        key: "CLO_testnet",
        name: "Testnet CLO",
        description: "Callisto Network Testnet",
        symbol: "Testnet CLO",
        url: "https://clo-testnet3.0xinfra.com",
        chainId:20729,
        gasLimit: 150000
      }
      // ,CLO_local: {
      //   key: "CLO_local",
      //   name: "Local CLO",
      //   description: "Callisto Network Local",
      //   symbol: "Local CLO",
      //   url: "http://10.0.2.2:7545"
      // }
    },
    coldStaking: {
      contractAddress: '0xd813419749b3c2cdc94a2f9cfcf154113264a9d6',
      contractAbi: [{
        "constant": true,
        "inputs": [],
        "name": "CS_frozen",
        "outputs": [{
          "name": "",
          "type": "bool"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [],
        "name": "TotalStakingWeight",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [],
        "name": "StakingRewardPool",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": false,
        "inputs": [],
        "name": "start_staking",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      }, {
        "constant": false,
        "inputs": [],
        "name": "DEBUG_donation",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      }, {
        "constant": false,
        "inputs": [],
        "name": "claim",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [],
        "name": "Treasury",
        "outputs": [{
          "name": "",
          "type": "address"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [],
        "name": "staking_threshold",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [],
        "name": "round_interval",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [{
          "name": "",
          "type": "address"
        }],
        "name": "staker",
        "outputs": [{
          "name": "amount",
          "type": "uint256"
        }, {
          "name": "time",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [],
        "name": "DateStartStaking",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": false,
        "inputs": [{
          "name": "_addr",
          "type": "address"
        }],
        "name": "report_abuse",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }, {
        "constant": false,
        "inputs": [],
        "name": "new_block",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [],
        "name": "TotalStakingAmount",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [],
        "name": "LastBlock",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": false,
        "inputs": [{
          "name": "_f",
          "type": "bool"
        }],
        "name": "freeze",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [{
          "name": "_addr",
          "type": "address"
        }],
        "name": "stake_reward",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": false,
        "inputs": [],
        "name": "withdraw_rewards",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }, {
        "constant": false,
        "inputs": [],
        "name": "withdraw_stake",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [],
        "name": "max_delay",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": true,
        "inputs": [],
        "name": "Timestamp",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }, {
        "constant": false,
        "inputs": [],
        "name": "clear_treasurer",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }, {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
      }, {
        "anonymous": false,
        "inputs": [{
          "indexed": false,
          "name": "addr",
          "type": "address"
        }, {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        }, {
          "indexed": false,
          "name": "amount",
          "type": "uint256"
        }, {
          "indexed": false,
          "name": "time",
          "type": "uint256"
        }],
        "name": "StartStaking",
        "type": "event"
      }, {
        "anonymous": false,
        "inputs": [{
          "indexed": false,
          "name": "staker",
          "type": "address"
        }, {
          "indexed": false,
          "name": "amount",
          "type": "uint256"
        }],
        "name": "WithdrawStake",
        "type": "event"
      }, {
        "anonymous": false,
        "inputs": [{
          "indexed": false,
          "name": "staker",
          "type": "address"
        }, {
          "indexed": false,
          "name": "reward",
          "type": "uint256"
        }],
        "name": "Claim",
        "type": "event"
      }, {
        "anonymous": false,
        "inputs": [{
          "indexed": false,
          "name": "_address",
          "type": "address"
        }, {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        }],
        "name": "DonationDeposited",
        "type": "event"
      }]
    }
  };

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
