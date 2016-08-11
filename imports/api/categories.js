import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Tabular } from 'meteor/aldeed:tabular';

import { Plants } from './plants.js';
import { Elements } from './elements.js';

// Need this to render the button on the tabular
if (Meteor.isClient){
    require("../ui/setup.html");
}

export const Categories = new Mongo.Collection('categories');

const schema = new SimpleSchema({
    categoryName: {
        type: String,
        max: 25,
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

// This is the way to ensure the uniqueness of categories initials.
if (Meteor.isServer) {
  Categories._ensureIndex(
    {initials: 1, plant: 1},
    { unique: true }
  );
}


export const insertCategory = new ValidatedMethod({
    name: 'insertCategory',
    validate(obj){
        schema.validator({clean: true});
    },
    run({categoryName, initials, plant, type}){
        const user = Meteor.users.findOne(this.userId);
        // Only administrators can make categories for another plants.
        // Otherwise, the plant field will be the user's plant
        if (!user.profile.admin) {
            plant = user.profile.plant;
        }
        
        // Prevent from inserting duplicates
        if (Categories.findOne({initials, plant})) {
            throw new Meteor.Error('Duplicate error', "A categoria já existe");
        } else {
            Categories.insert({
                categoryName,
                initials,
                plant,
                type
            });
        }
    }
});

export const updateCategory = new ValidatedMethod({
    name: 'updateCategory',
    validate(obj){
        schema.validator({modifier: true});
    },
    run({_id, modifier}){
        const oldCategory = Categories.findOne(_id);
        if (oldCategory.initials != modifier.$set.initials && Categories.findOne({initials: modifier.$set.initials, plant: modifier.$set.plant})) {
            throw new Meteor.Error('Duplicate error', "A categoria já existe");
        } else {
            // And this is to change the category itself.
            Categories.update(_id, modifier);
            
            // This is to change all elements of this category 
            Elements.find({plant: oldCategory.plant, elementType: oldCategory.categoryName}).map(function(element){
                Elements.update(element._id, {$set: {
                    elementType: modifier.$set.categoryName, 
                }});
            });
            
        }
    }
});

// Method to delete category
export const deleteCategory = new ValidatedMethod({
    name: 'deleteCategory',
    validate: null,
    run(categoryId){
        const category = Categories.findOne(categoryId);
        if (Elements.find({plant: category.plant, elementType: category.categoryName}).count() === 0) {
            Categories.remove(categoryId);
        }
    }
});


// Code for the table of categories, 
// it has to be placed in "common place", to run in server and client
export const TabularTables = {};
TabularTables.Categories= new Tabular.Table({
    name: 'Categories',
    collection: Categories,
    selector: function (userId) {
        const user = Meteor.users.findOne(userId);
        if (user) {
            if (user.profile.admin) {
                return {};
            } else {
                return {plant: user.profile.plant};
            }
        } else {
            return false;
        }
    },
    columns: [
        {data: 'categoryName', title: 'Designação'},
        {data: 'initials', title: 'Iniciais'},
        {
            data: 'type', 
            title: 'Tipo',
            render: function (val, type, doc) {
                if (val == 'hasMaintenance') {
                    return 'Com Manutenção';
                } else if (val == 'hasSetpoint') {
                    return 'Com Set-Point';
                } else if (val == 'hasCalibration') {
                    return 'Com Calibração';
                } else {
                    return val;
                }
            }            
        },
        {data: 'plant', title: 'Fábrica'},
        { tmpl: Meteor.isClient && Template.categoryDetailsButton }
    ],
    responsive: true,
    autoWidth: false,
    order: [[ 3, "asc" ], [0, "asc"]]
});