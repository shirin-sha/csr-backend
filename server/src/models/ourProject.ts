import mongoose, { Document, Schema, Types, SchemaTypes } from "mongoose";



const ourProject = new Schema({
    heading: { type: String, maxLength: 100 },
    description: { type: String, maxLength: 20000 },
    category: [{ type: Schema.Types.ObjectId ,ref:'category'}],
    img: { type: String, maxLength: 100 }
});


export const ourProjectSchema = mongoose.model('ourProject', ourProject)