import Component from '@ember/component';
import {
  observer
} from '@ember/object';

// SafeMath Methods

let require = function (condition, message) {
  if (!message) message = "invalid condition";
  if (!condition) throw message;
  return condition;
};
let Staker = function (amount, time) {
  this.amount = amount;
  this.time = time;
  return this;
};

export default Component.extend({
  mul(a, b) {
    if (a == 0) {
      return 0;
    }
    let c = a * b;
    require(c / a == b);
    return c;
  },

  div(a, b) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    let c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  },
  sub(a, b) {
    require(b <= a);
    return a - b;
  },
  add(a, b) {
    let c = a + b;
    require(c >= a);
    return c;
  },
  blockNumber: 1000000,
  LastBlock: observer('blockNumber', function () {
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
  contractBalance:0,

  // methods
  freeze(_f) {
    this.only_treasurer();
    this.set('CS_frozen', _f);
  },
  withdraw_rewards() {
    this.only_treasurer();
    if (this.get('CS_frozen')) {
      this.set('StakingRewardPool', this.sub(this.get('contractBalance'), this.get('TotalStakingAmount')));
      //Treasury.transfer(StakingRewardPool);
      alert('Transferred StakingRewardPool('+this.get('StakingRewardPool')+') to Treasury.');
    }
  },

  // modifiers
  only_staker() {
    require(this.getStaker(this.get('msg.sender'), "only_staker").amount > 0);
  },
  staking_available() {
    require(this.get('now') >= this.get('DateStartStaking', "staking_available") && !this.get('CS_frozen'));
  },
  only_treasurer() {
    require(this.get('msg.sender') == this.get('Treasury'), "only_treasurer");
  },

  // helper methods
  getStaker(address) {
    let key = 'staker.' + address;
    let staker = this.get(key);
    if (!staker) {
      this.set(key, new Staker(0, 0));
    }
    return this.get(key);
  }
});
