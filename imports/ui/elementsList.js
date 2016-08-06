import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AutoForm } from 'meteor/aldeed:autoform';

import { Elements } from '../api/elements.js';

import './elementsList.html';


Template.elementsList.onCreated(function(){
    const self = this;
    self.autorun(function(){
        self.subscribe('categories');
    });
});

Template.elementsList.events({
    'click .js-addElement'(event){
        Modal.show('addElement');
    }
});




Template.addElement.helpers({
    'elements'(){
        return Elements;
    },
    'duplicateAlert'(){
        return Session.get('duplicateAlert');
    }
});


AutoForm.hooks({
    addElementForm: {
        onSuccess: function(formType, result) {
            Session.set('duplicateAlert', false);
            Modal.hide('addElement');
        },
        onError: function(formType, error) {
            if (error.error === 'Duplicate error') {
                Session.set('duplicateAlert', true);
            }
        },
    }
});
