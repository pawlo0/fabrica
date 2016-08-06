import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Categories } from '../api/categories.js';
import { Plants } from './plants.js';

export const Elements = new Mongo.Collection('elements');

const schema = new SimpleSchema({
    elementNumber: {
        type: Number,
        max: 20,
        label: 'Numero'
    },
    elementType: {
        type: String,
        label: "Tipo",
        autoform: {
            type: 'select',
            options: function(){
                const user = Meteor.user();
                return Categories.find({plant: user.profile.plant}).map(function(obj){
                    return {label: obj.categoryName, value: obj._id};
                });
            }
        }
    },
    plant: {
        type: String,
        label: "Fábrica",
    	autoValue: function(){
	        // Element's plant can only be defined by administratores, 
	        // Or if is inserted by server.
	        // Otherwise it will have the same plant as the user that is inserting the newUser
	        const user = Meteor.users.findOne(this.userId);
    	    if ((user && user.profile.admin) || this.isFromTrustedCode){
    	        return undefined;
    	    } else if (user) {
    	        return user.profile.plant;
    	    } else {
    	        this.unset();
    	    }
    	},
    	autoform: {
    		type: 'select',
    		options: function(){
    		    return Plants.find().map(function(obj){
    		        return {value: obj.plantName, label: obj.plantName};
    		    });
    		}
    	}          
    },
    
});

Elements.attachSchema(schema);


// This is the way to ensure the uniqueness of elements.
if (Meteor.isServer) {
  Elements._ensureIndex(
    {elementNumber: 1, elementType: 1, plant: 1},
    { unique: true }
  );
}


// Method to insert new elements
export const insertElement = new ValidatedMethod({
    name: 'insertElement',
    validate(obj){
        schema.validator({clean: true});
    },
    run(newElement){
        const user = Meteor.users.findOne(this.userId);
        // Only administrators can add elements for another plants.
        // Otherwise, the plant field will be the user's plant
        if (!user.profile.admin) {
            newElement.plant = user.profile.plant;
        }
        Elements.insert({
            elementNumber: newElement.elementNumber,
            elementType: newElement.elementType,
            plant: newElement.plant
        });
    }
});