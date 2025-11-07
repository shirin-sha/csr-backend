import mongoose, { Document, Schema, SchemaTypes } from "mongoose";


const event = new Schema({
    status: { type: String, index: true, default: 'ACTIVE' },  //ACTIVE,INACTIVE
    event_title: { type: String, required: true },
    event_title_ar: { type: String, index: true },
    location:{type:String},
    type:{type:String,default:'PRIVATE'},  // PRIVATE ,PUBLIC
    number_of_attendees:{type:Number,default:0},
    from_date:{type:Date},
    to_date:{type:Date},
    category: [{ type: Schema.Types.ObjectId ,ref:'category'}],
    documents: [{ type: SchemaTypes.ObjectId, ref: "docs" }],
    budget: { type: Number, min: 1, required: true },
    added_sponsor: { type: SchemaTypes.ObjectId, ref: 'sponsors' },
    added_applicant: { type: SchemaTypes.ObjectId, ref: 'applicants' },
    submission_date: { type: Date, default: null },
    img: { type: String, maxLength: 100 },
    organizers: [{
        organizer_id: { type: SchemaTypes.ObjectId, ref: 'organizers' },
        amount: { type: Number, index: true, min: 1 },
        date: { type: Date, default: null ,index:true},
        note:{type:String,min:5},
        documents:[{ type: SchemaTypes.ObjectId, ref: "docs" }]
    }],
    fees: { type: Number, required: true },
    discount: { type: Schema.Types.ObjectId,ref:'discounts'},
    fee_without_discount: { type: Number },
    views: { type: Number, default: 0 },
    viewed_by: [{ type: SchemaTypes.ObjectId, ref: 'organizers' }],
    quote_count: { type: Number, default: 0 },
    quote_amount: { type: Number, default: 0 },

})

export const eventSchema = mongoose.model('events', event)