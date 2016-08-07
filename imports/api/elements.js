import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Tabular } from 'meteor/aldeed:tabular';

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
        
        if (Elements.findOne({elementNumber: newElement.elementNumber, elementType: newElement.elementType, plant: newElement.plant})) {
            throw new Meteor.Error('Duplicate error', "O elemento já existe");
        } else {
            Elements.insert({
                elementNumber: newElement.elementNumber,
                elementType: newElement.elementType,
                plant: newElement.plant
            });
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
        { 
            data: 'elementNumber', 
            title: 'Número',
            render: function(val, type, doc) {
                const elementInitials = Categories.findOne(doc.elementType).initials;
                if (val < 10 ) {
                    val = '00' + val;
                } else if (val < 100 ){
                    val = '0' + val;
                }
                return elementInitials + '-' + val;
            }
        },
        { 
            data: 'elementType', 
            title: 'Tipo',
            render: function(val, type, doc) {
                return Categories.findOne(doc.elementType).categoryName;
            }
        }
    ],
    responsive: true,
    autoWidth: false,
    order: [[1, 'asc'], [0,'asc']]
});