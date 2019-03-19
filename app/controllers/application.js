import Controller from '@ember/controller';
import {computed} from '@ember/object';
export default Controller.extend({
    languages: computed(function () {
        let array = [];
        let source = this.get('language');
        for (let element in source) {
          array.push(source[element]);
        }
        return array;
      }),
      networks: computed("network",function () {
        let array = [];
        let source = this.get('network');
        for (let element in source) {
          array.push(source[element]);
        }
        return array;
      })
});
