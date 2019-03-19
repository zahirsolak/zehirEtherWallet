import Component from '@ember/component';
import {
  observer
} from '@ember/object';
export default Component.extend({
  tagName:"",
  key: null,
  languageChanged: observer('config.currentLanguageKey', function () {
    this.getResource();
  }),
  resourceValue: null,
  getResource() {
    let val =  this.get('resource').getResource(this.get('key'));
    this.set("resourceValue", val);
  },
  didRender: function () {
    this.getResource();
  }.on('didInsertElement')
});
