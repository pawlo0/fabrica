import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { AutoForm } from 'meteor/aldeed:autoform';
import { $ } from 'meteor/jquery';
import { XLSX } from 'meteor/huaming:js-xlsx';
import { saveAs } from 'meteor/pfafman:filesaver';

import { Elements } from '../api/elements.js';
import { Categories } from '../api/categories.js';

import './elementsList.html';


Template.elementsList.onCreated(function(){
    const self = this;
    self.autorun(function(){
        self.subscribe('categories');
    });
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




Template.importElementsModal.events({
    'click .js-downloadHasMaintenance'(event){
        event.preventDefault();
        const data = ["Número", "Marca", "Modelo", "Número Série", "Localização", "Data Compra", "Capacidade/Potência", "Função", "Periodicidade (Meses)", "Periodicidade(Horas)", "Contacto Fornecedor", "Consumiveis", "Observações"];
        writeXLSX(data, "manutenção.xlsx");
    },
    'click .js-downloadHasCalibration'(event){
        event.preventDefault();
        const data = ["Número", "Data Compra", "Localização", "Marca", "Modelo", "Número Série", "Limite Inferior", "Precisão", "Gama Medida", "Periodicidade (Meses)", "Uso", "Critério Não Conforme", "Observações", "Gama Uso", "Valor Não Conforme", "Escala", "Resolução", "Unidades", "Digital?"];
        writeXLSX(data, "calibração.xlsx");
    },
    'click .js-downloadHasSetpoint'(event){
        event.preventDefault();
        const data = ["Número", "Data de Compra", "Localização", "Marca", "Modelo", "Número Série", "Gama Medida", "Periodicidade (Meses)", "Uso", "Critério Não Conforme", "Observações", "Gama Uso", "Valor Não Conforme", "Unidades", "Digital?"];
        writeXLSX(data, "setpoint.xlsx");
    }
});

function writeXLSX(data, fileName){
    var ws= {};
    for (var i=0; i< data.length; i++) {
      var cell_ref = XLSX.utils.encode_cell({c:i,r:0});
      var cell = {v: data[i], t: "s"};
      ws[cell_ref] = cell;
    }
    ws['!ref'] = XLSX.utils.encode_range({s:{c:0, r:0}, e:{c:data.length, r:0}});
    
    var ws_name = "SheetJS";
    var wb = new Workbook(); //, ws = sheet_from_array_of_arrays(data);
    
    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
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