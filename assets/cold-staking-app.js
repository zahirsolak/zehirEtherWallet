"use strict";



define('cold-staking-app/app', ['exports', 'cold-staking-app/resolver', 'ember-load-initializers', 'cold-staking-app/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
define('cold-staking-app/components/cs-simulator', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  // SafeMath Methods

  var _require = function _require(condition, message) {
    if (!message) message = "invalid condition";
    if (!condition) throw message;
    return condition;
  };
  var Staker = function Staker(amount, time) {
    this.amount = amount;
    this.time = time;
    return this;
  };

  exports.default = Ember.Component.extend({
    mul: function mul(a, b) {
      if (a == 0) {
        return 0;
      }
      var c = a * b;
      _require(c / a == b);
      return c;
    },
    div: function div(a, b) {
      // assert(b > 0); // Solidity automatically throws when dividing by 0
      var c = a / b;
      // assert(a == b * c + a % b); // There is no case in which this doesn't hold
      return c;
    },
    sub: function sub(a, b) {
      _require(b <= a);
      return a - b;
    },
    add: function add(a, b) {
      var c = a + b;
      _require(c >= a);
      return c;
    },

    blockNumber: 1000000,
    LastBlock: Ember.observer('blockNumber', function () {
      return this.get('blockNumber');
    }),
    Timestamp: null,
    TotalStakingWeight: null, //total weight = sum (each_staking_amount * each_staking_time).
    TotalStakingAmount: null, //currently frozen amount for Staking.
    StakingRewardPool: null, //available amount for paying rewards.
    CS_frozen: false, //Cold Staking frozen.
    staking_threshold: 0,
    // Treasury:0x3c06f218ce6dd8e2c535a8925a2edf81674984d9,
    // round_interval   : 27, //27 days
    // max_delay= 365 * 2, //2 years
    // DateStartStaking : 1541980800,// 12.11.2018 0:0:0 UTC.

    /*========== TESTING VALUES ===========*/
    Treasury: 0x627306090abaB3A6e1400e9345bC60c78a8BEf57,
    round_interval: 1, // 1 hours.
    max_delay: 7, // 7 days.
    DateStartStaking: 1540135800, // 10/21/2018 @ 3:30pm (UTC)
    /*========== end testing values ===================*/
    staker: {},

    // additional parameters
    contractBalance: 0,

    // methods
    freeze: function freeze(_f) {
      this.only_treasurer();
      this.set('CS_frozen', _f);
    },
    withdraw_rewards: function withdraw_rewards() {
      this.only_treasurer();
      if (this.get('CS_frozen')) {
        this.set('StakingRewardPool', this.sub(this.get('contractBalance'), this.get('TotalStakingAmount')));
        //Treasury.transfer(StakingRewardPool);
        alert('Transferred StakingRewardPool(' + this.get('StakingRewardPool') + ') to Treasury.');
      }
    },


    // modifiers
    only_staker: function only_staker() {
      _require(this.getStaker(this.get('msg.sender'), "only_staker").amount > 0);
    },
    staking_available: function staking_available() {
      _require(this.get('now') >= this.get('DateStartStaking', "staking_available") && !this.get('CS_frozen'));
    },
    only_treasurer: function only_treasurer() {
      _require(this.get('msg.sender') == this.get('Treasury'), "only_treasurer");
    },


    // helper methods
    getStaker: function getStaker(address) {
      var key = 'staker.' + address;
      var staker = this.get(key);
      if (!staker) {
        this.set(key, new Staker(0, 0));
      }
      return this.get(key);
    }
  });
});
define('cold-staking-app/components/get-resource', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    resourceService: Ember.inject.service('resource'),
    key: null,
    languageChanged: Ember.observer('resourceService.language', function () {
      this.loadResource();
    }),
    resourceValue: null,
    loadResource: function loadResource() {
      this.set("resourceValue", this.get('resourceService').getResource(this.get('key')));
    },

    didRender: function () {
      this.loadResource();
    }.on('didRender')
  });
});
define('cold-staking-app/components/nav-bar', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
define('cold-staking-app/components/select-wallet', ['exports', 'ethers', 'moment'], function (exports, _ethers, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    resource: Ember.inject.service(),
    selectedWallet: null,
    privateKey: '',
    amount: 0,
    contractAddress: '0xd813419749b3c2cdc94a2f9cfcf154113264a9d6',
    targetWalletAdress: '',
    logs: [],
    withdrawIsDisabled: Ember.computed('currentRewards', function () {
      return parseFloat(this.get('currentRewards')) == 0;
    }),
    sendToCsContractIsDisabled: Ember.computed('balance', 'amount', function () {
      return !this.get('amount') || !this.get('balance') || parseFloat(this.get('balance')) < 0 || parseFloat(this.get('amount')) < 1 || parseFloat(this.get('balance')) < parseFloat(this.get('amount'));
    }),
    sendToWalletIsDisabled: Ember.computed('balance', 'amountToSend', 'targetWalletAdress', function () {
      return !this.get('amountToSend') || !this.get('balance') || parseFloat(this.get('balance')) < 0 || parseFloat(this.get('amountToSend')) < 1 || parseFloat(this.get('balance')) < parseFloat(this.get('amountToSend')) || !this.get('targetWalletAdress');
    }),
    allCoins: Ember.computed('currentRewards', 'stakeAmount', function () {
      var currentRewards = this.get('currentRewards'),
          stakeAmount = this.get('stakeAmount');
      var allCoins = (currentRewards ? parseFloat(currentRewards) : 0) + (stakeAmount ? parseFloat(stakeAmount) : 0);
      return allCoins.toFixed(2);
    }),
    currentRewardsFormatted: Ember.computed('currentRewards', 'stakeAmount', function () {
      return (this.get('currentRewards') ? parseFloat(this.get('currentRewards')) : 0).toFixed(2);
    }),
    addInfo: function addInfo(message) {
      this.get('logs').insertAt(0, {
        message: message,
        class: 'info'
      });
    },
    addSuccess: function addSuccess(message) {
      this.get('logs').insertAt(0, {
        message: message,
        class: 'success'
      });
    },
    addError: function addError(message) {
      this.get('logs').insertAt(0, {
        message: message,
        class: 'danger'
      });
    },

    actions: {
      sendToCsContract: function sendToCsContract() {
        var _this = this;

        if (this.get('sendToCsContractIsDisabled')) return;
        var privateKey = this.get('privateKey');
        var contractAddress = this.get('contractAddress');
        var provider = this.get('provider');
        var wallet = new _ethers.default.Wallet(privateKey, provider);
        var amountTmp = this.get("amount");
        var amount = _ethers.default.utils.parseEther(amountTmp);

        var confirmMessage = this.get('resource').getResource('cs.sendToCsContract_confirmMessage');

        if (!confirm(confirmMessage.replace('|amount|', amountTmp))) return;
        var overrides = this.get('overrides');
        new Ember.RSVP.hash({
          "nonce": wallet.getTransactionCount("latest")
        }).then(function (result) {
          var tx = {
            nonce: result.nonce,
            to: contractAddress,
            value: amount,

            chainId: overrides.chainId,
            gasPrice: overrides.gasPrice,
            gasLimit: overrides.gasLimit
          };
          wallet.sign(tx).then(function (signedTransaction) {
            return provider.sendTransaction(signedTransaction).then(function (t) {
              _this.addSuccess('Sent To Contract. TX ID: ' + t.hash);
              _this.set('amount', 0);
            });
          }).catch(function (err) {
            return _this.addError(err);
          });
        }).catch(function (err) {
          return _this.addError(err);
        });
      },
      sendToWallet: function sendToWallet() {
        var _this2 = this;

        if (this.get('sendToWalletIsDisabled')) return;
        var privateKey = this.get('privateKey');
        var targetWalletAdress = this.get('targetWalletAdress');
        var provider = this.get('provider');
        var wallet = new _ethers.default.Wallet(privateKey, provider);
        var amountTmp = this.get("amountToSend");
        var amount = _ethers.default.utils.parseEther(amountTmp);

        var confirmMessage = this.get('resource').getResource('cs.sendToWalletConfirmMessage').replace('|amount|', amountTmp).replace('|walletAddress|', targetWalletAdress);

        if (!confirm(confirmMessage)) return;
        var overrides = this.get('overrides');
        new Ember.RSVP.hash({
          "nonce": wallet.getTransactionCount("latest")
        }).then(function (result) {
          var tx = {
            nonce: result.nonce,
            to: targetWalletAdress,
            value: amount,
            chainId: overrides.chainId,
            gasPrice: overrides.gasPrice,
            gasLimit: overrides.gasLimit
          };
          wallet.sign(tx).then(function (signedTransaction) {
            return provider.sendTransaction(signedTransaction).then(function (t) {
              _this2.addSuccess('Sent To Wallet. TX ID: ' + t.hash);
              _this2.set('amountToSend', 0);
            });
          }).catch(function (err) {
            return _this2.addError(err);
          });
        }).catch(function (err) {
          return _this2.addError(err);
        });
      },
      loadInfo: function loadInfo() {
        if (this.get('selectedWallet')) {
          this.send('loadBalanceInfo');
          this.send('loadStakingInfo');
        }
      },
      loadStakingInfo: function loadStakingInfo() {
        var _this3 = this;

        try {
          this.set('currentRewards', 0);
          this.set('stakeAmount', null);
          this.set('stakeTime', null);
          var contract = this.get('contract');
          var walletAddress = this.get('selectedWallet.address');
          contract.stake_reward(walletAddress).then(function (currentRewards) {
            _this3.set('currentRewards', _ethers.default.utils.formatEther(currentRewards));
          }).catch(function (err) {
            return _this3.addError(err);
          });
          contract.staker(walletAddress).then(function (staker) {
            _this3.set('stakeAmount', _ethers.default.utils.formatEther(staker.amount));
            var stakeTime = new Date(parseInt(staker.time.toString()) * 1000);
            var that = _this3;
            if (_this3.get('stakeTimeTimerId')) window.clearTimeout(_this3.get('stakeTimeTimerId'));
            var stakeTimeTimerId = countdown((0, _moment.default)(stakeTime), function (ts) {
              that.set('stakeTime', that.get('stakeAmount') > 0 ? ts.toString() : '');
            });
            _this3.set('stakeTimeTimerId', stakeTimeTimerId);
          }).catch(function (err) {
            return _this3.addError(err);
          });
        } catch (err) {
          this.addError(err);
        }
      },
      loadBalanceInfo: function loadBalanceInfo() {
        var _this4 = this;

        try {
          this.set('balance', null);
          this.get('selectedWallet').getBalance().then(function (balance) {
            _this4.set('balance', _ethers.default.utils.formatEther(balance));
          });
        } catch (err) {
          this.addError(err);
        }
      },
      withdrawStake: function withdrawStake() {
        var _this5 = this;

        if (this.get('withdrawIsDisabled')) return;
        try {
          var contract = this.get('contract');
          var overrides = this.get('overrides');
          contract.withdraw_stake(overrides).then(function () {
            return _this5.send('loadInfo');
          }).catch(function (err) {
            return _this5.addError(err);
          });
        } catch (err) {
          this.addError(err);
        }
      },
      withdrawClaim: function withdrawClaim() {
        var _this6 = this;

        if (this.get('withdrawIsDisabled')) return;
        try {
          var contract = this.get('contract');
          var overrides = this.get('overrides');
          contract.claim(overrides).then(function () {
            return _this6.send('loadInfo');
          }).catch(function (err) {
            return _this6.addError(err);
          });
        } catch (error) {
          this.addError(error);
        }
      },
      selectWallet: function selectWallet() {
        var _this7 = this;

        try {
          var privateKey = this.get('privateKey');
          if (!privateKey) {
            this.addError("Private Key is invalid!");
            return;
          }
          var url = "https://clo-testnet3.0xinfra.com";
          var provider = new _ethers.default.providers.JsonRpcProvider(url);
          this.set('provider', provider);

          this.set('overrides', {
            "chainId": 20729,
            "gasLimit": 150000,
            "gasPrice": this.get('provider').getGasPrice()
          });
          var wallet = new _ethers.default.Wallet(privateKey, provider);
          this.set("selectedWallet", wallet);
          var contract = new _ethers.default.Contract(this.get('contractAddress'), this.get('abi'), wallet);

          contract.on('StartStaking', function (addr, value, amount, time) {
            _this7.addSuccess('Started Staking. Params => addr:' + addr + ', value:' + _ethers.default.utils.formatEther(value) + ', amount:' + _ethers.default.utils.formatEther(amount) + ', time:' + (0, _moment.default)(new Date(parseInt(time.toString()) * 1000)).format());
            _this7.send('loadInfo');
          });
          contract.on('WithdrawStake', function (staker, amount) {
            _this7.addSuccess('Withdrawed Stake. Params => staker:' + staker + ', amount:' + _ethers.default.utils.formatEther(amount));
            _this7.send('loadInfo');
          });
          contract.on('Claim', function (staker, reward) {
            _this7.addSuccess('Claimed Reward. Params => staker:' + staker + ', reward:' + _ethers.default.utils.formatEther(reward));
            _this7.send('loadInfo');
          });

          this.set('contract', contract);
          this.send('loadInfo');
        } catch (error) {
          this.addError(error);
        }
      },
      removeWalletInfo: function removeWalletInfo() {
        this.set("selectedWallet", null);
        this.set('privateKey', null);
      },
      changeLanguage: function changeLanguage(language) {
        this.set("resource.language", language);
        _moment.default.locale(language);
        if (language == 'tr') countdown.setLabels(' millisaniye| saniye| dakika| saat| gün| hafta| ay| yıl| onyıl| yüzyıl| binyıl', ' millisaniye| saniye| dakika| saat| gün| hafta| ay| yıl| onyıl| yüzyıl| binyıl', ' ve ', ', ', '', function (n) {
          return n.toString();
        });else countdown.resetLabels();
        this.send('loadInfo');
      }
    },
    abi: [{
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
      "name": "claim",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
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
      "name": "withdraw_stake",
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
  });
});
define('cold-staking-app/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _welcomePage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
define('cold-staking-app/helpers/app-version', ['exports', 'cold-staking-app/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  function appVersion(_) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var version = _environment.default.APP.version;
    // e.g. 1.0.0-alpha.1+4jds75hf

    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility
    var versionOnly = hash.versionOnly || hash.hideSha;
    var shaOnly = hash.shaOnly || hash.hideVersion;

    var match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      }
      // Fallback to just version
      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
define('cold-staking-app/helpers/is-after', ['exports', 'ember-moment/helpers/is-after'], function (exports, _isAfter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isAfter.default;
    }
  });
});
define('cold-staking-app/helpers/is-before', ['exports', 'ember-moment/helpers/is-before'], function (exports, _isBefore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isBefore.default;
    }
  });
});
define('cold-staking-app/helpers/is-between', ['exports', 'ember-moment/helpers/is-between'], function (exports, _isBetween) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isBetween.default;
    }
  });
});
define('cold-staking-app/helpers/is-same-or-after', ['exports', 'ember-moment/helpers/is-same-or-after'], function (exports, _isSameOrAfter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isSameOrAfter.default;
    }
  });
});
define('cold-staking-app/helpers/is-same-or-before', ['exports', 'ember-moment/helpers/is-same-or-before'], function (exports, _isSameOrBefore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isSameOrBefore.default;
    }
  });
});
define('cold-staking-app/helpers/is-same', ['exports', 'ember-moment/helpers/is-same'], function (exports, _isSame) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isSame.default;
    }
  });
});
define('cold-staking-app/helpers/moment-add', ['exports', 'ember-moment/helpers/moment-add'], function (exports, _momentAdd) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentAdd.default;
    }
  });
});
define('cold-staking-app/helpers/moment-calendar', ['exports', 'ember-moment/helpers/moment-calendar'], function (exports, _momentCalendar) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentCalendar.default;
    }
  });
});
define('cold-staking-app/helpers/moment-diff', ['exports', 'ember-moment/helpers/moment-diff'], function (exports, _momentDiff) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentDiff.default;
    }
  });
});
define('cold-staking-app/helpers/moment-duration', ['exports', 'ember-moment/helpers/moment-duration'], function (exports, _momentDuration) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentDuration.default;
    }
  });
});
define('cold-staking-app/helpers/moment-format', ['exports', 'ember-moment/helpers/moment-format'], function (exports, _momentFormat) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentFormat.default;
    }
  });
});
define('cold-staking-app/helpers/moment-from-now', ['exports', 'ember-moment/helpers/moment-from-now'], function (exports, _momentFromNow) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentFromNow.default;
    }
  });
});
define('cold-staking-app/helpers/moment-from', ['exports', 'ember-moment/helpers/moment-from'], function (exports, _momentFrom) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentFrom.default;
    }
  });
});
define('cold-staking-app/helpers/moment-subtract', ['exports', 'ember-moment/helpers/moment-subtract'], function (exports, _momentSubtract) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentSubtract.default;
    }
  });
});
define('cold-staking-app/helpers/moment-to-date', ['exports', 'ember-moment/helpers/moment-to-date'], function (exports, _momentToDate) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentToDate.default;
    }
  });
});
define('cold-staking-app/helpers/moment-to-now', ['exports', 'ember-moment/helpers/moment-to-now'], function (exports, _momentToNow) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentToNow.default;
    }
  });
});
define('cold-staking-app/helpers/moment-to', ['exports', 'ember-moment/helpers/moment-to'], function (exports, _momentTo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentTo.default;
    }
  });
});
define('cold-staking-app/helpers/moment-unix', ['exports', 'ember-moment/helpers/unix'], function (exports, _unix) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _unix.default;
    }
  });
});
define('cold-staking-app/helpers/moment', ['exports', 'ember-moment/helpers/moment'], function (exports, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _moment.default;
    }
  });
});
define('cold-staking-app/helpers/now', ['exports', 'ember-moment/helpers/now'], function (exports, _now) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _now.default;
    }
  });
});
define('cold-staking-app/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
define('cold-staking-app/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
define('cold-staking-app/helpers/unix', ['exports', 'ember-moment/helpers/unix'], function (exports, _unix) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _unix.default;
    }
  });
});
define('cold-staking-app/helpers/utc', ['exports', 'ember-moment/helpers/utc'], function (exports, _utc) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _utc.default;
    }
  });
  Object.defineProperty(exports, 'utc', {
    enumerable: true,
    get: function () {
      return _utc.utc;
    }
  });
});
define('cold-staking-app/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'cold-staking-app/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var name = void 0,
      version = void 0;
  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
define('cold-staking-app/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('cold-staking-app/initializers/data-adapter', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('cold-staking-app/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
define('cold-staking-app/initializers/export-application-global', ['exports', 'cold-staking-app/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('cold-staking-app/initializers/injectStore', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('cold-staking-app/initializers/injector', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize(application) {
    application.inject('route', 'resource', 'service:resource');
    application.inject('component', 'resource', 'service:resource');
  }

  exports.default = {
    initialize: initialize
  };
});
define('cold-staking-app/initializers/store', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('cold-staking-app/initializers/transforms', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("cold-staking-app/instance-initializers/ember-data", ["exports", "ember-data/instance-initializers/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
define('cold-staking-app/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
define('cold-staking-app/router', ['exports', 'cold-staking-app/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {
    this.route('simulator');
  });

  exports.default = Router;
});
define('cold-staking-app/routes/application', ['exports', 'moment'], function (exports, _moment) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Route.extend({
        resource: Ember.inject.service(),
        model: function model() {
            _moment.default.locale(this.get('resource.language'));
        }
    });
});
define('cold-staking-app/routes/index', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
define('cold-staking-app/routes/simulator', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
define('cold-staking-app/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
define('cold-staking-app/services/moment', ['exports', 'ember-moment/services/moment', 'cold-staking-app/config/environment'], function (exports, _moment, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var get = Ember.get;
  exports.default = _moment.default.extend({
    defaultFormat: get(_environment.default, 'moment.outputFormat')
  });
});
define('cold-staking-app/services/resource', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    language: 'en',
    resources: {
      'tr': {
        'cs': {
          'pageTitle': 'Cold Staking İşlemleri - Testnet',
          'privateKey': 'Özel Anahtar',
          'loadWallet': 'Cüzdanı Yükle',
          'walletAdress': 'Cüzdan Adresi',
          'balance': 'Bakiye',
          'amount': 'Miktar',
          'contractAddress': 'Sözleşme Adresi',
          'changeWallet': 'Cüzdan Değiştir',
          'sendAllToContract': 'Tümünü Sözleşmeye Gönder',
          'sendToCsContract': 'CS Sözleşmesine Gönder',
          'loadStakingInfo': 'Staking Bilgisini Yükle',
          'stakeAmount': 'Stake Miktarı',
          'currentRewards': 'Şu Anki Ödül',
          'stakeTime': 'Stake Zamanı',
          'withdrawStake': 'Tüm Parayı Çek',
          'withdrawClaim': 'Yalnızca Ödülü Çek',
          'refresh': 'Yenile',
          'wallet': "Cüzdan",
          'coldStaking': 'Cold Staking',
          'operations': 'İşlemler / Loglar',
          'sendToCsContract_confirmMessage': '|amount| CLO cold staking akıllı sözleşmesine transfer edilecektir. Onaylıyor musunuz?',
          'sendToWalletConfirmMessage': "Aşağıda belirtilen cüzdan adresine |amount| CLO gönderilecektir. Onaylıyor musunuz? |walletAddress|",
          'privateKeyForTest': 'Uygulamayı test etmek için aşağıda belirtilen özel anahtarı kullanabilirsiniz.',
          'transfer': 'Transfer',
          'targetWalletAdress': 'Hedef Cüzdan Adresi',
          'amountToSend': 'Gönderilecek Miktar',
          'sendToWallet': 'Cüzdana Gönder'
        },
        'language': {
          'tr': 'Türkçe',
          'en': 'English'
        }
      },
      'en': {
        'cs': {
          'pageTitle': 'Cold Staking Operations - Testnet',
          'privateKey': 'Private Key',
          'loadWallet': 'Load Wallet',
          'walletAdress': 'Wallet Address',
          'balance': 'Balance',
          'amount': 'Amount',
          'contractAddress': 'Contract Address',
          'changeWallet': 'Change Wallet',
          'sendAllToContract': 'Send All To Contract',
          'sendToCsContract': 'Send To CS Contract',
          'loadStakingInfo': 'Load Staking Information',
          'stakeAmount': 'Stake Amount',
          'currentRewards': 'Current Rewards',
          'stakeTime': 'Stake Time',
          'withdrawStake': 'Withdraw All Coins',
          'withdrawClaim': 'Withdraw Only Claim',
          'refresh': 'Refresh',
          'wallet': "Wallet",
          'coldStaking': 'Cold Staking',
          'operations': 'Operations / Logs',
          'sendToCsContract_confirmMessage': '|amount| CLO will be transferred to cold staking smart contract. Do you approve?',
          'sendToWalletConfirmMessage': "|amount| CLO will be sent to the wallet address mentioned below. Do you approve? |walletAddress|",
          'privateKeyForTest': 'You can use the following private key to test the application.',
          'transfer': 'Transfer',
          'targetWalletAdress': 'Target Wallet Adress',
          'amountToSend': 'Amount To Send',
          'sendToWallet': 'Send To Wallet'
        },
        'language': {
          'tr': 'Türkçe',
          'en': 'English'
        }
      }
    },
    getResource: function getResource(key) {
      var resourceKey = 'resources.' + this.get('language') + '.' + key;
      var resourceValue = this.get(resourceKey);
      if (resourceValue) return resourceValue;
      return resourceKey;
    }
  });
});
define('cold-staking-app/services/simulator', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({});
});
define("cold-staking-app/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "uTxo5tEr", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"container\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n        \"],[1,[18,\"outlet\"],false],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8]],\"hasEval\":false}", "meta": { "moduleName": "cold-staking-app/templates/application.hbs" } });
});
define("cold-staking-app/templates/components/cs-simulator", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "/4OxzCkF", "block": "{\"symbols\":[\"&default\"],\"statements\":[[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n    \"],[6,\"h1\"],[7],[0,\"Cold Staking Simulator\"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\\n\"],[6,\"form\"],[9,\"class\",\"form-horizontal\"],[7],[0,\"\\n  \"],[6,\"fieldset\"],[7],[0,\"\\n    \"],[6,\"legend\"],[7],[0,\"Parameters\"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n      \"],[6,\"label\"],[9,\"class\",\"control-label col-sm-2\"],[9,\"for\",\"email\"],[7],[0,\"Email:\"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"col-sm-10\"],[7],[0,\"\\n        \"],[6,\"input\"],[9,\"type\",\"email\"],[9,\"class\",\"form-control\"],[9,\"id\",\"email\"],[9,\"placeholder\",\"Enter email\"],[9,\"name\",\"email\"],[7],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n      \"],[6,\"label\"],[9,\"class\",\"control-label col-sm-2\"],[9,\"for\",\"pwd\"],[7],[0,\"Password:\"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"col-sm-10\"],[7],[0,\"\\n        \"],[6,\"input\"],[9,\"type\",\"password\"],[9,\"class\",\"form-control\"],[9,\"id\",\"pwd\"],[9,\"placeholder\",\"Enter password\"],[9,\"name\",\"pwd\"],[7],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"col-sm-offset-2 col-sm-10\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"checkbox\"],[7],[0,\"\\n          \"],[6,\"label\"],[7],[6,\"input\"],[9,\"type\",\"checkbox\"],[9,\"name\",\"remember\"],[7],[8],[0,\" Remember me\"],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"col-sm-offset-2 col-sm-10\"],[7],[0,\"\\n        \"],[6,\"button\"],[9,\"type\",\"submit\"],[9,\"class\",\"btn btn-default\"],[7],[0,\"Submit\"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\\n\"],[11,1]],\"hasEval\":false}", "meta": { "moduleName": "cold-staking-app/templates/components/cs-simulator.hbs" } });
});
define("cold-staking-app/templates/components/get-resource", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "OTehJCpG", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"resourceValue\"],false]],\"hasEval\":false}", "meta": { "moduleName": "cold-staking-app/templates/components/get-resource.hbs" } });
});
define("cold-staking-app/templates/components/nav-bar", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "3d6NPsK3", "block": "{\"symbols\":[],\"statements\":[[6,\"ul\"],[9,\"class\",\"nav navbar-nav\"],[7],[0,\"\\n  \"],[4,\"link-to\",[\"index\"],[[\"tagName\"],[\"li\"]],{\"statements\":[[6,\"a\"],[9,\"href\",\"\"],[7],[0,\"Cold Staking\"],[8]],\"parameters\":[]},null],[0,\"\\n\"],[8]],\"hasEval\":false}", "meta": { "moduleName": "cold-staking-app/templates/components/nav-bar.hbs" } });
});
define("cold-staking-app/templates/components/select-wallet", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "kMUMHVJC", "block": "{\"symbols\":[\"item\",\"&default\"],\"statements\":[[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"btn-group pull-right\"],[7],[0,\"\\n      \"],[6,\"a\"],[9,\"class\",\"btn btn-sm btn-success\"],[3,\"action\",[[19,0,[]],\"changeLanguage\",\"tr\"]],[7],[0,\"\\n        \"],[6,\"span\"],[9,\"class\",\"badge\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"language.tr\"]]],false],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"a\"],[9,\"class\",\"btn btn-sm btn-success\"],[3,\"action\",[[19,0,[]],\"changeLanguage\",\"en\"]],[7],[6,\"span\"],[9,\"class\",\"badge\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"language.en\"]]],false],[8],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\" \"],[8],[0,\"\\n\\n\"],[4,\"if\",[[20,[\"selectedWallet\"]]],null,{\"statements\":[[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-6\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"panel panel-success\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-heading\"],[7],[0,\"\\n        \"],[6,\"h3\"],[9,\"class\",\"panel-title\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.wallet\"]]],false],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-body\"],[7],[0,\"\\n        \"],[6,\"form\"],[7],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.walletAdress\"]]],false],[8],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control\",[20,[\"selectedWallet\",\"address\"]],true]]],false],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.balance\"]]],false],[8],[0,\"\\n\\n            \"],[6,\"div\"],[9,\"class\",\"input-group\"],[7],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control text-right\",[20,[\"balance\"]],true]]],false],[0,\"\\n              \"],[6,\"a\"],[9,\"class\",\"input-group-addon btn btn-success\"],[3,\"action\",[[19,0,[]],\"loadBalanceInfo\"]],[7],[0,\"\\n                \"],[6,\"i\"],[9,\"class\",\"glyphicon glyphicon-refresh\"],[7],[8],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"btn-group\"],[7],[0,\"\\n            \"],[6,\"button\"],[9,\"class\",\"btn btn-sm btn-danger\"],[3,\"action\",[[19,0,[]],\"removeWalletInfo\"]],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.changeWallet\"]]],false],[8],[0,\"\\n          \"],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n\\n    \"],[6,\"div\"],[9,\"class\",\"panel panel-success\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-heading\"],[7],[0,\"\\n        \"],[6,\"h3\"],[9,\"class\",\"panel-title\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.transfer\"]]],false],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-body\"],[7],[0,\"\\n        \"],[6,\"form\"],[7],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.targetWalletAdress\"]]],false],[8],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\"],[\"text\",\"form-control\",[20,[\"targetWalletAdress\"]]]]],false],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.amountToSend\"]]],false],[8],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"input-group\"],[7],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"min\"],[\"number\",\"form-control text-right\",[20,[\"amountToSend\"]],1]]],false],[0,\"\\n              \"],[6,\"a\"],[10,\"class\",[26,[\"input-group-addon btn btn-success \",[25,\"if\",[[20,[\"sendToWalletIsDisabled\"]],\"disabled\",\"\"],null]]]],[3,\"action\",[[19,0,[]],\"sendToWallet\"]],[7],[0,\"\\n                \"],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.sendToWallet\"]]],false],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-6\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"panel panel-success\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-heading\"],[7],[0,\"\\n        \"],[6,\"h3\"],[9,\"class\",\"panel-title\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.coldStaking\"]]],false],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-body\"],[7],[0,\"\\n        \"],[6,\"form\"],[7],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.contractAddress\"]]],false],[8],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control\",[20,[\"contractAddress\"]],true]]],false],[0,\"\\n          \"],[8],[0,\"\\n\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.amount\"]]],false],[8],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"input-group\"],[7],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"min\"],[\"number\",\"form-control text-right\",[20,[\"amount\"]],1]]],false],[0,\"\\n              \"],[6,\"a\"],[10,\"class\",[26,[\"input-group-addon btn btn-success \",[25,\"if\",[[20,[\"sendToCsContractIsDisabled\"]],\"disabled\",\"\"],null]]]],[3,\"action\",[[19,0,[]],\"sendToCsContract\"]],[7],[0,\"\\n                \"],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.sendToCsContract\"]]],false],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.stakeAmount\"]]],false],[8],[0,\"\\n\\n            \"],[6,\"div\"],[9,\"class\",\"input-group\"],[7],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control text-right\",[20,[\"stakeAmount\"]],true]]],false],[0,\"\\n              \"],[6,\"a\"],[9,\"class\",\"input-group-addon btn btn-success\"],[3,\"action\",[[19,0,[]],\"loadStakingInfo\"]],[7],[0,\"\\n                \"],[6,\"i\"],[9,\"class\",\"glyphicon glyphicon-refresh\"],[7],[8],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.currentRewards\"]]],false],[8],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control text-right\",[20,[\"currentRewards\"]],true]]],false],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.stakeTime\"]]],false],[8],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control\",[20,[\"stakeTime\"]],true]]],false],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"col-sm-12 btn-group\"],[7],[0,\"\\n            \"],[6,\"button\"],[10,\"class\",[26,[\"btn btn-sm btn-success col-sm-6 \",[25,\"if\",[[20,[\"withdrawIsDisabled\"]],\"disabled\",\"\"],null]]]],[3,\"action\",[[19,0,[]],\"withdrawStake\"]],[7],[0,\"\\n              \"],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.withdrawStake\"]]],false],[0,\" \"],[6,\"span\"],[9,\"class\",\"badge\"],[7],[1,[18,\"allCoins\"],false],[8],[8],[0,\"\\n            \"],[6,\"button\"],[10,\"class\",[26,[\"btn btn-sm btn-success  col-sm-6 \",[25,\"if\",[[20,[\"withdrawIsDisabled\"]],\"disabled\",\"\"],null]]]],[3,\"action\",[[19,0,[]],\"withdrawClaim\"]],[7],[0,\"\\n              \"],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.withdrawClaim\"]]],false],[0,\" \"],[6,\"span\"],[9,\"class\",\"badge\"],[7],[1,[18,\"currentRewardsFormatted\"],false],[8],[8],[0,\"\\n          \"],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"panel panel-success\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-heading\"],[7],[0,\"\\n        \"],[6,\"h3\"],[9,\"class\",\"panel-title\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.wallet\"]]],false],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-body\"],[7],[0,\"\\n        \"],[6,\"form\"],[7],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.privateKey\"]]],false],[8],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"autocomplete\"],[\"password\",\"form-control\",[20,[\"privateKey\"]],\"off\"]]],false],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"button\"],[9,\"class\",\"btn btn-sm btn-success\"],[3,\"action\",[[19,0,[]],\"selectWallet\"]],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.loadWallet\"]]],false],[8],[0,\"\\n          \"],[6,\"hr\"],[7],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n              \"],[6,\"i\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.privateKeyForTest\"]]],false],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"span\"],[9,\"class\",\"badge\"],[7],[0,\"2468d512f259637cea4c690aeb811cdd7a9af164af775ea03d8e2e21707491be\"],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"parameters\":[]}],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"panel panel-success\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-heading\"],[7],[0,\"\\n        \"],[6,\"h3\"],[9,\"class\",\"panel-title\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.operations\"]]],false],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-body\"],[7],[0,\"\\n        \"],[6,\"table\"],[9,\"class\",\"table\"],[7],[0,\"\\n          \"],[6,\"tbody\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"logs\"]]],null,{\"statements\":[[0,\"            \"],[6,\"tr\"],[10,\"class\",[26,[[19,1,[\"class\"]]]]],[7],[0,\"\\n              \"],[6,\"td\"],[7],[1,[19,1,[\"message\"]],false],[8],[0,\"\\n            \"],[8],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"          \"],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[11,2]],\"hasEval\":false}", "meta": { "moduleName": "cold-staking-app/templates/components/select-wallet.hbs" } });
});
define("cold-staking-app/templates/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "i4y5P7n2", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"select-wallet\"],false],[0,\"\\n            \\n\\n\"],[1,[18,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "cold-staking-app/templates/index.hbs" } });
});
define("cold-staking-app/templates/simulator", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "CTW+RVsX", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"cs-simulator\"],false],[0,\"\\n\"],[1,[18,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "cold-staking-app/templates/simulator.hbs" } });
});


define('cold-staking-app/config/environment', [], function() {
  var prefix = 'cold-staking-app';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

if (!runningTests) {
  require("cold-staking-app/app")["default"].create({"name":"cold-staking-app","version":"0.0.0+87f763b2"});
}
//# sourceMappingURL=cold-staking-app.map
