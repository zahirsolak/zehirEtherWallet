import config from '../config/environment';
import EmberObject from '@ember/object';

export function initialize(application) {

  application.register('config:main', EmberObject.extend(config));
  application.inject('route', 'config', 'config:main');
  application.inject('controller', 'config', 'config:main');
  application.inject('component', 'config', 'config:main');
}

export default {
  name: "config",
  initialize
};
