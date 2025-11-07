import mongoose, { Document, Schema, Types,SchemaTypes } from "mongoose";



const admin = new Schema({
    role: { type: Number, default: 0 },
    email: {  unique: true,index: true, type: String, lowercase:true,minlength:4 },
    name:{type:String,index:true,unique:true,minlength:2},
    password: String,
    log:[Date]

});


export const adminSchema = mongoose.model('admin', admin)
