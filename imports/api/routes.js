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
    action: function(params) {
        BlazeLayout.render("appLayout", {main: "elementsList"});
    }
});