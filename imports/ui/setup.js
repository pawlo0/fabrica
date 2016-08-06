import { Plants } from '../api/plants.js';
import { Categories } from '../api/categories.js';
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
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
    }
})