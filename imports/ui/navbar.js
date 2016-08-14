import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { T9n } from 'meteor/softwarerero:accounts-t9n';
import { FlowRouter } from 'meteor/kadira:flow-router';

import '../api/users.js';
import './navbar.html';

Template.navbar.helpers({
    'manager'(){
        if (Meteor.user()) {
            return Meteor.user().profile.manager;
        }
    }
});

Template.navbar.events({
    'click .js-loginButton'(event) {
        event.preventDefault();
        Modal.show('login');
    },
    'click .js-logoutButton'(event){
        event.preventDefault();
        FlowRouter.go('/');
        AccountsTemplates.logout();
    }
});

T9n.setLanguage('pt-PT');

