import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
  /* Resources */

  tagName:"div",
  buttonKey: "",
  titleKey: "titleKey",
  messageKey: "messageKey",
  cancelKey: "cancelKey",
  okKey: "okKey",
  buttonClass:"btn btn-sm btn-success",
  click(){
    //Ember.$("#buttonConfirm").modal("show");
    Ember.$("#exampleModalPopovers").modal("show");
  },
  actions:{
    // showModal:function(){
    //     this.$(".modal").modal("show");
    // },
    ok:function(){
        //this.$(".modal").modal("hide");
        this.sendAction("ok");
        //this.$(".modal").modal("hide");
    },
    cancel:function(){
        this.sendAction("cancel");
        //this.$(".modal").modal("hide");
    }
  }
});
