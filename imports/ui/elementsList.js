import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AutoForm } from 'meteor/aldeed:autoform';
import { $ } from 'meteor/jquery';
import { XLSX } from 'meteor/huaming:js-xlsx';
import { saveAs } from 'meteor/pfafman:filesaver';

import { importElements } from '../api/elements.js';

import { Elements } from '../api/elements.js';
import { Categories } from '../api/categories.js';

import './elementsList.html';


Template.elementsList.onCreated(function(){
    const self = this;
    self.autorun(function(){
        self.subscribe('elements');
        self.subscribe('categories');
    });
});

Template.elementsList.helpers({
    'manager'(){
        return Meteor.user() && (Meteor.user().profile.manager || Meteor.user().profile.admin) ? true : false;
        
    }
});

Template.elementsList.events({
    'click .js-addElement'(event){
        Modal.show('addElement');
    },
    'click .js-showImportModal'(event){
        Modal.show('importElementsModal');
    }
});


Template.addElement.onCreated(function(){
    this.addElementFormType = new ReactiveVar(false);
});

Template.addElement.helpers({
    'elements'(){
        return Elements;
    },
    'duplicateAlert'(){
        return Session.get('duplicateAlert');
    },
    'addElementFormType'(){
        return Template.instance().addElementFormType.get();
    }
});

Template.addElement.events({
    'change select[name="elementType"]'(event, template){
        const category = Categories.findOne({categoryName: event.target.value, plant: Meteor.user().profile.plant});
        
        // This is to give a default element number
        // The user can change it tough.
        for (var number = 1; number < 9999; number++){
            if (Elements.findOne({elementType: category.categoryName, elementNumber: number})){
                continue;
            } else {
                $('input[name="elementNumber"]').val(number);
                break;
            }
        }
        // This is to change the form as the user chooses diferent types of elements
        let formType = {};
        formType[category.type] = true;
        formType['initials'] = category.initials;
        template.addElementFormType.set(formType);
    }
});

Template.elementDetailsButton.helpers({
    'linkToElement'(){
        return '/elements/'+this._id;
    }
});


AutoForm.hooks({
    addElementForm: {
        onSuccess: function(formType, result) {
            Session.set('duplicateAlert', false);
            Modal.hide('addElement');
        },
        onError: function(formType, error) {
            if (error.error === 'Duplicate error') {
                Session.set('duplicateAlert', true);
            } else {
                console.log(error);
            }
        },
    }
});


Template.importElementsModal.onCreated(function(){
    this.importedElementsCount = new ReactiveVar(false);
});

Template.importElementsModal.helpers({
    'importedElementsCount'(){
        return Template.instance().importedElementsCount.get();
    }
});

