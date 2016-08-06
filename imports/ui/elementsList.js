import { Modal } from 'meteor/peppelg:bootstrap-3-modal';

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
    }
})