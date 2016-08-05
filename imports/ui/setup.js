import { Plants } from '../api/plants.js';
import { Categories } from '../api/categories.js';
import './setup.html';

Template.setup.onCreated(function() {
    let self = this;
    self.autorun(function() {
        self.subscribe('plants');
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
    }
})