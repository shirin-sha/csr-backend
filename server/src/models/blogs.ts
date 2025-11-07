import mongoose, { Document, Schema, Types, SchemaTypes } from "mongoose";



const blogs = new Schema({
    submission_date:{ type: Date, default: null,index:true },
    location:{ type: String, maxLength: 300 },
    heading: { type: String, maxLength: 300 },
    description: { type: String, maxLength: 1000 },
    img: { type: String, maxLength: 100 },
    content:{type:String}
});


export const blogSchema = mongoose.model('blogs', blogs)