Template.importElementsModal.events({
    'click .js-downloadHasMaintenance'(event){
        event.preventDefault();
        const data = { 
            '!ref': 'A1:M2',
            A1: { t: 's', v: 'elementId'}, A2: { t: 's', v:'Número'},
            B1: { t: 's', v: 'manufacturer'}, B2: { t: 's', v:'Marca'},
            C1: { t: 's', v: 'model'}, C2: { t: 's', v:'Modelo'},
            D1: { t: 's', v: 'serialNumber'}, D2: { t: 's', v:'Número Série'},
            E1: { t: 's', v: 'location'}, E2: { t: 's', v:'Localização'},
            F1: { t: 's', v: 'purchasingDate'}, F2: { t: 's', v:'Data Compra'},
            G1: { t: 's', v: 'capacity'}, G2: { t: 's', v:'Capacidade/Potência'},
            H1: { t: 's', v: 'use'}, H2: { t: 's', v:'Função'},
            I1: { t: 's', v: 'frequencyMonths'}, I2: { t: 's', v:'Periodicidade (Meses)'},
            J1: { t: 's', v: 'frequencyHours'}, J2: { t: 's', v:'Periodicidade (Horas)'},
            K1: { t: 's', v: 'supplier'}, K2: { t: 's', v:'Contacto Fornecedor'},
            L1: { t: 's', v: 'supplies'}, L2: { t: 's', v:'Consumiveis'},
            M1: { t: 's', v: 'memo'}, M2: { t: 's', v:'Observações'},
        };
        writeXLSX(data, "manutenção.xlsx");
    },
    'click .js-downloadHasCalibration'(event){
        event.preventDefault();
        const data = { 
            '!ref': 'A1:S2',
            A1: { t: 's', v: 'elementId'}, A2: { t: 's', v:'Número'},
            B1: { t: 's', v: 'purchasingDate'}, B2: { t: 's', v:'Data Compra'},
            C1: { t: 's', v: 'location'}, C2: { t: 's', v:'Localização'},
            D1: { t: 's', v: 'manufacturer'}, D2: { t: 's', v:'Marca'},
            E1: { t: 's', v: 'model'}, E2: { t: 's', v:'Modelo'},
            F1: { t: 's', v: 'serialNumber'}, F2: { t: 's', v:'Número Série'},
            G1: { t: 's', v: 'bottomLimit'}, G2: { t: 's', v:'Limite inferior'},
            H1: { t: 's', v: 'precisionClass'}, H2: { t: 's', v:'Precisão'},
            I1: { t: 's', v: 'rangeMeasure'}, I2: { t: 's', v:'Gama Medida'},
            J1: { t: 's', v: 'frequencyMonths'}, J2: { t: 's', v:'Periodicidade (Meses)'},
            K1: { t: 's', v: 'use'}, K2: { t: 's', v:'Função'},
            L1: { t: 's', v: 'noConform'}, L2: { t: 's', v:'Critério não conforme'},
            M1: { t: 's', v: 'memo'}, M2: { t: 's', v:'Observações'},
            N1: { t: 's', v: 'rangeUse'}, N2: { t: 's', v:'Gama Uso'},
            O1: { t: 's', v: 'noConformValue'}, O2: { t: 's', v:'Valor Não Conforme'},
            P1: { t: 's', v: 'scale'}, P2: { t: 's', v:'Escala'},
            Q1: { t: 's', v: 'resolution'}, Q2: { t: 's', v:'Resolução'},
            R1: { t: 's', v: 'units'}, R2: { t: 's', v:'Unidades'},
            S1: { t: 's', v: 'isDigital'}, S2: { t: 's', v:'Digital?'},
        };
        writeXLSX(data, "calibração.xlsx");
    },
    'click .js-downloadHasSetpoint'(event){
        event.preventDefault();
        const data = { 
            '!ref': 'A1:S2',
            A1: { t: 's', v: 'elementId'}, A2: { t: 's', v:'Número'},
            B1: { t: 's', v: 'purchasingDate'}, B2: { t: 's', v:'Data Compra'},
            C1: { t: 's', v: 'location'}, C2: { t: 's', v:'Localização'},
            D1: { t: 's', v: 'manufacturer'}, D2: { t: 's', v:'Marca'},
            E1: { t: 's', v: 'model'}, E2: { t: 's', v:'Modelo'},
            F1: { t: 's', v: 'serialNumber'}, F2: { t: 's', v:'Número Série'},
            G1: { t: 's', v: 'rangeMeasure'}, G2: { t: 's', v:'Gama Medida'},
            H1: { t: 's', v: 'frequencyMonths'}, H2: { t: 's', v:'Periodicidade (Meses)'},
            I1: { t: 's', v: 'use'}, I2: { t: 's', v:'Função'},
            J1: { t: 's', v: 'noConform'}, J2: { t: 's', v:'Critério não conforme'},
            K1: { t: 's', v: 'memo'}, K2: { t: 's', v:'Observações'},
            L1: { t: 's', v: 'rangeUse'}, L2: { t: 's', v:'Gama Uso'},
            M1: { t: 's', v: 'noConformValue'}, M2: { t: 's', v:'Valor Não Conforme'},
            N1: { t: 's', v: 'units'}, N2: { t: 's', v:'Unidades'},
            O1: { t: 's', v: 'isDigital'}, O2: { t: 's', v:'Digital?'},
        };
        writeXLSX(data, "setpoint.xlsx");
    },
    'change #importFiles'(event, template){
        var files = event.currentTarget.files;
        var i,f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, {type: 'binary'});
                var first_sheet_name = workbook.SheetNames[0];
                importElements.call(workbook.Sheets[first_sheet_name], function(error, result){
                    if (error) {
                        console.log(error);
                    } else {
                        template.importedElementsCount.set(result);
                    }
                });
                
            };
            reader.readAsBinaryString(f);
        }
    }
});

function writeXLSX(data, fileName){

    var ws_name = fileName;
    var wb = new Workbook(); //, ws = sheet_from_array_of_arrays(data);
    
    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = data;
    var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
    
    /* the saveAs call downloads a file on the local machine */
    saveAs(new Blob([s2ab(wbout)],{type:""}), fileName);    
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}
 
function Workbook() {
	if(!(this instanceof Workbook)) return new Workbook();
	this.SheetNames = [];
	this.Sheets = {};
}