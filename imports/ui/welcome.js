import './welcome.html';

Template.welcome.helpers({
    'userPlant'(){
        if (Meteor.user()){
            return Meteor.user().profile.plant;
        }
    }
});
