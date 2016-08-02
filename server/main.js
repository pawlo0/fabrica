import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    if ( Meteor.users.find().count() === 0 ) {
        Accounts.createUser({
            username: 'pssantos',
            password: '123123',
            forcePassChange: true,
            profile: {
                first_name: 'Paulo',
                last_name: 'Santos',
                plant: 'Maia',
            }
        });
    }
});
