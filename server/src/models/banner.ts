import { Schema, model } from 'mongoose'

const banner = new Schema({
    imageUrl: { type: String, required: true },
    alt: { type: String, required: true },
    createdAt: { type: Date },
},{
   capped:{
    max:5
   }
})
export const bannerSchema = model('banner', banner)