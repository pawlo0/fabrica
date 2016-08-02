import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { T9n } from 'meteor/softwarerero:accounts-t9n';

import './navbar.html';

Template.navbar.events({
    'click .js-loginButton'(event) {
        Modal.show('login');
    },
    'click .js-logoutButton'(event){
        AccountsTemplates.logout();
    }
});

T9n.setLanguage('pt-PT');

AccountsTemplates.configure({
    forbidClientAccountCreation: true,
	onSubmitHook: (error, state) => {
		if (!error) {
			if (state === "signIn") {
				// Successfully logged in
				// ...
				Modal.hide('login');
			}
				if (state === "signUp") {
				// Successfully registered
				// ...
				Modal.hide('login');
			}
		}
	}    
});

const pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: "username",
      type: "text",
      displayName: "username",
      required: true,
      minLength: 5,
  },
  pwd
]);