import Component from '@ember/component';

export default Component.extend({
  /* Resources */
  buttonKey: "buttonKey",
  buttonClass:"btn btn-sm btn-success",
  actions:{
    action:function(){
        this.sendAction("action");
    }
  }
});
