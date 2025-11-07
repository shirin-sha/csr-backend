import mongoose, { Document, Schema, SchemaType } from "mongoose";


const settings = new Schema({
    fixedFees:{type:Number,default:100},
    percentageFees:{type:Number,default:10}

})

export const SettingsSchema = mongoose.model('settings', settings)