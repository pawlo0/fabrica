import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Elements } from './elements.js';

export const Actions = new Mongo.Collection('actions');

const schema = new SimpleSchema({
    madeAt: {
        type: Date,
        label: "Data"
    },
    element: {
        type: String
    },
    elementId: {
        type: String
    },
    plant: {
        type: String,
    },
    actionType: {
        type: String,
        label: "Tipo",
        allowedValues: ["calibration", "verification", "repair", "preventive", "hoursRegister", "levelRegister"]
    },
    hours: {
        type: Number,
        label: "Horas actuais",
        optional: true
    },
    level: {
        type: Number,
        label: "Nivel actual",
        optional: true
    },
    verificationValue: {
        type: Number,
        label: "Valor verificado",
        optional: true
    },
    description: {
        type: String,
        label: "Trabalho realizado",
        optional: true
    },
    partsUsed: {
        type: String,
        label: "Peças usadas",
        optional: true
    },
    manCost: {
        type: Number,
        label: "Custo Mão-de-obra",
        optional: true
    },
    partsCost: {
        type: Number,
        label: "Custo peças",
        optional: true
    },
    serviceNote: {
        type: String,
        label: "Folha de serviço",
        optional: true
    },
    invoice: {
        type: String,
        label: "Fatura de serviço",
        optional: true
    },
    reference: {
        type: String,
        label: "Padrão utilizado",
        optional: true
    },
    in1: { type: Number, decimal: true, optional: true }, in2: { type: Number, decimal: true, optional: true }, in3: { type: Number, decimal: true, optional: true }, in4: { type: Number, decimal: true, optional: true },
    vp1: { type: Number, decimal: true, optional: true }, vp2: { type: Number, decimal: true, optional: true }, vp3: { type: Number, decimal: true, optional: true }, vp4: { type: Number, decimal: true, optional: true },
    it11: { type: Number, decimal: true, optional: true }, it21: { type: Number, decimal: true, optional: true }, it31: { type: Number, decimal: true, optional: true }, it41: { type: Number, decimal: true, optional: true },
    it12: { type: Number, decimal: true, optional: true }, it22: { type: Number, decimal: true, optional: true }, it32: { type: Number, decimal: true, optional: true }, it42: { type: Number, decimal: true, optional: true },
    it13: { type: Number, decimal: true, optional: true }, it23: { type: Number, decimal: true, optional: true }, it33: { type: Number, decimal: true, optional: true }, it43: { type: Number, decimal: true, optional: true },
    it14: { type: Number, decimal: true, optional: true }, it24: { type: Number, decimal: true, optional: true }, it34: { type: Number, decimal: true, optional: true }, it44: { type: Number, decimal: true, optional: true },
    icp1: { type: Number, decimal: true, optional: true }, icp2: { type: Number, decimal: true, optional: true }, icp3: { type: Number, decimal: true, optional: true }, icp4: { type: Number, decimal: true, optional: true },
    memo: {
        type: String,
        label: "Observações",
        optional: true
    }
});

Actions.attachSchema(schema);


// Method to insert new actions
export const insertAction = new ValidatedMethod({
    name: 'insertAction',
    validate(obj){
        schema.validator({clean: true});
    },
    run(newAction){
        
        Actions.insert(newAction);        
                    
    }
})