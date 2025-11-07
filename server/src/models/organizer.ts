import mongoose, { Document, Schema, Types,SchemaTypes } from "mongoose";



const organizer = new Schema({
    type: { type: Number, default: 0 },
    first_name: String,
    last_name: String,
    email: { index: true, type: String, unique: true, lowercase:true,minlength:4 },
    password: String,
    mobile: { type: String, unique: true },
    gender: String,
    dob: Date,
    company_name: String,
    submission_date:{ type: Date, default: null},
    address: String,
    contact_person_name:String,
    interested_categories:[{type: SchemaTypes.ObjectId, ref: "category"}],
    documents: [{ type: Schema.Types.ObjectId, ref: "docs" }],
    activated: { type: Date, default: null },
    activation_token: String,
    valid_upto:{type:Date},
    expired:{type:Boolean, default: false},
    blocked: { type: Boolean, default: false },
    admin_approval:{ type: Boolean, default: false },
    img: { type: String, maxLength: 100 },
    token:String,
    notification: [{
        createdAt: { type: Date, default: null, index: true },
        productType: { type: String, default: null }, //E - event P -project
        projectId:{type:SchemaTypes.ObjectId , ref:'projects'},
        eventId:{type:SchemaTypes.ObjectId , ref:'events'},
        action:{type:String,default: null},
        message: { type: String },
        isShowed:{type:Boolean,default:false}

    }],
});


export const organizerSchema = mongoose.model('organizers', organizer)
