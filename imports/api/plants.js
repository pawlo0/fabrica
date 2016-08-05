import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

export const Plants = new Mongo.Collection('plants');

const schema = new SimpleSchema({
    plantName: {
        type: String,
        max: 20,
        unique: true,
        label: "Nome da fábrica"
    }
});

Plants.attachSchema(schema);

export const insertPlant = new ValidatedMethod({
    name: 'insertPlant',
    validate: schema.validator(),
    run(newPlant){
        Plants.insert({plantName: newPlant.plantName});
    }
})