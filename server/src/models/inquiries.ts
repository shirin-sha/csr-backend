import mongoose, { Document, Schema, Types,SchemaTypes } from "mongoose";



const inquiries = new Schema({
    name:{type:String,required:true},
    mobile:{type:String},
    email: { type: String, lowercase:true,minlength:4},
    subject:{type:String,maxLength: 200},
    message:{type:String,maxLength: 400},

});


export const inquirySchema = mongoose.model('inquiries', inquiries)