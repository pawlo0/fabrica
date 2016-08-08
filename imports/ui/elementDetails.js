import { FlowRouter } from 'meteor/kadira:flow-router';
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AutoForm } from 'meteor/aldeed:autoform';

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
        formType[Template.currentData().elementFormType] = true;
        return formType;
    },
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