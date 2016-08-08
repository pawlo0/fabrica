import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../ui/appLayout.js';
import '../ui/welcome.js';
import '../ui/setup.js';
import '../ui/elementsList.js';
import '../ui/elementDetails.js';


FlowRouter.route('/', {
    name: 'welcome',
    action: function(params) {
        BlazeLayout.render("appLayout", {main: "welcome"});
    }
});

FlowRouter.route('/setup', {
    name: 'setup',
    triggersEnter: [function(context, redirect) {
        if (!(Meteor.user() || Meteor.loggingIn())) {
            redirect('/');
        }
    }],
    action: function(){
        BlazeLayout.render('appLayout', {main: 'setup'});
    }
});

FlowRouter.route('/elements', {
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

FlowRouter.route('/elements/:Id', {
   name: 'elementDetails',
    triggersEnter: function() {
        if (!(Meteor.user() || Meteor.loggingIn())) {
            FlowRouter.go('/');
        }        
    },
    action: function(params) {
        BlazeLayout.render('appLayout', {main: 'elementDetails'});
    }
});