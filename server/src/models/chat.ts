import { string } from "joi";
import mongoose, { Document, Schema, Types, SchemaTypes } from "mongoose";



const chats = new Schema({
    users: [
        {
            name: String,
            userId: { type: SchemaTypes.ObjectId }
        }

    ]
});


export const chatSchema = mongoose.model('chats', chats)
