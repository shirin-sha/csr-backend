import mongoose, { Document, Schema, SchemaType } from "mongoose";


const contactInfo = new Schema({
    contact_email: { type: String ,lowercase:true,minlength:3,default:'abc.32gmail.co'},
    contact_mobile:{ type: String ,default:'+90901221'},
    contact_location: { type: String ,default:"malappuram,kerala"}
})

export const contactSchema = mongoose.model('contactInfo', contactInfo)