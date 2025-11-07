import mongoose, { Document, Schema, Types, SchemaTypes } from "mongoose";



const adminFaq = new Schema({
    question: { type: String, maxLength: 100 },
    answer: { type: String, maxLength: 400 },
    img: { type: String, maxLength: 100 }
});


export const adminFaqSchema = mongoose.model('adminFaq', adminFaq)