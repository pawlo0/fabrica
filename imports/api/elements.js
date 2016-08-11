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
            let categoryName = this.field('elementType').isSet ? this.field('elementType').value : Elements.findOne(this.docId).elementType;
            const initials = Categories.findOne({plant: Meteor.user().profile.plant, categoryName}).initials;
            let number = this.field('elementNumber').value < 10 ? 
                '00' + this.field('elementNumber').value :
                number = this.field('elementNumber').value < 100 ? 
                    '0' + this.field('elementNumber').value :
                    this.field('elementNumber').value;
            return initials + '-' + number;
        }
    },
    elementFormType: {
        type: String,
        autoValue: function(){
            let categoryName = this.field('elementType').isSet ? this.field('elementType').value : Elements.findOne(this.docId).elementType;
            return Categories.findOne({plant: Meteor.user().profile.plant, categoryName}).type;
        }
    },
    plant: {
        type: String,
        label: "Fábrica",
    	autoValue: function(){
	        // Element's plant can only be defined by the user's own plant.
	        const user = Meteor.users.findOne(this.userId);
    	    if (user) {
    	        return user.profile.plant;
    	    } else {
    	        this.unset();
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


// Method to import XLSX files
export const importElements = new ValidatedMethod({
    name: 'importElements',
    validate: null,
    run(worksheet){
        const user = Meteor.users.findOne(this.userId);
        if (user.profile.admin || user.profile.manager) {        
            
            // There are other ways to go through lines and columns, but I choose this way
            // the !ref objects tells me the whole range, but uses the Common Spreadsheet Format (CSF)
            // this means the range will have this aspect: A1:G13
            const lastLine = worksheet['!ref'].split(':')[1].match(/[a-zA-Z]+|[0-9]+/g)[1]*1;
            const lastColumn = worksheet['!ref'].split(':')[1].match(/[a-zA-Z]+|[0-9]+/g)[0];
            
            let newElementObj = {}, objsCount = 0;
            
            // Cycle that goes through the lines, I know it should start at line 3,
            // This means first object will be be at cell A3
            for (var line = 3; line <= lastLine; line++) {
                newElementObj = {};
                
                // This cycle goes through the columns
                // number 65 means letter A, so it starts at columns A until last column.
                // It prepares the new elements object 
                for (var column = 65; column < lastColumn.charCodeAt(0); column++) {
                    if (worksheet[String.fromCharCode(column)+line]) {
                        newElementObj[worksheet[String.fromCharCode(column)+'1'].v] = worksheet[String.fromCharCode(column)+line].v;
                    } else {
                        continue;
                    }
                }
                
                // Now that I have the object, some heavy checking.
                if (
                    // First to check if the elementId has the expected format
                    // Something like EQ-001. Use a regexp to test that.
                    newElementObj.elementId.match(/^[A-Z]{1,3}-[0-9]{1,4}$/m) && 
                    // At the same time we also check if the element does not exist already in this plant, 
                    // because we can't have duplicates of elementId in the same plant
                    !Elements.findOne({plant: user.profile.plant, elementId: newElementObj.elementId}) &&
                    // Also, at the same time, we check if we have the category we want to insert
                    // The import xlsx fie won't have the category for each element.
                    // The way to find the element's category will be from it's initial, that are unique for each plant. 
                    // That is why we need to check if we have the category (and it's initials) already created for this plant.
                    Categories.findOne({plant: user.profile.plant, initials: newElementObj.elementId.split('-')[0]})
                ){
                    newElementObj.elementNumber = newElementObj.elementId.split('-')[1]*1;
                    newElementObj.elementType = Categories.findOne({initials: newElementObj.elementId.split('-')[0], plant: user.profile.plant}).categoryName;
                    insertElement.call(newElementObj);
                    objsCount++;
                } else {
                    continue;
                }
            }
            return objsCount;
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