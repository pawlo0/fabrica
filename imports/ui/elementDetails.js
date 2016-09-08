import { FlowRouter } from 'meteor/kadira:flow-router';
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AutoForm } from 'meteor/aldeed:autoform';
import { moment } from 'meteor/momentjs:moment';

import { removeElement } from '../api/elements.js';

import { Elements } from '../api/elements.js';
import { Categories } from '../api/categories.js';
import { Actions } from '../api/actions.js';

import './elementDetails.html';

Template.elementDetails.onCreated(function(){
   const self = this;

   self.autorun(function(){
       self.subscribe('singleElement', FlowRouter.getParam('Id'));
       self.subscribe('actions', FlowRouter.getParam('Id'));
       // Making a reactive var, with the lastAction for this element.
       const lastAction = Actions.findOne({elementId: FlowRouter.getParam('Id')}, {sort: {madeAt: -1}});
       if (lastAction) {
           const element = Elements.findOne(FlowRouter.getParam('Id'));
           // Calculates the nextActionDate from the element's frequency months
           self.nextActionDate = new ReactiveVar( new Date(new Date(lastAction.madeAt).setMonth(lastAction.madeAt.getMonth() + element.frequencyMonths)) );
           if(element.frequencyHours) {
               // Calculates the nextActionHours from the element's frequency hours
               self.nextActionHours = new ReactiveVar( lastAction.hours + element.frequencyHours );
           }
       }
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
    'nextActionDate'(){
        const nextActionDate = Template.instance().nextActionDate;
        return nextActionDate ? moment(nextActionDate.get()).format("YYYY-MM-DD") : "";
    },
    'nextActionHours'(){
        const nextActionHours = Template.instance().nextActionHours;
        return nextActionHours ? nextActionHours.get() : "";
    },
    'isOnTime'(){
        const nextActionDate = Template.instance().nextActionDate;
        const nextActionHours = Template.instance().nextActionHours;
        const lastAction = Actions.findOne({elementId: FlowRouter.getParam('Id')}, {sort: {madeAt: -1}});
        // If there's a frequency established for this elements but there's no actions, then it isn't on time.
        if (!lastAction && this.frequencyMonths) {
            return false;
        }
        // If nextActionDate is inferior than today, than it isn't on time.
        if (nextActionDate && nextActionDate.get() < new Date()) {
            return false;
        }
        // If there's frenquencyHours established for this elements and the nextActionHours is inferior than the hours registered in the last action
        // then it isn't on time.
        if (this.frequencyMonths && nextActionHours && nextActionHours.get() < lastAction.hours + this.frequencyMonths){
            return false;
        }
        // If it arrived here, then it is on time.
        return true;
    },
    'actionsForThisElement'(){
        return Actions.find({elementId: FlowRouter.getParam('Id')}).count() === 0 ? false : Actions.find({elementId: FlowRouter.getParam('Id')}, {sort: {madeAt: -1}});
    },
    'formatDate'(date){
        return moment(date).format("YYYY-MM-DD");
    },
    'maintenanceType'(actionType){
        if (actionType === 'repair') {
            return "Reparação";
        }
        if (actionType === 'preventive') {
            return "Manutenção Preventiva";
        }
    },
    'wasDateThatExpired'(){
        const nextActionDate = Template.instance().nextActionDate;
        return nextActionDate && nextActionDate.get() < new Date() ? true : false;
    }
});

Template.elementDetails.events({
    'click .js-showEditElementModal'(event){
        Modal.show('editElementModal', ()=>{
            return Elements.findOne(this._id);
        });
    },
    'click .js-addActionModal'(event){
        Modal.show('addActionModal', () => {
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

Template.addActionModal.helpers({
    'actions'(){
        return Actions;
    },
    'formType'(){
        let formType = {};
        formType[this.elementFormType] = true;
        return formType;
    },
    'actionTypeOptions'(){
        return [
                {value: 'repair', label: 'Reparação'},
                {value: 'preventive', label: 'Manutenção preventiva'},
                {value: 'hoursRegister', label: 'Registo Horas'}
            ];
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
    },
    insertActionForm: {
        before: {
            method(doc){
                doc.plant = Meteor.user().profile.plant;
                doc.elementId = Elements.findOne(FlowRouter.getParam('Id'))._id;
                doc.element = Elements.findOne(FlowRouter.getParam('Id')).elementId;
                return doc;
            }
        },
        onSuccess: function(formType, result) {
            Modal.hide('addActionModal');
        },
    }
});