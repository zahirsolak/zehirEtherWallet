import Route from '@ember/routing/route';
import moment from 'moment';

export default Route.extend({
  model() {

    this.set('config.currentNetworkKey', this.get('config.defaultNetworkKey'));
    this.set('config.currentLanguageKey', this.get('config.defaultLanguageKey'));
    moment.locale(this.get('config.currentLanguageKey'));

    let languages = [];
    let items = this.get('config.language');
    for (let element in items) {
      languages.push(items[element]);
    }
    let networks = [];
    items = this.get('config.network');
    for (let element in items) {
      networks.push(items[element]);
    }
    return {
      languages,
      networks
    };
  }
});
