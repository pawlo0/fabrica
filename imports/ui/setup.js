import { Plants } from '../api/plants.js';
import { Categories } from '../api/categories.js';
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AutoForm } from 'meteor/aldeed:autoform';
import { $ } from 'meteor/jquery';
import './setup.html';

Template.setup.onCreated(function() {
    let self = this;
    self.autorun(function() {
        self.subscribe('plants');
        self.subscribe('categories');
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
    },
    'dblclick #categoriesTabular tbody > tr': function (event) {
        var dataTable = $(event.target).closest('table').DataTable();
        var rowData = dataTable.row(event.currentTarget).data();
        if (!rowData) return; // Won't be data if a placeholder row is clicked
        Modal.show('categoryEdit', ()=>{
            return Categories.findOne(rowData._id);
        });
    }
});


Template.categoryEdit.helpers({
    'categories'(){
        return Categories;
    },
    'duplicateAlert'(){
        return Session.get('duplicateAlert');
    }
});

Template.categoryEdit.events({
    'click .js-eraseDuplicateAlert'(event){
        Session.set('duplicateAlert', false);
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