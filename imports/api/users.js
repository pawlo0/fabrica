import { AccountsTemplates } from 'meteor/useraccounts:core';
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

AccountsTemplates.configure({
    forbidClientAccountCreation: true,
    enablePasswordChange: true,
	onSubmitHook: (error, state) => {
		if (!error) {
			if (state === "signIn") {
				// Successfully logged in
				// ...
				if (Meteor.user().profile.forcePassChange) {
				    AccountsTemplates.setState('changePwd');
				} else {
				    Modal.hide('login');
				}
			}
			if (state === 'changePwd') {
			    userPassDefined.call();
			    Modal.hide('login');
			    AccountsTemplates.setState('signIn');
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


export const userPassDefined = new ValidatedMethod({
    name: 'userPassDefined',
    validate: null,
    run() {
        Meteor.users.update(this.userId, {$set:{'profile.forcePassChange': false}});
    }
});
