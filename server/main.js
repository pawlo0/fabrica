import { Meteor } from 'meteor/meteor';
import '../imports/api/users.js';

Meteor.startup(() => {
    if ( Meteor.users.find().count() === 0 ) {
        Accounts.createUser({
            username: 'pssantos',
            password: '123123',
            profile: {
                forcePassChange: true,
                first_name: 'Paulo',
                last_name: 'Santos',
                planta: 'Maia',
            }
        });
    }
});
