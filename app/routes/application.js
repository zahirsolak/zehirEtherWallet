import Route from '@ember/routing/route';
import moment from 'moment';

export default Route.extend({
  model() {
    moment.locale(this.get('resource.language'));
    this.set('config.currentNetworkKey', this.get('config.defaultNetworkKey'));
  }
});
