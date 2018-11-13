import Component from '@ember/component';
import Ember from 'ember';
import {
  observer
} from '@ember/object';
export default Component.extend({
  tagName:"",
  resourceService: Ember.inject.service('resource'),
  key: null,
  languageChanged: observer('resourceService.language', function () {
    this.loadResource();
  }),
  resourceValue: null,
  loadResource() {
    this.set("resourceValue", this.get('resourceService').getResource(this.get('key')));
  },
  didRender: function () {
    this.loadResource();
  }.on('didRender')
});
