import mongoose, { Document, Schema } from "mongoose";


const docs = new Schema({
    file_name: { type: String, index: true },
    added_date: { type: Date, default: Date.now }
})

export const documentSchema = mongoose.model('docs', docs)