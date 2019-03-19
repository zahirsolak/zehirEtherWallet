import Service from '@ember/service';

export default Service.extend({
   
    confirm(){
    },
    templates:{
        confirm:`
        <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">{{get-resource key=titleKey}}</h4>
              </div>
              <div class="modal-body">
                {{get-resource key=messageKey}}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal" {{action "cancel"}}>{{get-resource key=cancelKey}}</button>
                <button type="button" class="btn btn-primary" {{action "ok"}}>{{get-resource key=okKey}}</button>
              </div>
            </div>
          </div>
        </div>`
    },

});
