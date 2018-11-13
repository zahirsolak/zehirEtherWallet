import Route from '@ember/routing/route';
import Ember from 'ember';
import moment from 'moment';
import {
  observer,
  computed
} from '@ember/object';

export default Route.extend({
  model() {
    moment.locale(this.get('resource.language'));
    this.set('config.currentNetworkKey', this.get('config.defaultNetworkKey'));
  }
});
