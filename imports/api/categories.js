import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Plants } from './plants.js';

export const Categories = new Mongo.Collection('categories');

const schema = new SimpleSchema({
    categoryName: {
        type: String,
        max: 20,
        label: "Nome"
    },
    initials: {
        type: String,
        max: 3,
        label: "Iniciais"
    },
    plant: {
        type: String,
        label: "Fábrica",
    	autoValue: function(){
	        // Category's plant can only be defined by administratores, 
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
    type: {
        type: String,
        label: "Tipo",
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return [
                    {label: 'Com Calibração', value: 'hasCalibration'},
                    {label: 'Com Verificação de set-point', value: 'hasSetpoint'},
                    {label: 'Com Manutenção', value: 'hasMaintenance'},
                ];
            }
        }        
    }
});

Categories.attachSchema(schema);

export const insertCategory = new ValidatedMethod({
    name: 'insertCategory',
    validate(obj){
        schema.validator({clean: true});
    },
    run({categoryName, initials, plant, type}){
        Categories.insert({
            categoryName,
            initials,
            plant,
            type
        });
    }
})