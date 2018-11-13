import Controller from '@ember/controller';
import Ember from 'ember';
import {
  computed,
  observer
} from '@ember/object';
import ethers from 'ethers';
import moment from 'moment';

export default Controller.extend({
  networks: computed(function () {
    let array = [];
    let source = this.get('config.network');
    for (let element in source) {
      array.push(source[element]);
    }
    return array;
  }),
  provider: computed('config.currentNetwork', function () {
    return new ethers.providers.JsonRpcProvider(this.get('config.currentNetwork.url'));
  }),
  currentNetworkKeyChanged: observer('config.currentNetworkKey', function () {
    this.set('config.currentNetwork', this.get(`config.network.${this.get('config.currentNetworkKey')}`));
    document.title = this.get('config.currentNetwork.description');
  }),
  selectedWallet: null,
  privateKey: '',
  keyStoreJson: '',
  amount: 0,
  contractAddress: computed(function () {
    return this.get('config.coldStaking.contractAddress');
  }),
  targetWalletAdress: '',
  logs: [],
  withdrawIsDisabled: computed('currentRewards', function () {
    return parseFloat(this.get('currentRewards')) == 0;
  }),
  sendToCsContractIsDisabled: computed('balance', 'amount', function () {
    return !this.get('amount') || !this.get('balance') || parseFloat(this.get('balance')) < 0 || parseFloat(this.get('amount')) < 1 ||
      parseFloat(this.get('balance')) < parseFloat(this.get('amount'));
  }),
  sendToWalletIsDisabled: computed('balance', 'amountToSend', 'targetWalletAdress', function () {
    return !this.get('amountToSend') || !this.get('balance') || parseFloat(this.get('balance')) < 0 || parseFloat(this.get('amountToSend')) < 1 ||
      parseFloat(this.get('balance')) < parseFloat(this.get('amountToSend')) ||
      !this.get('targetWalletAdress');
  }),
  allCoins: computed('currentRewards', 'stakeAmount', function () {
    let currentRewards = this.get('currentRewards'),
      stakeAmount = this.get('stakeAmount');
    let allCoins = (currentRewards ? parseFloat(currentRewards) : 0) + (stakeAmount ? parseFloat(stakeAmount) : 0);
    return allCoins.toFixed(2);
  }),
  currentRewardsFormatted: computed('currentRewards', 'stakeAmount', function () {
    return (this.get('currentRewards') ? parseFloat(this.get('currentRewards')) : 0).toFixed(2);
  }),
  showInfo(type,message){
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
  addInfo(message) {
    this.showInfo("info",message);
  },
  addSuccess(message) {
    this.showInfo("success",message);
  },
  addError(message) {
    this.showInfo("error",message);
  },

  actions: {
    selectKeyStoreFile(result) {
      if (result.files.length > 0) {
        result.files[0].readAsText(keyStore => {
          this.set('keyStoreJson', keyStore);
        });
      }
    },
    privateKeyForTest() {
      this.set('privateKey', this.get('config.privateKeyForTest'));
    },
    sendToCsContract() {
      if (this.get('sendToCsContractIsDisabled')) return;
      let contractAddress = this.get('contractAddress');
      let provider = this.get('provider');
      let wallet = this.get('selectedWallet');
      let amountTmp = this.get("amount");
      let amount = ethers.utils.parseEther(amountTmp);

      let confirmMessage = this.get('resource').getResource('cs.sendToCsContract_confirmMessage');

      if (!confirm(confirmMessage.replace('|amount|', amountTmp)))
        return;
      let overrides = this.get('overrides');
      new Ember.RSVP.hash({
          "nonce": wallet.getTransactionCount("latest")
        })
        .then(result => {
          let tx = {
            nonce: result.nonce,
            to: contractAddress,
            value: amount,

            chainId: overrides.chainId,
            gasPrice: overrides.gasPrice,
            gasLimit: overrides.gasLimit
          };
          wallet.sign(tx)
            .then(signedTransaction =>
              provider.sendTransaction(signedTransaction)
              .then(t => {
                this.addSuccess(`Sent To Contract. TX ID: ${t.hash}`);
                this.set('amount', 0);
              })).catch(err => this.addError(err));
        }).catch(err => this.addError(err));
    },
    sendToWallet() {
      if (this.get('sendToWalletIsDisabled')) return;
      let targetWalletAdress = this.get('targetWalletAdress');
      let provider = this.get('provider');
      let wallet = this.get('selectedWallet');
      let amountTmp = this.get("amountToSend");
      let amount = ethers.utils.parseEther(amountTmp);

      let confirmMessage = this.get('resource').getResource('cs.sendToWalletConfirmMessage')
        .replace('|amount|', amountTmp).replace('|walletAddress|', targetWalletAdress);

      if (!confirm(confirmMessage))
        return;
      let overrides = this.get('overrides');
      new Ember.RSVP.hash({
          "nonce": wallet.getTransactionCount("latest")
        })
        .then(result => {
          let tx = {
            nonce: result.nonce,
            to: targetWalletAdress,
            value: amount,
            chainId: overrides.chainId,
            gasPrice: overrides.gasPrice,
            gasLimit: overrides.gasLimit
          };
          wallet.sign(tx)
            .then(signedTransaction =>
              provider.sendTransaction(signedTransaction)
              .then(t => {
                this.addSuccess(`Sent To Wallet. TX ID: ${t.hash}`);
                this.set('amountToSend', 0);
              })).catch(err => this.addError(err));
        }).catch(err => this.addError(err));
    },
    loadInfo() {
      if (this.get('selectedWallet')) {
        this.send('loadBalanceInfo');
        this.send('loadStakingInfo');
      }
    },
    loadStakingInfo() {
      try {
        this.set('currentRewards', 0);
        this.set('stakeAmount', null);
        this.set('stakeTime', null);
        let contract = this.get('contract');
        let walletAddress = this.get('selectedWallet.address');
        contract.stake_reward(walletAddress)
          .then(currentRewards => {
            this.set('currentRewards', ethers.utils.formatEther(currentRewards));
          }).catch(() => {});
        contract.staker(walletAddress)
          .then(staker => {
            this.set('stakeAmount', ethers.utils.formatEther(staker.amount));
            let stakeTime = new Date(parseInt(staker.time.toString()) * 1000);
            let that = this;
            if (this.get('stakeTimeTimerId'))
              window.clearTimeout(this.get('stakeTimeTimerId'));
            let stakeTimeTimerId = countdown(moment(stakeTime),
              function (ts) {
                that.set('stakeTime', that.get('stakeAmount') > 0 ? ts.toString() : '');
              });
            this.set('stakeTimeTimerId', stakeTimeTimerId);
          }).catch(err => this.addError(err));
      } catch (err) {
        this.addError(err);
      }
    },
    loadBalanceInfo() {
      try {
        this.set('balance', null);
        this.get('selectedWallet').getBalance().then(balance => {
          this.set('balance', ethers.utils.formatEther(balance));
        });
      } catch (err) {
        this.addError(err);
      }
    },
    withdrawStake() {
      if (this.get('withdrawIsDisabled')) return;
      try {
        let contract = this.get('contract');
        let overrides = this.get('overrides');
        contract.withdraw_stake(overrides).then(() => this.send('loadInfo')).catch(err => this.addError(err));
      } catch (err) {
        this.addError(err);
      }
    },
    withdrawClaim() {
      if (this.get('withdrawIsDisabled')) return;
      try {
        let contract = this.get('contract');
        let overrides = this.get('overrides');
        contract.claim(overrides).then(() => this.send('loadInfo')).catch(err => this.addError(err));
      } catch (error) {
        this.addError(error);
      }
    },
    selectWallet(accessType) {
      let provider = this.get("provider");

      this.set('overrides', {
        "chainId": this.get('config.currentNetwork.chainId'),
        "gasLimit": this.get('config.currentNetwork.gasLimit'),
        "gasPrice": this.get('provider').getGasPrice()
      });

      try {



        new Ember.RSVP.hash({
          "wallet": new Ember.RSVP.Promise(walletResolve => {
            if (accessType == "keyStoreFile") {
              ethers.Wallet.fromEncryptedJson(this.get('keyStoreJson'), this.get('password')).then(decryptedWallet => {
                  walletResolve(new ethers.Wallet(decryptedWallet.privateKey, provider));
                })
                .catch(error => this.addError(error));
            } else if (accessType == "privateKey") {
              let privateKey = this.get('privateKey');
              if (!privateKey)
                this.addError("Private Key is invalid!");
              else {
                walletResolve(new ethers.Wallet(privateKey, provider));
              }
            }
          })
        }).then(result => {
          let wallet = result.wallet;
          if (!wallet) return;
          this.set("selectedWallet", wallet);
          let contract = new ethers.Contract(this.get('contractAddress'), this.get('config.coldStaking.contractAbi'), wallet);
          contract.on('StartStaking', (addr, value, amount, time) => {
            if (addr == wallet.address) {
              this.addSuccess(`Started Staking. Params => addr:${addr}, value:${ethers.utils.formatEther(value)}, amount:${ethers.utils.formatEther(amount)}, time:${moment(new Date(parseInt(time.toString()) * 1000)).format()}`);
              this.send('loadInfo');
            }
          });
          contract.on('WithdrawStake', (staker, amount) => {
            if (staker == wallet.address) {
              this.addSuccess(`Withdrawed Stake. Params => staker:${staker}, amount:${ethers.utils.formatEther(amount)}`);
              this.send('loadInfo');
            }
          });
          contract.on('Claim', (staker, reward) => {
            if (staker == wallet.address) {
              this.addSuccess(`Claimed Reward. Params => staker:${staker}, reward:${ethers.utils.formatEther(reward)}`);
              this.send('loadInfo');
            }
          });

          this.set('contract', contract);
          this.send('loadInfo');
        })

      } catch (error) {
        this.addError(error);
      }
    },
    removeWalletInfo() {
      this.set("selectedWallet", null);
      this.set('privateKey', null);
      this.set('keyStoreJson', null);
      this.set('password', null);
    },
    changeNetwork(key) {
      this.set('config.currentNetworkKey', key);
      this.send('removeWalletInfo');
    },
    changeLanguage(language) {
      this.set("resource.language", language);
      moment.locale(language);
      if (language == 'tr')
        countdown.setLabels(
          ' millisaniye| saniye| dakika| saat| gün| hafta| ay| yıl| onyıl| yüzyıl| binyıl',
          ' millisaniye| saniye| dakika| saat| gün| hafta| ay| yıl| onyıl| yüzyıl| binyıl',
          ' ve ',
          ', ',
          '',
          function (n) {
            return n.toString();
          });
      else
        countdown.resetLabels();
      this.send('loadInfo');
    }
  }
});
