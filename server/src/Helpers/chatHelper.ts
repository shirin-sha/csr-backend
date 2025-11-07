import { applicantSchema } from "../models/applicant";
import { chatSchema } from "../models/chat";
import { organizerSchema } from "../models/organizer";
import sponsorSchema from "../models/sponsor";

import { projectSchema } from "../models/project";


export const startChat = async (req, res) => {
    try {
        console.log('start messgae ...');

        const userType = req.role
        const data = req.body
        console.log({ userType, data });

        if (data == null || data == undefined) {
            res.status(200).json({ success: false, message: 'Request data is empty !' })

        }

        let schema;


        //user is applicant
        switch (userType) {
            case 1:
                console.log(' iam applicant');

                schema = data.isEvent ? organizerSchema : sponsorSchema

                break;
            case 2:
                console.log(' iam organizer');
                schema = data.isEvent ? (data.isApplicant ? applicantSchema : sponsorSchema) : sponsorSchema
                break;
            case 3:
                console.log(' iam sponsor');
                schema = data.isEvent ? organizerSchema : (data.isApplicant ? applicantSchema : organizerSchema)

            default:
                break;
        }
      
        console.log('my schema', schema);

        const ownerData = await schema.findOne({ _id: data.ownerId }, { first_name: 1, company_name: 1 }).lean()
        console.log('message to .....', data.ownerId, { ownerData });

        const checkChatRoom: any = await chatSchema.exists({ $and: [{ "users.userId": data.ownerId }, { "users.userId": data.userId }] }).lean()

        console.log({ checkChatRoom });
        if (!checkChatRoom) {
            const chatData = {
                users: [
                    {
                        userId: data.ownerId,
                        name: ownerData.first_name || ownerData.company_name
                    },
                    {
                        userId: data.userId,
                        name: data.userName
                    }

                ]
            }
            const result = await chatSchema.insertMany(chatData)
            console.log({ result }, { chatData });

            res.status(200).json({ success: true, message: 'new chat room added', data: result[0]._id })

        } else {
            res.status(200).json({ success: true, message: 'this chat room already exist', data: checkChatRoom._id })

        }

    } catch (error) {
        res.status(200).json({ success: false, message: 'error occured' + error })

    }


}


export const getChatsData = async (req, res) => {

    try {

        const userId = req.user_id

        console.log({ userId });



        const chatData = await chatSchema.find({ 'users.userId': userId }).lean()

        if (chatData) {
            res.status(200).json({ success: true, message: 'chat data are fetched', data: chatData })

        } else {
            res.status(200).json({ success: false, message: 'chat data cant  fetched', data: chatData })

        }

    } catch (error) {
        res.status(200).json({ success: false, message: 'error occured' + error })

    }



}