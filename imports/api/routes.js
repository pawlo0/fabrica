import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../ui/appLayout.js';
import '../ui/welcome.js';
import '../ui/elementsList.js';


FlowRouter.route('/', {
    name: 'welcome',
    action: function(params) {
        BlazeLayout.render("appLayout", {main: "welcome"});
    }
});

FlowRouter.route('/elementos', {
    name: 'elementsList',
    triggersEnter: function() {
        if (!(Meteor.user() || Meteor.loggingIn())) {
            FlowRouter.go('/');
        }        
    },
    action: function(params) {
        BlazeLayout.render("appLayout", {main: "elementsList"});
    }
});