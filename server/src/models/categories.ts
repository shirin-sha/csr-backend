import mongoose, { Document, Schema } from "mongoose";


const category = new Schema({
    name: { type: String, index: true ,unique:true},
    deleted:{type:Boolean,default:false}
    
})

export const categorySchema = mongoose.model('category', category)