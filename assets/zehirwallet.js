"use strict";



define('zehirwallet/app', ['exports', 'zehirwallet/resolver', 'ember-load-initializers', 'zehirwallet/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
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
define('zehirwallet/components/button-confirm', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    /* Resources */

    tagName: "div",
    buttonKey: "",
    titleKey: "titleKey",
    messageKey: "messageKey",
    cancelKey: "cancelKey",
    okKey: "okKey",
    buttonClass: "btn btn-sm btn-success",
    click: function click() {
      //Ember.$("#buttonConfirm").modal("show");
      Ember.$("#exampleModalPopovers").modal("show");
    },

    actions: {
      // showModal:function(){
      //     this.$(".modal").modal("show");
      // },
      ok: function ok() {
        //this.$(".modal").modal("hide");
        this.sendAction("ok");
        //this.$(".modal").modal("hide");
      },
      cancel: function cancel() {
        this.sendAction("cancel");
        //this.$(".modal").modal("hide");
      }
    }
  });
});
define("zehirwallet/components/button-default", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    /* Resources */
    buttonKey: "buttonKey",
    buttonClass: "btn btn-sm btn-success",
    actions: {
      action: function action() {
        this.sendAction("action");
      }
    }
  });
});
define('zehirwallet/components/cs-simulator', ['exports'], function (exports) {
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
define('zehirwallet/components/get-resource', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    tagName: "",
    key: null,
    languageChanged: Ember.observer('config.currentLanguageKey', function () {
      this.getResource();
    }),
    resourceValue: null,
    getResource: function getResource() {
      var val = this.get('resource').getResource(this.get('key'));
      this.set("resourceValue", val);
    },

    didRender: function () {
      this.getResource();
    }.on('didInsertElement')
  });
});
define('zehirwallet/components/input-file', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Component.extend({
        tagName: "span",
        icon: "glyphicon glyphicon-file",
        multiple: false,
        titleResourceKey: 'selectFile',
        title: Ember.computed('resource.language', 'titleResourceKey', function () {
            return this.resource.getResource(this.get('titleResourceKey'));
        }),
        classNames: "fileinput-button btn btn-sm btn-default",
        classNameBindings: "class",
        humanReadableFileSize: function humanReadableFileSize(size) {
            var label = "";
            if (size === 0) {
                label = "0 KB";
            } else if (size && !isNaN(size)) {
                var fileSizeInBytes = size;
                var i = -1;
                do {
                    fileSizeInBytes = fileSizeInBytes / 1024;
                    i++;
                } while (fileSizeInBytes > 1024);

                var byteUnits = [' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB'];
                label += Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
            }
            return label;
        },
        readFile: function readFile(fileToUpload, dataType, callback) {
            var fileObject = {
                "name": fileToUpload.name,
                "rawSize": fileToUpload.size,
                "type": fileToUpload.type,
                "size": this.humanReadableFileSize(fileToUpload.size)
            };
            if (fileToUpload.size < 30 * 1024 * 1024) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var fileData = e.target.result;
                    if (dataType == "base64String") fileObject.data = fileData.substr(fileData.indexOf("base64,") + 7);else if (dataType == "text") fileObject.data = fileData;
                    callback(fileObject);
                };
                if (dataType == "text") reader.readAsText(fileToUpload);else if (dataType == "base64String") reader.readAsDataURL(fileToUpload);
            }
        },
        change: function change(e) {
            var _this = this;

            var inputFiles = e.target.files;
            if (inputFiles.length < 1) {
                return;
            }
            var result = { element: e.target, files: [] };
            Ember.$.each(inputFiles, function (index, inputFile) {
                var file = {
                    name: inputFile.name,
                    mimeType: inputFile.type,
                    size: inputFile.size,
                    lastModified: inputFile.lastModified,
                    lastModifiedDate: inputFile.lastModifiedDate,
                    readAsText: function readAsText(resolve) {
                        _this.readFile(inputFile, "text", function (fileObject) {
                            resolve(fileObject.data);
                        });
                    },
                    readAsBase64String: function readAsBase64String(resolve) {
                        _this.readFile(inputFile, "base64String", function (fileObject) {
                            resolve(fileObject.data);
                        });
                    }
                };
                result.files.push(file);
            });
            if (result.files.length > 0) this.set('title', result.files[0].name);
            this.sendAction('fileChanged', result);
            e.target.value = null;
        }
    });
});
define('zehirwallet/components/nav-bar', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
define('zehirwallet/components/select-menu', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    title: "Title",
    tagName: "div",
    class: null,
    defaultClass: "btn-group",
    classNameBindings: ["class", "defaultClass"],
    items: [],
    textField: "text",
    valueField: "value",
    selectedItem: null,
    internalItems: Ember.computed("items", function () {
      var valueField = this.get("valueField"),
          textField = this.get("textField");
      if (!this.get("items")) return [];
      var result = this.get("items").map(function (item) {
        return {
          text: item[textField],
          value: item[valueField],
          data: item
        };
      });
      return result;
    }),
    didInsertDropdown: function () {
      var selectedValue = this.get("value");
      if (selectedValue) {
        var items = this.get('internalItems').filter(function (item) {
          return item.value == selectedValue;
        });
        if (items.length == 1) this.set('selectedItem', items[0]);
      }
    }.on("didInsertElement"),
    actions: {
      selectItem: function selectItem(selectedItem) {
        this.set('selectedItem', selectedItem);
        this.sendAction("onChange", selectedItem);
      }
    }
  });
});
define('zehirwallet/controllers/application', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    languages: Ember.computed(function () {
      var array = [];
      var source = this.get('language');
      for (var element in source) {
        array.push(source[element]);
      }
      return array;
    }),
    networks: Ember.computed("network", function () {
      var array = [];
      var source = this.get('network');
      for (var element in source) {
        array.push(source[element]);
      }
      return array;
    })
  });
});
define('zehirwallet/controllers/index', ['exports', 'ethers', 'moment'], function (exports, _ethers, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var toastr = window.toastr;
  var countdown = window.countdown;

  exports.default = Ember.Controller.extend({
    provider: Ember.computed('config.currentNetwork', function () {
      return new _ethers.default.providers.JsonRpcProvider(this.get('config.currentNetwork.url'));
    }),
    readOnly: false,
    currentNetworkKeyChanged: Ember.observer('config.currentNetworkKey', function () {
      this.set('config.currentNetwork', this.get('config.network.' + this.get('config.currentNetworkKey')));
    }),
    currentLanguageKeyChanged: Ember.observer('config.currentNetworkKey', function () {
      this.set('config.currentLanguage', this.get('config.language.' + this.get('config.currentLanguageKey')));
    }),
    selectedWallet: null,
    privateKey: '',
    keyStoreJson: '',
    amount: 0,
    contractAddress: Ember.computed(function () {
      return this.get('config.coldStaking.contractAddress');
    }),
    targetWalletAddress: '',
    logs: [],
    withdrawIsDisabled: Ember.computed('currentRewards', function () {
      return parseFloat(this.get('currentRewards')) == 0;
    }),
    sendToCsContractIsDisabled: Ember.computed('balance', 'amount', function () {
      return !this.get('amount') || !this.get('balance') || parseFloat(this.get('balance')) < 0 || parseFloat(this.get('amount')) < 1 || parseFloat(this.get('balance')) < parseFloat(this.get('amount'));
    }),
    sendToWalletIsDisabled: Ember.computed('balance', 'amountToSend', 'targetWalletAddress', function () {
      return !this.get('amountToSend') || !this.get('balance') || parseFloat(this.get('balance')) < 0 || parseFloat(this.get('amountToSend')) < 1 || parseFloat(this.get('balance')) < parseFloat(this.get('amountToSend')) || !this.get('targetWalletAddress');
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
    showInfo: function showInfo(type, message) {
      toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-full-width",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      };
      toastr[type](message);
    },
    addInfo: function addInfo(message) {
      this.showInfo("info", message);
    },
    addSuccess: function addSuccess(message) {
      this.showInfo("success", message);
    },
    addError: function addError(message) {
      this.showInfo("error", message);
    },


    actions: {
      selectKeyStoreFile: function selectKeyStoreFile(result) {
        var _this = this;

        if (result.files.length > 0) {
          result.files[0].readAsText(function (keyStore) {
            _this.set('keyStoreJson', keyStore);
          });
        }
      },
      privateKeyForTest: function privateKeyForTest() {
        this.set('privateKey', this.get('config.privateKeyForTest'));
      },
      sendToCsContract: function sendToCsContract() {
        var _this2 = this;

        if (this.get('sendToCsContractIsDisabled')) return;
        var contractAddress = this.get('contractAddress');
        var provider = this.get('provider');
        var wallet = this.get('selectedWallet');
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
              _this2.addSuccess('Sent To Contract. TX ID: ' + t.hash);
              _this2.set('amount', 0);
            });
          }).catch(function (err) {
            return _this2.addError(err);
          });
        }).catch(function (err) {
          return _this2.addError(err);
        });
      },
      sendToWallet: function sendToWallet() {
        var _this3 = this;

        if (this.get('sendToWalletIsDisabled')) return;
        var targetWalletAddress = this.get('targetWalletAddress');
        var provider = this.get('provider');
        var wallet = this.get('selectedWallet');
        var amountTmp = this.get("amountToSend");
        var amount = _ethers.default.utils.parseEther(amountTmp);

        var confirmMessage = this.get('resource').getResource('cs.sendToWalletConfirmMessage').replace('|amount|', amountTmp).replace('|walletAddress|', targetWalletAddress);

        if (!confirm(confirmMessage)) return;
        var overrides = this.get('overrides');
        new Ember.RSVP.hash({
          "nonce": wallet.getTransactionCount("latest")
        }).then(function (result) {
          var tx = {
            nonce: result.nonce,
            to: targetWalletAddress,
            value: amount,
            chainId: overrides.chainId,
            gasPrice: overrides.gasPrice,
            gasLimit: overrides.gasLimit
          };
          wallet.sign(tx).then(function (signedTransaction) {
            return provider.sendTransaction(signedTransaction).then(function (t) {
              _this3.addSuccess('Sent To Wallet. TX ID: ' + t.hash);
              _this3.set('amountToSend', 0);
            });
          }).catch(function (err) {
            return _this3.addError(err);
          });
        }).catch(function (err) {
          return _this3.addError(err);
        });
      },
      loadInfo: function loadInfo() {
        if (this.get('selectedWallet')) {
          this.send('loadBalanceInfo');
          this.send('loadStakingInfo');
        }
      },
      loadStakingInfo: function loadStakingInfo() {
        var _this4 = this;

        try {
          this.set('currentRewards', 0);
          this.set('stakeAmount', null);
          this.set('stakeTime', null);
          var contract = this.get('contract');
          var walletAddress = this.get('selectedWallet.address');
          contract.stake_reward(walletAddress).then(function (currentRewards) {
            _this4.set('currentRewards', _ethers.default.utils.formatEther(currentRewards));
          }).catch(function () {});
          contract.staker(walletAddress).then(function (staker) {
            _this4.set('stakeAmount', _ethers.default.utils.formatEther(staker.amount));
            var stakeTime = new Date(parseInt(staker.time.toString()) * 1000);
            var that = _this4;
            if (_this4.get('stakeTimeTimerId')) window.clearTimeout(_this4.get('stakeTimeTimerId'));
            var stakeTimeTimerId = countdown((0, _moment.default)(stakeTime), function (ts) {
              that.set('stakeTime', that.get('stakeAmount') > 0 ? ts.toString() : '');
            });
            _this4.set('stakeTimeTimerId', stakeTimeTimerId);
          }).catch(function (err) {
            return _this4.addError(err);
          });
        } catch (err) {
          this.addError(err);
        }
      },
      loadBalanceInfo: function loadBalanceInfo() {
        var _this5 = this;

        try {
          this.set('balance', null);
          this.get('selectedWallet').getBalance().then(function (balance) {
            _this5.set('balance', _ethers.default.utils.formatEther(balance));
          });
        } catch (err) {
          this.addError(err);
        }
      },
      withdrawStake: function withdrawStake() {
        var _this6 = this;

        if (this.get('withdrawIsDisabled')) return;
        try {
          var contract = this.get('contract');
          var overrides = this.get('overrides');
          contract.withdraw_stake(overrides).then(function () {
            return _this6.send('loadInfo');
          }).catch(function (err) {
            return _this6.addError(err);
          });
        } catch (err) {
          this.addError(err);
        }
      },
      withdrawClaim: function withdrawClaim() {
        var _this7 = this;

        if (this.get('withdrawIsDisabled')) return;
        try {
          var contract = this.get('contract');
          var overrides = this.get('overrides');
          contract.claim(overrides).then(function () {
            return _this7.send('loadInfo');
          }).catch(function (err) {
            return _this7.addError(err);
          });
        } catch (error) {
          this.addError(error);
        }
      },
      loginWithKeyStore: function loginWithKeyStore() {
        this.send("selectWallet", "keyStoreFile");
      },
      loginWithPrivateKey: function loginWithPrivateKey() {
        this.send("selectWallet", "privateKey");
      },
      loginWithWalletAddress: function loginWithWalletAddress() {
        this.send("selectWallet", "walletAddress");
      },
      selectWallet: function selectWallet(accessType) {
        var _this8 = this;

        var provider = this.get("provider");
        var walletAddress = this.get("walletAddress");

        this.set('overrides', {
          "chainId": this.get('config.currentNetwork.chainId'),
          "gasLimit": this.get('config.currentNetwork.gasLimit'),
          "gasPrice": this.get('provider').getGasPrice()
        });
        try {
          new Ember.RSVP.hash({
            "wallet": new Ember.RSVP.Promise(function (walletResolve) {
              if (accessType == "keyStoreFile") {
                _ethers.default.Wallet.fromEncryptedJson(_this8.get('keyStoreJson'), _this8.get('password')).then(function (decryptedWallet) {
                  walletResolve(new _ethers.default.Wallet(decryptedWallet.privateKey, provider));
                }).catch(function (error) {
                  return _this8.addError(error);
                });
              } else if (accessType == "privateKey") {
                var privateKey = _this8.get('privateKey');
                if (!privateKey) _this8.addError("Private Key is invalid!");else {
                  walletResolve(new _ethers.default.Wallet(privateKey, provider));
                }
              } else if (accessType == "walletAddress") {
                walletResolve({
                  readOnly: true,
                  address: walletAddress,
                  provider: provider,
                  getBalance: function getBalance() {
                    return provider.getBalance(this.address);
                  },
                  sign: function sign() {
                    alert("This wallet is read only!");
                  },
                  getTransactionCount: function getTransactionCount() {
                    return provider.getTransactionCount(this.address);
                  },
                  privateKey: null
                });
              }
            })
          }).then(function (result) {
            var wallet = result.wallet;
            if (!wallet) return;
            _this8.set("selectedWallet", wallet);
            var contract = null;
            if (wallet.readOnly) contract = new _ethers.default.Contract(_this8.get('contractAddress'), _this8.get('config.coldStaking.contractAbi'), wallet.provider);else contract = new _ethers.default.Contract(_this8.get('contractAddress'), _this8.get('config.coldStaking.contractAbi'), wallet);
            contract.on('StartStaking', function (addr, value, amount, time) {
              if (addr == wallet.address) {
                _this8.addSuccess('Started Staking. Params => addr:' + addr + ', value:' + _ethers.default.utils.formatEther(value) + ', amount:' + _ethers.default.utils.formatEther(amount) + ', time:' + (0, _moment.default)(new Date(parseInt(time.toString()) * 1000)).format());
                _this8.send('loadInfo');
              }
            });
            contract.on('WithdrawStake', function (staker, amount) {
              if (staker == wallet.address) {
                _this8.addSuccess('Withdrawed Stake. Params => staker:' + staker + ', amount:' + _ethers.default.utils.formatEther(amount));
                _this8.send('loadInfo');
              }
            });
            contract.on('Claim', function (staker, reward) {
              if (staker == wallet.address) {
                _this8.addSuccess('Claimed Reward. Params => staker:' + staker + ', reward:' + _ethers.default.utils.formatEther(reward));
                _this8.send('loadInfo');
              }
            });

            _this8.set('contract', contract);
            _this8.send('loadInfo');
          }).catch(function (error) {
            return _this8.addError(error);
          });
        } catch (error) {
          this.addError(error);
        }
      },
      removeWalletInfo: function removeWalletInfo() {
        this.set("selectedWallet", null);
        this.set('privateKey', null);
        this.set('keyStoreJson', null);
        this.set('password', null);
      },
      onChangeNetwork: function onChangeNetwork(selectedItem) {
        var key = selectedItem.value;
        this.set('config.currentNetworkKey', key);
        this.send('removeWalletInfo');
      },
      onChangeLanguage: function onChangeLanguage(selectedItem) {
        var language = selectedItem.value;
        this.set("config.currentLanguageKey", language);
        _moment.default.locale(language);
        if (language == 'tr') countdown.setLabels(' millisaniye| saniye| dakika| saat| gün| hafta| ay| yıl| onyıl| yüzyıl| binyıl', ' millisaniye| saniye| dakika| saat| gün| hafta| ay| yıl| onyıl| yüzyıl| binyıl', ' ve ', ', ', '', function (n) {
          return n.toString();
        });else countdown.resetLabels();
        this.send('loadInfo');
      }
    }
  });
});
define('zehirwallet/helpers/app-version', ['exports', 'zehirwallet/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
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
define('zehirwallet/helpers/eq', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.eq = eq;
  function eq(params) {
    return params.length == 2 && params[0] == params[1];
  }

  exports.default = Ember.Helper.helper(eq);
});
define('zehirwallet/helpers/is-after', ['exports', 'ember-moment/helpers/is-after'], function (exports, _isAfter) {
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
define('zehirwallet/helpers/is-before', ['exports', 'ember-moment/helpers/is-before'], function (exports, _isBefore) {
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
define('zehirwallet/helpers/is-between', ['exports', 'ember-moment/helpers/is-between'], function (exports, _isBetween) {
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
define('zehirwallet/helpers/is-same-or-after', ['exports', 'ember-moment/helpers/is-same-or-after'], function (exports, _isSameOrAfter) {
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
define('zehirwallet/helpers/is-same-or-before', ['exports', 'ember-moment/helpers/is-same-or-before'], function (exports, _isSameOrBefore) {
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
define('zehirwallet/helpers/is-same', ['exports', 'ember-moment/helpers/is-same'], function (exports, _isSame) {
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
define('zehirwallet/helpers/moment-add', ['exports', 'ember-moment/helpers/moment-add'], function (exports, _momentAdd) {
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
define('zehirwallet/helpers/moment-calendar', ['exports', 'ember-moment/helpers/moment-calendar'], function (exports, _momentCalendar) {
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
define('zehirwallet/helpers/moment-diff', ['exports', 'ember-moment/helpers/moment-diff'], function (exports, _momentDiff) {
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
define('zehirwallet/helpers/moment-duration', ['exports', 'ember-moment/helpers/moment-duration'], function (exports, _momentDuration) {
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
define('zehirwallet/helpers/moment-format', ['exports', 'ember-moment/helpers/moment-format'], function (exports, _momentFormat) {
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
define('zehirwallet/helpers/moment-from-now', ['exports', 'ember-moment/helpers/moment-from-now'], function (exports, _momentFromNow) {
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
define('zehirwallet/helpers/moment-from', ['exports', 'ember-moment/helpers/moment-from'], function (exports, _momentFrom) {
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
define('zehirwallet/helpers/moment-subtract', ['exports', 'ember-moment/helpers/moment-subtract'], function (exports, _momentSubtract) {
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
define('zehirwallet/helpers/moment-to-date', ['exports', 'ember-moment/helpers/moment-to-date'], function (exports, _momentToDate) {
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
define('zehirwallet/helpers/moment-to-now', ['exports', 'ember-moment/helpers/moment-to-now'], function (exports, _momentToNow) {
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
define('zehirwallet/helpers/moment-to', ['exports', 'ember-moment/helpers/moment-to'], function (exports, _momentTo) {
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
define('zehirwallet/helpers/moment-unix', ['exports', 'ember-moment/helpers/unix'], function (exports, _unix) {
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
define('zehirwallet/helpers/moment', ['exports', 'ember-moment/helpers/moment'], function (exports, _moment) {
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
define('zehirwallet/helpers/now', ['exports', 'ember-moment/helpers/now'], function (exports, _now) {
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
define('zehirwallet/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
define('zehirwallet/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
define('zehirwallet/helpers/unix', ['exports', 'ember-moment/helpers/unix'], function (exports, _unix) {
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
define('zehirwallet/helpers/utc', ['exports', 'ember-moment/helpers/utc'], function (exports, _utc) {
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
define('zehirwallet/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'zehirwallet/config/environment'], function (exports, _initializerFactory, _environment) {
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
define('zehirwallet/initializers/config', ['exports', 'zehirwallet/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize(application) {

    application.register('config:main', Ember.Object.extend(_environment.default));
    application.inject('route', 'config', 'config:main');
    application.inject('controller', 'config', 'config:main');
    application.inject('component', 'config', 'config:main');
    application.inject('service', 'config', 'config:main');
  }

  exports.default = {
    name: "config",
    initialize: initialize
  };
});
define('zehirwallet/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
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
define('zehirwallet/initializers/data-adapter', ['exports'], function (exports) {
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
define('zehirwallet/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
define('zehirwallet/initializers/export-application-global', ['exports', 'zehirwallet/config/environment'], function (exports, _environment) {
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
define('zehirwallet/initializers/injectStore', ['exports'], function (exports) {
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
define('zehirwallet/initializers/resource', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize(application) {
    application.inject('route', 'resource', 'service:resource');
    application.inject('controller', 'resource', 'service:resource');
    application.inject('component', 'resource', 'service:resource');
  }

  exports.default = {
    name: 'resource',
    initialize: initialize
  };
});
define('zehirwallet/initializers/store', ['exports'], function (exports) {
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
define('zehirwallet/initializers/transforms', ['exports'], function (exports) {
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
define("zehirwallet/instance-initializers/ember-data", ["exports", "ember-data/instance-initializers/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
define('zehirwallet/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
define('zehirwallet/router', ['exports', 'zehirwallet/config/environment'], function (exports, _environment) {
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
define('zehirwallet/routes/application', ['exports', 'moment'], function (exports, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    model: function model() {

      this.set('config.currentNetworkKey', this.get('config.defaultNetworkKey'));
      this.set('config.currentLanguageKey', this.get('config.defaultLanguageKey'));
      _moment.default.locale(this.get('config.currentLanguageKey'));

      var languages = [];
      var items = this.get('config.language');
      for (var element in items) {
        languages.push(items[element]);
      }
      var networks = [];
      items = this.get('config.network');
      for (var _element in items) {
        networks.push(items[_element]);
      }
      return {
        languages: languages,
        networks: networks
      };
    }
  });
});
define('zehirwallet/routes/index', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
define('zehirwallet/routes/simulator', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
define('zehirwallet/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
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
define('zehirwallet/services/modal', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    confirm: function confirm() {},

    templates: {
      confirm: '\n        <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\n          <div class="modal-dialog" role="document">\n            <div class="modal-content">\n              <div class="modal-header">\n                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n                <h4 class="modal-title">{{get-resource key=titleKey}}</h4>\n              </div>\n              <div class="modal-body">\n                {{get-resource key=messageKey}}\n              </div>\n              <div class="modal-footer">\n                <button type="button" class="btn btn-default" data-dismiss="modal" {{action "cancel"}}>{{get-resource key=cancelKey}}</button>\n                <button type="button" class="btn btn-primary" {{action "ok"}}>{{get-resource key=okKey}}</button>\n              </div>\n            </div>\n          </div>\n        </div>'
    }

  });
});
define('zehirwallet/services/moment', ['exports', 'ember-moment/services/moment', 'zehirwallet/config/environment'], function (exports, _moment, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var get = Ember.get;
  exports.default = _moment.default.extend({
    defaultFormat: get(_environment.default, 'moment.outputFormat')
  });
});
define('zehirwallet/services/resource', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    resources: {
      'tr': {
        'applicationName': 'Zehir Wallet',
        'network': "Ağ",
        'createNewWallet': 'Yeni Cüzdan Oluştur',
        'cs': {
          'password': 'Şifre',
          'selectFile': 'Dosya Seç',
          'selectKeyStoreFile': 'Keystore Dosyası Seç',
          'questionForWalletAccessType': 'Cüzdanınıza nasıl erişmek istersiniz?',
          'keyStoreFile': 'Keystore Dosyası',
          'pageTitle': 'Cold Staking İşlemleri - Testnet',
          'privateKey': 'Özel Anahtar',
          'loadWallet': 'Cüzdanı Yükle',
          'walletAddress': 'Cüzdan Adresi',
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
          'privateKeyForTest': 'Test için gerekli özel anahtarı girmek için buraya tıklayabilirsiniz.',
          'privateKeyForTesti_old': 'Uygulamayı test etmek için aşağıda belirtilen özel anahtarı kullanabilirsiniz.',
          'transfer': 'Transfer',
          'targetWalletAddress': 'Hedef Cüzdan Adresi',
          'amountToSend': 'Gönderilecek Miktar',
          'sendToWallet': 'Cüzdana Gönder'
        },
        'language': {
          'tr': 'Türkçe',
          'en': 'English'
        }
      },
      'en': {
        'applicationName': 'Zehir Wallet',
        'network': "Network",
        'createNewWallet': 'Create New Wallet',
        'cs': {
          'password': 'Password',
          'selectFile': 'Select File',
          'selectKeyStoreFile': 'Select Keystore File',
          'questionForWalletAccessType': 'How would you like to access your wallet?',
          'keyStoreFile': 'Keystore File',
          'pageTitle': 'Cold Staking Operations - Testnet',
          'privateKey': 'Private Key',
          'loadWallet': 'Load Wallet',
          'walletAddress': 'Wallet Address',
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
          //'privateKeyForTest':'You can click here to enter the private key required to test the application.',  
          'privateKeyForTest': 'You can click here to enter required private key for testing.',
          //'privateKeyForTest_old':'You can use the following private key to test the application.',
          'transfer': 'Transfer',
          'targetWalletAddress': 'Target Wallet Address',
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
      var resourceKey = 'resources.' + this.get('config.currentLanguageKey') + '.' + key;
      var resourceValue = this.get(resourceKey);
      if (resourceValue) return resourceValue;
      return resourceKey;
    }
  });
});
define('zehirwallet/services/simulator', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({});
});
define("zehirwallet/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "WKXbOs/B", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"container callisto\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n        \"],[1,[18,\"outlet\"],false],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8]],\"hasEval\":false}", "meta": { "moduleName": "zehirwallet/templates/application.hbs" } });
});
define("zehirwallet/templates/components/button-confirm", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "q1x7NVvt", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1],[0,\"\\n\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "zehirwallet/templates/components/button-confirm.hbs" } });
});
define("zehirwallet/templates/components/button-default", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "4H5NaQa3", "block": "{\"symbols\":[],\"statements\":[[6,\"button\"],[9,\"type\",\"button\"],[10,\"class\",[18,\"buttonClass\"],null],[3,\"action\",[[19,0,[]],\"action\"]],[7],[0,\"\\n  \"],[1,[25,\"get-resource\",null,[[\"key\"],[[20,[\"buttonKey\"]]]]],false],[0,\"\\n\"],[8]],\"hasEval\":false}", "meta": { "moduleName": "zehirwallet/templates/components/button-default.hbs" } });
});
define("zehirwallet/templates/components/cs-simulator", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "XFT68Wiv", "block": "{\"symbols\":[\"&default\"],\"statements\":[[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n    \"],[6,\"h1\"],[7],[0,\"Cold Staking Simulator\"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\\n\"],[6,\"form\"],[9,\"class\",\"form-horizontal\"],[7],[0,\"\\n  \"],[6,\"fieldset\"],[7],[0,\"\\n    \"],[6,\"legend\"],[7],[0,\"Parameters\"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n      \"],[6,\"label\"],[9,\"class\",\"control-label col-sm-2\"],[9,\"for\",\"email\"],[7],[0,\"Email:\"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"col-sm-10\"],[7],[0,\"\\n        \"],[6,\"input\"],[9,\"type\",\"email\"],[9,\"class\",\"form-control\"],[9,\"id\",\"email\"],[9,\"placeholder\",\"Enter email\"],[9,\"name\",\"email\"],[7],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n      \"],[6,\"label\"],[9,\"class\",\"control-label col-sm-2\"],[9,\"for\",\"pwd\"],[7],[0,\"Password:\"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"col-sm-10\"],[7],[0,\"\\n        \"],[6,\"input\"],[9,\"type\",\"password\"],[9,\"class\",\"form-control\"],[9,\"id\",\"pwd\"],[9,\"placeholder\",\"Enter password\"],[9,\"name\",\"pwd\"],[7],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"col-sm-offset-2 col-sm-10\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"checkbox\"],[7],[0,\"\\n          \"],[6,\"label\"],[7],[6,\"input\"],[9,\"type\",\"checkbox\"],[9,\"name\",\"remember\"],[7],[8],[0,\" Remember me\"],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"col-sm-offset-2 col-sm-10\"],[7],[0,\"\\n        \"],[6,\"button\"],[9,\"type\",\"submit\"],[9,\"class\",\"btn btn-default\"],[7],[0,\"Submit\"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\\n\"],[11,1]],\"hasEval\":false}", "meta": { "moduleName": "zehirwallet/templates/components/cs-simulator.hbs" } });
});
define("zehirwallet/templates/components/get-resource", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "otJuxZot", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"resourceValue\"],false]],\"hasEval\":false}", "meta": { "moduleName": "zehirwallet/templates/components/get-resource.hbs" } });
});
define("zehirwallet/templates/components/input-file", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "kI++oc34", "block": "{\"symbols\":[\"&default\"],\"statements\":[[0,\"\\n\"],[6,\"span\"],[7],[0,\" \"],[1,[18,\"title\"],false],[0,\" \"],[8],[0,\"\\n\"],[6,\"i\"],[10,\"class\",[26,[[18,\"icon\"]]]],[7],[8],[0,\"\\n\"],[4,\"if\",[[20,[\"multiple\"]]],null,{\"statements\":[[0,\"    \"],[6,\"input\"],[9,\"type\",\"file\"],[9,\"multiple\",\"multiple\"],[7],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    \"],[6,\"input\"],[9,\"type\",\"file\"],[7],[8],[0,\"\\n\"]],\"parameters\":[]}],[11,1]],\"hasEval\":false}", "meta": { "moduleName": "zehirwallet/templates/components/input-file.hbs" } });
});
define("zehirwallet/templates/components/nav-bar", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "3tiRviEV", "block": "{\"symbols\":[],\"statements\":[[6,\"ul\"],[9,\"class\",\"nav navbar-nav\"],[7],[0,\"\\n  \"],[4,\"link-to\",[\"index\"],[[\"tagName\"],[\"li\"]],{\"statements\":[[6,\"a\"],[9,\"href\",\"\"],[7],[0,\"Cold Staking\"],[8]],\"parameters\":[]},null],[0,\"\\n\"],[8]],\"hasEval\":false}", "meta": { "moduleName": "zehirwallet/templates/components/nav-bar.hbs" } });
});
define("zehirwallet/templates/components/select-menu", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Pv+1t1Ur", "block": "{\"symbols\":[\"item\"],\"statements\":[[6,\"button\"],[9,\"type\",\"button\"],[9,\"data-toggle\",\"dropdown\"],[9,\"class\",\"btn btn-success dropdown-toggle\"],[7],[1,[25,\"if\",[[20,[\"selectedItem\",\"text\"]],[20,[\"selectedItem\",\"text\"]],[20,[\"title\"]]],null],false],[0,\"  \"],[6,\"span\"],[9,\"class\",\"caret\"],[7],[8],[8],[0,\"\\n\"],[6,\"ul\"],[9,\"class\",\"dropdown-menu\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"internalItems\"]]],null,{\"statements\":[[0,\"  \"],[6,\"li\"],[10,\"class\",[26,[[25,\"if\",[[25,\"eq\",[[20,[\"value\"]],[19,1,[\"value\"]]],null],\"active\",\"\"],null]]]],[7],[6,\"a\"],[9,\"href\",\"#\"],[3,\"action\",[[19,0,[]],\"selectItem\",[19,1,[]]]],[7],[1,[19,1,[\"text\"]],false],[8],[8],[0,\"\\n\"]],\"parameters\":[1]},null],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "zehirwallet/templates/components/select-menu.hbs" } });
});
define("zehirwallet/templates/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "pQyPF6jk", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"page-header\"],[7],[0,\"\\n  \"],[6,\"h4\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"applicationName\"]]],false],[0,\" \"],[6,\"small\"],[9,\"class\",\"pull-right\"],[7],[1,[20,[\"config\",\"currentNetwork\",\"description\"]],false],[8],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n    \"],[1,[25,\"select-menu\",null,[[\"items\",\"title\",\"value\",\"valueField\",\"textField\",\"onChange\"],[[20,[\"model\",\"networks\"]],\"Network\",[20,[\"config\",\"currentNetworkKey\"]],\"key\",\"description\",\"onChangeNetwork\"]]],false],[0,\"\\n    \"],[1,[25,\"select-menu\",null,[[\"items\",\"title\",\"value\",\"valueField\",\"textField\",\"onChange\",\"class\"],[[20,[\"model\",\"languages\"]],\"Language\",[20,[\"config\",\"currentLanguageKey\"]],\"value\",\"text\",\"onChangeLanguage\",\"pull-right\"]]],false],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\" \"],[8],[0,\"\\n\"],[4,\"if\",[[20,[\"selectedWallet\"]]],null,{\"statements\":[[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-6\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"panel panel-success\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-heading\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"panel-title\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.wallet\"]]],false],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-body\"],[7],[0,\"\\n        \"],[6,\"form\"],[7],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.walletAddress\"]]],false],[8],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control\",[20,[\"selectedWallet\",\"address\"]],true]]],false],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.balance\"]]],false],[8],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"input-group\"],[7],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control text-right\",[20,[\"balance\"]],\"true\"]]],false],[0,\"\\n              \"],[6,\"span\"],[9,\"class\",\"input-group-addon\"],[7],[0,\"\\n                \"],[1,[20,[\"config\",\"currentNetwork\",\"symbol\"]],false],[0,\"\\n              \"],[8],[0,\"\\n              \"],[6,\"div\"],[9,\"class\",\"input-group-btn\"],[7],[0,\"\\n                \"],[6,\"button\"],[9,\"class\",\"btn btn-success\"],[9,\"type\",\"button\"],[3,\"action\",[[19,0,[]],\"loadBalanceInfo\"]],[7],[0,\"\\n                  \"],[6,\"span\"],[9,\"class\",\"glyphicon glyphicon-refresh\"],[9,\"aria-hidden\",\"true\"],[7],[8],[0,\"\\n                \"],[8],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"btn-group\"],[7],[0,\"\\n            \"],[6,\"button\"],[9,\"class\",\"btn btn-sm btn-danger\"],[3,\"action\",[[19,0,[]],\"removeWalletInfo\"]],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.changeWallet\"]]],false],[8],[0,\"\\n          \"],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n\\n    \"],[6,\"div\"],[9,\"class\",\"panel panel-success\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-heading\"],[7],[0,\"\\n        \"],[6,\"h3\"],[9,\"class\",\"panel-title\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.transfer\"]]],false],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-body\"],[7],[0,\"\\n        \"],[6,\"form\"],[7],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.targetWalletAddress\"]]],false],[8],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\"],[\"text\",\"form-control\",[20,[\"targetWalletAddress\"]]]]],false],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.amountToSend\"]]],false],[8],[0,\"\\n\\n            \"],[6,\"div\"],[9,\"class\",\"input-group\"],[7],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"min\"],[\"number\",\"form-control text-right\",[20,[\"amountToSend\"]],1]]],false],[0,\"\\n              \"],[6,\"span\"],[9,\"class\",\"input-group-addon\"],[7],[0,\"\\n                \"],[1,[20,[\"config\",\"currentNetwork\",\"symbol\"]],false],[0,\"\\n              \"],[8],[0,\"\\n              \"],[6,\"div\"],[9,\"class\",\"input-group-btn\"],[7],[0,\"\\n                \"],[6,\"button\"],[10,\"class\",[26,[\"btn btn-success\",[25,\"if\",[[20,[\"sendToWalletIsDisabled\"]],\" disabled\",\"\"],null]]]],[9,\"type\",\"button\"],[3,\"action\",[[19,0,[]],\"sendToWallet\"]],[7],[0,\"\\n                  \"],[6,\"span\"],[9,\"class\",\"glyphicon glyphicon-send\"],[9,\"aria-hidden\",\"true\"],[7],[8],[0,\"\\n                \"],[8],[0,\"\\n              \"],[8],[0,\"\\n\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-6\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"panel panel-success\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-heading\"],[7],[0,\"\\n        \"],[6,\"h3\"],[9,\"class\",\"panel-title\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.coldStaking\"]]],false],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-body\"],[7],[0,\"\\n        \"],[6,\"form\"],[7],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.contractAddress\"]]],false],[8],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control\",[20,[\"contractAddress\"]],true]]],false],[0,\"\\n          \"],[8],[0,\"\\n\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.amount\"]]],false],[8],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"input-group\"],[7],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"min\"],[\"number\",\"form-control text-right\",[20,[\"amount\"]],1]]],false],[0,\"\\n              \"],[6,\"span\"],[9,\"class\",\"input-group-addon\"],[7],[0,\"\\n                \"],[1,[20,[\"config\",\"currentNetwork\",\"symbol\"]],false],[0,\"\\n              \"],[8],[0,\"\\n              \"],[6,\"div\"],[9,\"class\",\"input-group-btn\"],[7],[0,\"\\n                \"],[6,\"button\"],[10,\"class\",[26,[\"btn btn-success\",[25,\"if\",[[20,[\"sendToCsContractIsDisabled\"]],\" disabled\",\"\"],null]]]],[9,\"type\",\"button\"],[3,\"action\",[[19,0,[]],\"sendToCsContract\"]],[7],[0,\"\\n                  \"],[6,\"span\"],[9,\"class\",\"glyphicon glyphicon-send\"],[9,\"aria-hidden\",\"true\"],[7],[8],[0,\"\\n                \"],[8],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.stakeAmount\"]]],false],[8],[0,\"\\n\\n            \"],[6,\"div\"],[9,\"class\",\"input-group\"],[7],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control text-right\",[20,[\"stakeAmount\"]],true]]],false],[0,\"\\n              \"],[6,\"span\"],[9,\"class\",\"input-group-addon\"],[7],[0,\"\\n                \"],[1,[20,[\"config\",\"currentNetwork\",\"symbol\"]],false],[0,\"\\n              \"],[8],[0,\"\\n              \"],[6,\"div\"],[9,\"class\",\"input-group-btn\"],[7],[0,\"\\n                \"],[6,\"button\"],[9,\"class\",\"btn btn-success\"],[9,\"type\",\"button\"],[3,\"action\",[[19,0,[]],\"loadStakingInfo\"]],[7],[0,\"\\n                  \"],[6,\"span\"],[9,\"class\",\"glyphicon glyphicon-refresh\"],[9,\"aria-hidden\",\"true\"],[7],[8],[0,\"\\n                \"],[8],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.currentRewards\"]]],false],[8],[0,\"\\n\\n            \"],[6,\"div\"],[9,\"class\",\"input-group\"],[7],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control text-right\",[20,[\"currentRewards\"]],true]]],false],[0,\"\\n              \"],[6,\"span\"],[9,\"class\",\"input-group-addon\"],[7],[0,\"\\n                \"],[1,[20,[\"config\",\"currentNetwork\",\"symbol\"]],false],[0,\"\\n              \"],[8],[0,\"\\n              \"],[6,\"div\"],[9,\"class\",\"input-group-btn\"],[7],[0,\"\\n                \"],[6,\"button\"],[9,\"class\",\"btn btn-success\"],[9,\"type\",\"button\"],[3,\"action\",[[19,0,[]],\"loadStakingInfo\"]],[7],[0,\"\\n                  \"],[6,\"span\"],[9,\"class\",\"glyphicon glyphicon-refresh\"],[9,\"aria-hidden\",\"true\"],[7],[8],[0,\"\\n                \"],[8],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n            \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.stakeTime\"]]],false],[8],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control\",[20,[\"stakeTime\"]],true]]],false],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"col-sm-12 btn-group\"],[7],[0,\"\\n            \"],[6,\"button\"],[10,\"class\",[26,[\"btn btn-sm btn-success col-sm-6 \",[25,\"if\",[[20,[\"withdrawIsDisabled\"]],\"disabled\",\"\"],null]]]],[3,\"action\",[[19,0,[]],\"withdrawStake\"]],[7],[0,\"\\n              \"],[6,\"div\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.withdrawStake\"]]],false],[8],[0,\"\\n              \"],[6,\"span\"],[9,\"class\",\"badge\"],[7],[1,[18,\"allCoins\"],false],[8],[0,\"\\n            \"],[8],[0,\"\\n            \"],[6,\"button\"],[10,\"class\",[26,[\"btn btn-sm btn-success  col-sm-6 \",[25,\"if\",[[20,[\"withdrawIsDisabled\"]],\"disabled\",\"\"],null]]]],[3,\"action\",[[19,0,[]],\"withdrawClaim\"]],[7],[0,\"\\n              \"],[6,\"div\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.withdrawClaim\"]]],false],[8],[0,\"\\n              \"],[6,\"span\"],[9,\"class\",\"badge\"],[7],[1,[18,\"currentRewardsFormatted\"],false],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-6\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"panel with-nav-tabs panel-success\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-heading\"],[7],[0,\"\\n        \"],[6,\"h4\"],[9,\"class\",\"col-sm-12\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.questionForWalletAccessType\"]]],false],[8],[0,\"\\n        \"],[6,\"ul\"],[9,\"class\",\"nav nav-tabs\"],[7],[0,\"\\n          \"],[6,\"li\"],[9,\"class\",\"active\"],[7],[6,\"a\"],[9,\"href\",\"#tab1default\"],[9,\"data-toggle\",\"tab\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.keyStoreFile\"]]],false],[8],[8],[0,\"\\n          \"],[6,\"li\"],[7],[6,\"a\"],[9,\"href\",\"#tab2default\"],[9,\"data-toggle\",\"tab\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.privateKey\"]]],false],[8],[8],[0,\"\\n          \"],[6,\"li\"],[7],[6,\"a\"],[9,\"href\",\"#tabWalletAddress\"],[9,\"data-toggle\",\"tab\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.walletAddress\"]]],false],[8],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-body\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"tab-content\"],[7],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"tab-pane fade in active\"],[9,\"id\",\"tab1default\"],[7],[0,\"\\n\\n            \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n              \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.keyStoreFile\"]]],false],[8],[0,\"\\n              \"],[1,[25,\"input-file\",null,[[\"fileChanged\",\"class\",\"titleResourceKey\"],[\"selectKeyStoreFile\",\"form-control\",\"cs.selectKeyStoreFile\"]]],false],[0,\"\\n            \"],[8],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n              \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.password\"]]],false],[8],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"autocomplete\"],[\"password\",\"form-control\",[20,[\"password\"]],\"off\"]]],false],[0,\"\\n            \"],[8],[0,\"\\n            \"],[1,[25,\"button-default\",null,[[\"buttonKey\",\"action\"],[\"cs.loadWallet\",\"loginWithKeyStore\"]]],false],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"tab-pane fade\"],[9,\"id\",\"tab2default\"],[7],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n              \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.privateKey\"]]],false],[8],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"autocomplete\"],[\"password\",\"form-control\",[20,[\"privateKey\"]],\"off\"]]],false],[0,\"\\n            \"],[8],[0,\"\\n\\n            \"],[1,[25,\"button-default\",null,[[\"buttonKey\",\"action\"],[\"cs.loadWallet\",\"loginWithPrivateKey\"]]],false],[0,\"\\n\\n            \"],[6,\"hr\"],[9,\"class\",\"hidee\"],[7],[8],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"row pointer hidee\"],[7],[0,\"\\n              \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n                \"],[6,\"u\"],[7],[0,\"\\n                  \"],[6,\"i\"],[9,\"style\",\"cursor:pointer\"],[3,\"action\",[[19,0,[]],\"privateKeyForTest\"]],[7],[0,\"\\n                    \"],[6,\"a\"],[9,\"href\",\"#\"],[7],[0,\"\\n                      \"],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.privateKeyForTest\"]]],false],[0,\"\\n                    \"],[8],[0,\"\\n                  \"],[8],[0,\"\\n                \"],[8],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \\n          \"],[6,\"div\"],[9,\"class\",\"tab-pane fade\"],[9,\"id\",\"tabWalletAddress\"],[7],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n              \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.walletAddress\"]]],false],[8],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"autocomplete\"],[\"text\",\"form-control\",[20,[\"walletAddress\"]],\"off\"]]],false],[0,\"\\n            \"],[8],[0,\"\\n\\n            \"],[1,[25,\"button-default\",null,[[\"buttonKey\",\"action\"],[\"cs.loadWallet\",\"loginWithWalletAddress\"]]],false],[0,\"\\n          \"],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-6\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"panel panel-success\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-heading\"],[7],[0,\"\\n        \"],[1,[25,\"get-resource\",null,[[\"key\"],[\"createNewWallet\"]]],false],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"panel-body\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"form-group\"],[7],[0,\"\\n          \"],[6,\"label\"],[9,\"class\",\"control-label\"],[7],[1,[25,\"get-resource\",null,[[\"key\"],[\"cs.walletAddress\"]]],false],[8],[0,\"\\n          \"],[1,[25,\"input\",null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control\",[20,[\"selectedWallet\",\"address\"]],true]]],false],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"col-sm-12\"],[7],[0,\"\\n    \"],[6,\"span\"],[9,\"class\",\"pull-right\"],[7],[0,\"This is an open source project. \"],[6,\"a\"],[9,\"href\",\"https://zahirsolak.github.com/zehirwallet\"],[7],[0,\"github.com\"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8]],\"hasEval\":false}", "meta": { "moduleName": "zehirwallet/templates/index.hbs" } });
});
define("zehirwallet/templates/simulator", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "i3LiyuoI", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"cs-simulator\"],false],[0,\"\\n\"],[1,[18,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "zehirwallet/templates/simulator.hbs" } });
});


define('zehirwallet/config/environment', [], function() {
  var prefix = 'zehirwallet';
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
  require("zehirwallet/app")["default"].create({"name":"zehirwallet","version":"0.0.0+728b3a9a"});
}
//# sourceMappingURL=zehirwallet.map
