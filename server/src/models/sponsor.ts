import mongoose, { Document, Schema, Types,SchemaTypes } from "mongoose";

const sponsor = new Schema({
    company_name: String,
    email: { index: true, type: String, unique: true  ,lowercase:true,minlength:4},
    secondemail: { index: true, type: String, unique: true  ,lowercase:true,minlength:4},
    password: String,
    mobile: { type: String, unique: true },
    address: String,
    contact_person_name:String,
    interested_categories:[{type: SchemaTypes.ObjectId, ref: "category"}],
    documents: [{ type:Schema.Types.ObjectId, ref: "docs", default: null }],
    activated: { type: Date, default: null },
    submission_date:{ type: Date, default: null},
    activation_token: String,
    type:{type:Number,default:0},  //default : conventional :0 ;islamic: 1
    islamic_type:{type:String},  //general or Clearance -Tatheer
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


export default  mongoose.model('sponsors', sponsor)
