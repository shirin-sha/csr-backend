import mongoose, { Document, Schema, Types,SchemaTypes } from "mongoose";



const userFaq = new Schema({
    name:{type:String,minlength:1,required:true},
    email: {   type: String, minlength:1 },
    subject:{type:String,maxLength: 200},
    message:{type:String,maxLength: 500},

});


export const userFaqSchema = mongoose.model('userFaq', userFaq)