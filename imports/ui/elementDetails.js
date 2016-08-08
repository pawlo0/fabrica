import { FlowRouter } from 'meteor/kadira:flow-router';

import { Elements } from '../api/elements.js';

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
    }
})