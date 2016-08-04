import { Meteor } from 'meteor/meteor';
import '../imports/api/users.js';

Meteor.startup(() => {
    // Creates first user in case there's no user, with full admin rights
    if ( Meteor.users.find().count() === 0 ) {
        const firstUser = Accounts.createUser({
            username: 'pssantos',
            password: '123123',
            profile: {
                plant: 'Maia',
                admin: true,
                manager: true
            }
        });
        if (firstUser) {
            console.log("Created first user");
        }
    }
});
