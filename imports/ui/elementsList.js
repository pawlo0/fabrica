import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AutoForm } from 'meteor/aldeed:autoform';
import { $ } from 'meteor/jquery';

import { Elements } from '../api/elements.js';
import { Categories } from '../api/categories.js';

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


Template.addElement.onCreated(function(){
    this.addElementFormType = new ReactiveVar(false);
});

Template.addElement.helpers({
    'elements'(){
        return Elements;
    },
    'duplicateAlert'(){
        return Session.get('duplicateAlert');
    },
    'addElementFormType'(){
        return Template.instance().addElementFormType.get();
    }
});

Template.addElement.events({
    'change select[name="elementType"]'(event, template){
        // This is to give a default element number
        // The user can change it tough.
        for (var number = 1; number < 9999; number++){
            if (Elements.findOne({elementType: event.target.value, elementNumber: number})){
                continue;
            } else {
                $('input[name="elementNumber"]').val(number);
                break;
            }
        }
        
        // This is to change the form as the user chooses diferent types of elements
        let formType = {};
        formType[Categories.findOne(event.target.value).type] = true;
        template.addElementFormType.set(formType);
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
            } else {
                console.log(error);
            }
        },
    }
});
