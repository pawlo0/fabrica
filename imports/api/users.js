import { AccountsTemplates } from 'meteor/useraccounts:core';
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


// User profile schema to be used in user schema
const profile = new SimpleSchema({
    forcePassChange: {
    	type: Boolean,
    	autoValue: function(){
    		if (this.isInsert){
    			return true;
    		}
    	},
    	autoform: {
    		type: 'hidden'
    	}
    },
    plant: {
    	type: String,
    	autoform: {
    		type: 'select',
    		options: [
    			{label: 'Maia', value: 'maia'}
    		]
    	}
    },
    admin: {
    	type: Boolean,
    	defaultValue: false,
    	label: "Administrador?"
    },
    manager: {
    	type: Boolean,
    	defaultValue: false,
    	label: "Gestor?"
    }
});


// User schema
const schema = new SimpleSchema({
    username: {
        type: String,
        max: 20,
        label: "Utilizador",
        autoform: {
        	type: "text"
        }
    },
    createdAt: {
        type: Date,
	    autoValue: function() {
	      if (this.isInsert) {
	        return new Date();
	      } else if (this.isUpsert) {
	        return {$setOnInsert: new Date()};
	      } else {
	        this.unset();  // Prevent user from supplying their own value
	      }
	    },
	    autoform: {
	    	type: 'hidden'
	    }
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true,
        autoform: {
        	type: 'hidden'
        }
    },    
    profile: {
        type: profile,
    },    
});

Meteor.users.attachSchema(schema);

// Useraccounts options
AccountsTemplates.configure({
    // Users can only be created by method
    forbidClientAccountCreation: true,
    enablePasswordChange: true,
    // When new user is created it is created with default password,
    // The next function is to force user to change password if field forcePassChange is set to true
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
			    // After user submits the change password, the field forcePassChange is toggled to false.
			    changePwd.call(false);
			    Modal.hide('login');
			    AccountsTemplates.setState('signIn');
			}
		}
	}    
});


// This code is to use only username to login instead of email
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

// Method to toggle the forcePassChange field.
const changePwd = new ValidatedMethod({
    name: 'changePwd',
    validate: null,
    run(arg){
        Meteor.users.update(this.userId, {$set:{'profile.forcePassChange': arg}});
    }
});

// Method to create new users
export const createNewUser = new ValidatedMethod({
	name: 'createNewUser',
	validate(newUser){
	    // Validation agaist schema
		schema.validator({clean:true});
	},
	run(newUser){
		const user = Meteor.users.findOne(this.userId);
		// New users can only be administratores if inserted by another administrator 
		let canBeAdmin = newUser.profile.admin && user.profile.admin ? true : false;
		// New users can only be managers if inserted by another manager or by administrator
		let canBeManager = (user.profile.admin || user.profile.manager) && (newUser.profile.admin || newUser.profile.manager) ? true : false;
        Accounts.createUser({
            username: newUser.username,
            password: 'xxxxxx',
            profile: {
                plant: newUser.profile.plant,
                admin: canBeAdmin,
                manager: canBeManager
            }
        });
	}
});
