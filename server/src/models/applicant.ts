import { string } from "joi";
import mongoose, { Document, Schema, Types, SchemaTypes } from "mongoose";



const applicant = new Schema({
    type: { type: Number, default: 0 },
    first_name: String,
    last_name: String,
    email: { unique: true, index: true, type: String, lowercase: true, minlength: 4 },
    password: String,
    mobile: { type: String, unique: true },
    gender: String,
    dob: Date,
    company_name: String,
    address: String,
    contact_person_name: String,
    img: { type: String, maxLength: 100 },
    submission_date: { type: Date, default: null },
    notification: [{
        createdAt: { type: Date, default: null, index: true },
        productType: { type: String, default: null }, //E - event P -project
        projectId:{type:SchemaTypes.ObjectId , ref:'projects'},
        eventId:{type:SchemaTypes.ObjectId , ref:'events'},
        action:{type:String,default: null},
        message: { type: String },
        isShowed:{type:Boolean,default:false}

    }],
    documents: [{ type: SchemaTypes.ObjectId, ref: "docs" }],
    activated: { type: Date, default: null },
    activation_token: String,
    blocked: { type: Boolean, default: false },
    token: String
});


export const applicantSchema = mongoose.model('applicants', applicant)
