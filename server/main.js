import '../imports/api/users.js';
import {Plants} from '../imports/api/plants.js';
import {Categories} from '../imports/api/categories.js';
import {Elements} from '../imports/api/elements.js';
import {Actions} from '../imports/api/actions.js';

Meteor.startup(() => {
    // Creates first user in case there's no user, with full admin rights
    if ( Meteor.users.find().count() === 0 ) {
        const firstPlant = Plants.findOne(
            Plants.insert({plantName: 'Maia'})
            ).plantName;
        
        const firstUser = Accounts.createUser({
            username: 'pssantos',
            password: '123123',
            profile: {
                plant: firstPlant,
                admin: true,
                manager: true
            }
        });
        if (firstUser) {
            console.log("Created first user");
        }
    }
});

Meteor.publish('plants', function(){
    const user = Meteor.users.findOne(this.userId);
    if (user) {
        if (user.profile.admin) {
            return Plants.find();
        } else {
            return Plants.find({plantName: user.profile.plant});
        }
    }
});

Meteor.publish('categories', function(){
    const user = Meteor.users.findOne(this.userId);
    if (user) {
        if (user.profile.admin) {
            return Categories.find();
        } else {
            return Categories.find({plant: user.profile.plant});
        }
    }
});

Meteor.publish('elements', function(Id){
    const user = Meteor.users.findOne(this.userId);
    if (user) {
        if (user.profile.admin) {
            return Elements.find();
        } else {
            return Elements.find({plant: user.profile.plant});
        }
    }
});

Meteor.publish('singleElement', function(Id){
    const user = Meteor.users.findOne(this.userId);
    const element = Elements.findOne(Id);
    if ((user && element.plant === user.profile.plant) || user.profile.admin) {
        return Elements.find(Id);
    }
});

