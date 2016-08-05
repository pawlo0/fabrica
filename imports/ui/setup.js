import { Plants } from '../api/plants.js';

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
    }
});
