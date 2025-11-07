import mongoose, { Document, Schema, SchemaTypes } from "mongoose";


const project = new Schema({
    status: { type: String, index: true, default: 'ACTIVE' },  //ACTIVE,CLOSED,INACTIVE,EXPIRED,ARCHIVE
    name: { type: String, index: true, required: true},
    name_ar: { type: String, index: true },
    category: [{ type: Schema.Types.ObjectId ,ref:'category'}],
    documents: [{ type: SchemaTypes.ObjectId, ref: "docs" ,required:true}],
    budget: { type: Number, min: 1, required: true },
    added_organizer: { type: SchemaTypes.ObjectId, ref: 'organizers' },
    added_applicant: { type: SchemaTypes.ObjectId, ref: 'applicants' },
    submission_date: { type: Date, default: null },
    img: { type: String, maxLength: 100 },

    sponsorships: [{
        status: { type: Number, default: 0 },  // 0: active, 1:queue
        sponsor_id: { type: SchemaTypes.ObjectId, ref: 'sponsors'},
        amount: { type: Number, index: true, min: 1 },
        applicant_status: { type: Boolean }, // confirmation of applicant
        sponsor_status: { type: Boolean }, // confirmation by sponsor
        
        deleted_date: { type: Date, default: null },
        deleted_by: { type: Number, min: 0, max: 1 ,default:null},
        hide_name: { type: Boolean, default: false },
        type: { type: String, default: 'GENERAL' }  //GENERAL, CLEARANCE

    }],
    fee: { type: Number, required: true },
    //discount: { type: Number },
    fee_without_discount: { type: Number },
    views: { type: Number, default: 0 },
    viewed_by: [{ type: SchemaTypes.ObjectId, ref: 'sponsors' }],
    sponsor_count: { type: Number, default: 0 },
    sponsor_amount: { type: Number, default: 0 },
    log: [{
        status: { type: String },
        date: { type: Date, default: null }
    }],
    expire_date: { type: Date, default: null },
    extend_date: { type: Date, default: null },

    renew_amount: { type: Number, default: 0 },
    marked: { type: Boolean, default: false }

})

export const projectSchema = mongoose.model('projects', project)