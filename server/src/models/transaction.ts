import mongoose, { Document, Schema, Types, SchemaTypes } from "mongoose";



const transaction = new Schema({
    applicantId: { type: Types.ObjectId, ref: 'applicants' },
    sponsorId: { type: Types.ObjectId, ref: 'sponsors' },
    organizerId: { type: Types.ObjectId, ref: 'organizers' },
    productType: { type: String }, // project ,event
    projectId: { type: Types.ObjectId, ref: 'projects' },
    eventId: { type: Types.ObjectId, ref: 'events' },
    paymentAmount: { type: Number, default: 0 },
    paymentDate: { type: Date, default: Date.now() },
    status: { type: Number, default: 0 },


});


export const transactionSchema = mongoose.model('transaction', transaction)
