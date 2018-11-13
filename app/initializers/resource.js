export function initialize(application) {
  application.inject('route', 'resource', 'service:resource');
  application.inject('controller', 'resource', 'service:resource');
  application.inject('component', 'resource', 'service:resource');
}

export default {
  name:'resource',
  initialize
};
