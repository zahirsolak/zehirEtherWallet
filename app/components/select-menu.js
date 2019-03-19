import Component from '@ember/component';
import {computed} from '@ember/object';

//Using: {{select-menu items=model.networks title="Network" value=config.currentNetworkKey valueField="key" textField="description" onChange="onChangeNetwork"}}
export default Component.extend({
  title: "Title",
  tagName: "div",
  class: null,
  defaultClass: "btn-group",
  classNameBindings: ["class","defaultClass"],
  items: [],
  textField: "text",
  valueField: "value",
  selectedItem: null,
  internalItems: computed("items", function () {
    let valueField = this.get("valueField"),
      textField = this.get("textField");
      if(!this.get("items"))return [];
    let result = this.get("items").map(item => {
      return {
        text: item[textField],
        value: item[valueField],
        data: item
      }
    });
    return result;
  }),
  didInsertDropdown:function(){
    let selectedValue = this.get("value");
    if(selectedValue){
      let items = this.get('internalItems').filter(function(item){return item.value==selectedValue});
      if(items.length==1) this.set('selectedItem', items[0]);
    }
  }.on("didInsertElement"),
  actions: {
    selectItem(selectedItem) {
      this.set('selectedItem', selectedItem);
      this.sendAction("onChange",selectedItem);
    }
  }
});
