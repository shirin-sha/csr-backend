import mongoose, { Document, Schema } from "mongoose";


const image = new Schema({
    file_name: { type: String, index: true },
    added_date: { type: Date, default: Date.now }
})

export const imageSchema = mongoose.model('images', image)