import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { T9n } from 'meteor/softwarerero:accounts-t9n';

import '../api/users.js';
import './navbar.html';

Template.navbar.events({
    'click .js-loginButton'(event) {
        event.preventDefault();
        Modal.show('login');
    },
    'click .js-logoutButton'(event){
        event.preventDefault();
        AccountsTemplates.logout();
    }
});

T9n.setLanguage('pt-PT');

