import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Tabular } from 'meteor/aldeed:tabular';

import { Categories } from '../api/categories.js';
import { Plants } from './plants.js';

// Need this to render the button on the tabular
if (Meteor.isClient){
    require("../ui/elementsList.html");
}
export const Elements = new Mongo.Collection('elements');

const schema = new SimpleSchema({
    elementNumber: {
        type: Number,
        max: 9999,
        label: 'Numero'
    },
    elementType: {
        type: String,
        label: "Tipo",
        autoValue: function(){
            // This prevents the user from change the elementType after it's insertion
            if (this.isUpdate || this.isUpsert){
                this.unset();
            } else {
                return undefined;
            }
        },
        autoform: {
            type: 'select',
            options: function(){
                const user = Meteor.user();
                return Categories.find({plant: user.profile.plant}).map(function(obj){
                    return {label: obj.categoryName, value: obj.categoryName};
                });
            }
        }
    },
    elementId: {
        type: String,
        max: 8,
        autoValue: function(){
            if (this.isUpdate && this.isFromTrustedCode) {
                // This is for the cause when the user updates an category, and all elements of that category changes it's initials
                // The method 'updateCategory' itself will generate the new elementId, hence the isFromTrustedCode clause
                return undefined;
            } else {
                let initials = this.isInsert ?
                    // In cause this is new elements, this will generate the elementId
                    Categories.findOne({plant: Meteor.user().profile.plant, categoryName: this.field('elementType').value}).initials : 
                    // Case this is an update of elements, this will take the initials that already exist
                    // Note that The change of elements's initials are blocked,
                    // The user can only change the whole category initials, but not one elements initials.
                    Elements.findOne(this.docId).elementId.split('-')[0];
                let number = this.field('elementNumber').value < 10 ? 
                    '00' + this.field('elementNumber').value :
                    number = this.field('elementNumber').value < 100 ? 
                        '0' + this.field('elementNumber').value :
                        this.field('elementNumber').value;
                return initials + '-' + number;
            }
        }
    },
    elementFormType: {
        type: String,
        autoValue: function(){
            if (this.isInsert) {
                return Categories.findOne({plant: Meteor.user().profile.plant, categoryName: this.field('elementType').value}).type;
            } else {
                this.unset();
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
    frequencyMonths: {
        type: Number,
        label: "Periodicidade (Meses)"
    },
    frequencyHours: {
        type: Number,
        label: "Periodicidade (Horas trabalho)",
        optional: true
    },
    manufacturer: {
        type: String,
        label: "Marca"
    },
    model: {
        type: String,
        label: "Modelo"
    },
    serialNumber: {
        type: String,
        label: "Número de série"
    },
    location: {
        type: String,
        label: "Localização",
        optional: true
    },
    purchasingDate: {
        type: Date,
        label: "Data de Compra",
        optional: true
    },
    capacity: {
        type: String,
        label: "Capacidade / Potência",
        optional: true
    },
    use: {
        type: String,
        label: "Função",
        optional: true
    },
    supplier: {
        type: String,
        label: "Fornecedor",
        optional: true
    },
    supplies: {
        type: String,
        label: "Consumiveis",
        optional: true
    },
    bottomLimit: {
        type: String,
        label: "Limite Inferior",
        optional: true
    },
    precisionClass: {
        type: String,
        label: "Classe de precisão",
        optional: true
    },
    rangeMeasure: {
        type: String,
        label: "Gama de medida",
        optional: true
    },
    rangeUse: {
        type: String,
        label: "Gama de uso",
        optional: true
    },
    resolution: {
        type: String,
        label: "Resolução",
        optional: true
    },
    scale: {
        type: String,
        label: "Escala",
        optional: true
    },
    units: {
        type: String,
        label: "Unidades",
        optional: true
    },
    isDigital: {
        type: Boolean,
        label: "Digital?",
        defaultValue: false
    },
    noConform: {
        type: String,
        label: "Critério Não conformidade",
        optional: true
    },
    noConformValue: {
        type: Number,
        label: "Valor Não conformidade",
        optional: true
    },
    setPoint: {
        type: Number,
        label: "Disparo / Setpoint",
        optional: true
    },
    memo: {
        type: String,
        label: "Observações",
        optional: true
    }
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
        
        if (user.profile.admin || user.profile.manager) {
            if (Elements.findOne({elementNumber: newElement.elementNumber, elementType: newElement.elementType, plant: newElement.plant})) {
                throw new Meteor.Error('Duplicate error', "O elemento já existe");
            } else {
                Elements.insert(newElement);
            }
        }
    }
});

// Method to update elements
export const updateElement = new ValidatedMethod({
    name: 'updateElement',
    validate(obj){
        schema.validator({modifier: true});
    },
    run({_id, modifier}){
        const user = Meteor.users.findOne(this.userId);
        if (user.profile.admin || user.profile.manager) {
            if (Elements.findOne(_id).elementNumber != modifier.$set.elementNumber && Elements.findOne({elementNumber: modifier.$set.elementNumber, elementType: modifier.$set.elementType, plant: modifier.$set.plant})) {
                throw new Meteor.Error('Duplicate error', "O elemento já existe");
            } else {        
                Elements.update(_id, modifier);
            }
        }
    }
});


// Method to remove elements
export const removeElement = new ValidatedMethod({
    name: 'removeElement',
    validate: null,
    run(elementId){
        const user = Meteor.users.findOne(this.userId);
        if (user.profile.manager || user.profile.admin){
            Elements.remove(elementId);
        }
    }
});

// Code for the elements table
export const TabularTables = {};
TabularTables.Elements= new Tabular.Table({
    name: 'Elements',
    collection: Elements,
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
        { data: 'elementId', title: 'Número' },
        { data: 'elementType', title: 'Tipo' },
        { data: 'manufacturer', title: 'Marca'},
        { data: 'model', title: 'Modelo'},
        { data: 'location', title: 'Localização'},
        { tmpl: Meteor.isClient && Template.elementDetailsButton }
    ],
    extraFields: ['elementNumber'],
    responsive: true,
    autoWidth: false,
    order: [[1, 'asc'], [0,'asc']]
});