import { FlowRouter } from 'meteor/kadira:flow-router';
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AutoForm } from 'meteor/aldeed:autoform';

import { removeElement } from '../api/elements.js';

import { Elements } from '../api/elements.js';
import { Categories } from '../api/categories.js';

import './elementDetails.html';

Template.elementDetails.onCreated(function(){
   const self = this;

   self.autorun(function(){
       self.subscribe('singleElement', FlowRouter.getParam('Id'));
   });
});

Template.elementDetails.helpers({
    'element'(){
        return Elements.findOne({_id: FlowRouter.getParam('Id')});
    },
    'formType'() {
        let formType = {};
        formType[Elements.findOne({_id: FlowRouter.getParam('Id')}).elementFormType] = true;
        return formType;
    },
    'isDigitalTranslated'(){
        return this.isDigital ? 'Sim' : 'Não';
    },
    'manager'(){
        return Meteor.user() && (Meteor.user().profile.manager || Meteor.user().profile.admin) ? true : false;
    },
    'hasPeriodicity'(){
        return this.frequencyMonths > 0 ? true : false;
    },
    'isOnTime'(){
        return true;
    }
});

Template.elementDetails.events({
    'click .js-showEditElementModal'(event){
        Modal.show('editElementModal', ()=>{
            return Elements.findOne(this._id);
        });
    }
});

Template.editElementModal.onCreated(function(){
   const self = this;

   self.autorun(function(){
       self.subscribe('categories');
   });
});

Template.editElementModal.helpers({
    'elements'(){
        return Elements;
    },
    'formType'() {
        let formType = {};
        // Need this 'if' for when deleting element, the user is re-directed to '/elements' route.
        // The template is destroyed while the modal is fadding out, that causes an error in this helper
        // Without this there would be an error in the console.
        if(Template.currentData()){
            formType[this.elementFormType] = true;
            return formType;
        }
    },
    'elementInitials'(){
        // Need this 'if' for when deleting element, the user is re-directed to '/elements' route.
        // Without this there would be an error in the console.
        if(Template.currentData()){
            return this.elementId.split('-')[0];
        }
    },
    'manager'(){
        return Meteor.user().profile.manager || Meteor.user().profile.admin ? true : false;
    }
});

Template.editElementModal.events({
    'click .js-removeElement'(event){
        Modal.hide('editElementModal');
        FlowRouter.go('/elements');
        removeElement.call(this._id);
    }
});

AutoForm.hooks({
    editElementForm: {
        onSuccess: function(formType, result) {
            Session.set('duplicateAlert', false);
            Modal.hide('editElementModal');
        },
        onError: function(formType, error) {
            if (error.error === 'Duplicate error') {
                Session.set('duplicateAlert', true);
            } else {
                console.log(error);
            }
        },
    }
});