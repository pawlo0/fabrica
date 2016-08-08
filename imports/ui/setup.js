import { Plants } from '../api/plants.js';
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AutoForm } from 'meteor/aldeed:autoform';

import { deleteCategory } from '../api/categories.js';

import { Categories } from '../api/categories.js';
import { Elements } from '../api/elements.js';

import './setup.html';

Template.setup.onCreated(function() {
    let self = this;
    self.autorun(function() {
        self.subscribe('plants');
        self.subscribe('categories');
        self.subscribe('elements');
    });
});

Template.setup.helpers({
    'manager'(){
        if (Meteor.user()){
            return Meteor.user().profile.manager;
        }
    },
    'admin'(){
        if (Meteor.user()){
            return Meteor.user().profile.admin;
        }
    },
    'plants'(){
        return Plants;
    },
    'categories'(){
        return Categories;
    },
    'duplicateAlert'(){
        return Session.get('duplicateAlert');
    }
});

Template.setup.events({
    'keyup .js-toUpperCase'(event){
        event.currentTarget.value = event.currentTarget.value.toUpperCase(); 
    }
});


Template.categoryEdit.helpers({
    'categories'(){
        return Categories;
    },
    'duplicateAlert'(){
        return Session.get('duplicateAlert');
    },
    'noElementsOfThisCategory'(){
        // Could write this helper simpler but wrote this way to avoid console error when deleting category
        if (Template.currentData() && Elements.find({plant: Template.currentData().plant, elementType: Template.currentData().categoryName}).count() === 0) {
            return true;
        }
    }
});

Template.categoryEdit.events({
    'click .js-eraseDuplicateAlert'(event){
        Session.set('duplicateAlert', false);
    },
    'keyup .js-toUpperCase'(event){
        event.currentTarget.value = event.currentTarget.value.toUpperCase(); 
    },
    'click .js-deleteCategory'(event){
        deleteCategory.call(this._id);
        Modal.hide('categoryEdit');
    }
});

Template.categoryDetailsButton.events({
    'click .js-showCategoryEdittModal'(event){
        Modal.show('categoryEdit', ()=>{
            return Categories.findOne(this._id);
        });
    }
});

AutoForm.hooks({
    newCategoryForm: {
        onSuccess: function(formType, result) {
            Session.set('duplicateAlert', false);
        },
        onError: function(formType, error) {
            if (error.error === 'Duplicate error') {
                Session.set('duplicateAlert', true);
            } else {
                console.log(error);
            }
        },
    },
    editCategoryForm: {
        onSuccess: function(formType, result) {
            Session.set('duplicateAlert', false);
            Modal.hide('categoryEdit');
        },
        onError: function(formType, error) {
            if (error.error === 'Duplicate error') {
                Session.set('duplicateAlert', true);
            } else {
                console.log(error);
            }
        }        
    }
});