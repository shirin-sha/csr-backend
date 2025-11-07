import mongoose, { Document, Schema, SchemaType } from "mongoose";


const discount = new Schema({
    date:{type:Date,default:null},
    type:{type:Number},
    discount_for_applicant:{type:Schema.Types.ObjectId,ref:'applicants'},
    discount_for_organizer:{type:Schema.Types.ObjectId,ref:'organizers'},
    discount_for_sponsor:{type:Schema.Types.ObjectId,ref:'sponsors'},

    expire_date:{type:Date,default:null}, 
    rate:{type:Number,max:100,min:0} // 0: project ,1:event
})

export const discountSchema = mongoose.model('discounts', discount)