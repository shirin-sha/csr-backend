
import { any } from 'joi';
import mongoose from "mongoose"
import { eventSchema } from "../models/event"
import fileUploader from '../func/fileUpload'
import validator from "../func/validator"
import { Request, Response } from "express"
import transporter from '../func/mail_config'

import { updateEventToAlgolio } from '../func/algolio';

import { EventConformationLink, } from '../config/mailTemplates'
import { applicantSchema } from '../models/applicant';
import sponsorSchema from '../models/sponsor'
import notificationTranspoter from '../func/notificationTranspoter';
import { NotifEventConformation, NotifSponsorProjectConfirmation } from '../config/notifyTemplate';
import { Req } from '../types/types';
import { ACTIONS } from '../config/variables';



//list events
export const list_events = (data) => {

    return new Promise(async (resolve, reject) => {
        const limit = data.limit || 2
        const page = data.page || 1
        const condition = data.condition
        console.log({ condition });

        try {
            // fetch from DB -query
            const events = await eventSchema.find(
                condition, {
                fees: 0,
                documents: 0,
                organizers: 0,
                type: 0,
                quote_amount: 0,
                // img:1

            }).sort({ _id: -1 }).skip(limit * (page - 1)).limit(limit).populate('category')
            if (events === null || events.length === 0) {
                resolve({
                    success: false,
                    message: 'Events not found !'
                })
            }
            resolve({ page, limit, events })
        } catch (error) {
            reject({
                success: false,
                message: 'Internal server Error !' + error
            })
        }

    })
}

// find event details by id
export const event_details = (id) => {

    return new Promise(async (resolve, reject) => {
        try {

            id = new mongoose.Types.ObjectId(id)
            console.log('got at helper fn ', id);
            const event = await eventSchema.findOne({ _id: id }).populate('documents').populate('category')
            if (event === null) {
                resolve({
                    success: false,
                    message: 'event not found'
                })
            } else {
                resolve({
                    success: true,
                    message: 'got event details',
                    data: event
                })
            }

        } catch (error) {
            reject({
                success: false,
                message: 'database error ' + error
            })
        }

    })
}
// mail

// export const sendNotificationMail = (data) => {

//     return new Promise(async (resolve, reject) => {
//         let schema;
//         let string;
//         let role;
//         console.log({ data });
//         // for organizer
//         if (data.role === 1) {
//             schema = organizerSchema
//             string = 'organizer'
//             role=2
//         }
//         // for sponsor
//         if (data.role === 2) {
//             schema = sponsorSchema
//             string = 'sponsor'
//             role=1
//         }
//         console.log({ schema, string });

//         const user_id = data.id.toString()
//         const token_data = { email: data.email }
//         signing(token_data).then(async (token) => {
//             console.log('activated token: ', token);
//             // add activation token to database
//             await schema.updateOne({ _id: data.id },{ "activation_token": token , admin_approval: true  })

//             console.log('string :' + activating_link_string + token)

//             transporter(EventConformationLink(data.email,token,role)).then(info => {
//                 console.log('info :=>', info);
//                 resolve({ success: true, message: 'Notificaton sent' })

//             }).catch(err => {
//                 console.log('error from nodeMail', err);

//                 reject(err)
//             })

//         })
//     })
// }


// /addQuotation
export const addQuotation = async (req, res) => {
    const data = req.body
    const file = (req as any).files?.documents && (req as any).files.documents
    const userId = req.user_id

    console.log("daataaaaaaaaaaaaaaa", data);

    validator.quotations(data).then(async (response) => {

        const orgainzerExist = await eventSchema.findOne({ _id: data.event_id, "organizers.organizer_id": userId })
        console.log('organizer exist');

        console.log({ orgainzerExist });
        if (orgainzerExist !== null) {
            return res.status(200).json({ success: false, message: 'Your already quoted for this event' })

        }
        console.log('organizer exist');

        console.log({ orgainzerExist });

        let docId: any = []
        if (file) {
            const isArray: boolean = Array.isArray(file)
            if (isArray) {
                const promises = await file
                await Promise.all(promises.map(async (file: any) => {
                    const response: any = await fileUploader(file)
                    docId.push(response._id)
                    console.log({ docIdupload: docId });
                }))

                console.log('work completed');
                console.log({ docId });


            } else {
                await fileUploader(file).then(async (response: any) => {
                    console.log('document data uploaded id:', (response as any)._id)
                    docId.push(response._id)
                    console.log({ docId });


                })

            }
        }


        console.log('validation success and db update started');
        console.log({ docId });

        const quotation: any = {
            amount: data.amount,
            date: Date.now(),
            organizer_id: userId,
            note: data.note,
            documents: docId
        }
        console.log({ quotation })


        eventSchema.findByIdAndUpdate({ _id: data.event_id }, { $push: { organizers: quotation }, $inc: { quote_count: 1 } }).then(async (resp) => {
            console.log("emaildtaaaaaaaaaaaaaaa", data)

            const eventdetail: any = await eventSchema.findOne({ _id: data.event_id })
            console.log("eventdetail", eventdetail.added_applicant)
            let schema;
            let applicant_id;
            let applicantType;
            if (eventdetail.added_applicant) {
                console.log("applicant");

                schema = applicantSchema
                applicant_id = eventdetail.added_applicant
                applicantType = 'applicant'
            }
            else if (eventdetail.added_sponsor) {
                console.log("sponsor");

                schema = sponsorSchema
                applicant_id = eventdetail.added_sponsor
                applicantType = 'sponsor'

            }
            const usermail: any = await schema.findOne({ _id: applicant_id }).lean()
            console.log("usermaillllllllllllll", { usermail });
            if(usermail?._id){
                transporter(EventConformationLink(usermail.email))

                .then(info => {
                    console.log('info :=>', info);

                })
                .catch(err => {
                    console.log('error from nodeMail', err);

                })
                const receptor = {
                    id: applicant_id,
                    type: applicantType
                }
                const notification = {
                    createdAt: Date.now().toString(),
                    productType: 'E', //E - event P -project
                    eventId:data.event_id,
                    action: ACTIONS.AD,
                    message: NotifEventConformation(),
                    isShowed: false,
                }
           notificationTranspoter(receptor, notification)
            }
           
            const { organizers }: any = await eventSchema.findOne({ _id: data.event_id }).lean()
            console.log('updated sponsorships', { organizers });
            // update data to algolia server
            const record = {
                organizers: organizers,
                objectID: data.event_id,
            }
            updateEventToAlgolio(record, false)
            res.status(200).json({ success: true, message: 'quotation added' })


        }).catch((DBerr) => {
            console.log({ DBerr });
            res.status(200).json({ success: false, message: 'Database Error :' + DBerr.message })

        })


    }).catch((validation_error) => {
        console.log({ validation_error });
        res.status(200).json({ success: false, message: validation_error })


    })




}


export const listQuotation = async (req, res) => {
    const data = req.body
    console.log('list quotations');
    console.log('eventId', data.eventId);

    if (data === null || data === undefined) {
        return res.status(200).json({ message: 'body is empty', success: false })
    }

    const quotations :any= await eventSchema.findOne({ _id: data.eventId }, { organizers: 1, added_applicant: 1 }).populate('organizers.organizer_id', '_id company_name first_name last_name email mobile type islamic_type').populate('organizers.documents')
    const organizerSort=quotations?.organizers
    // console.log("organizerSort",organizerSort.sort());
     const sort = organizerSort.sort((a:any, b:any) => {
        return b.amount - a.amount;
    });
    console.log("sortttt",sort);
    
    console.log('quotations :', quotations);
    console.log('quotations organizer:', quotations?.organizers)
    if (quotations?.organizers?.length === 0) {
        return res.status(200).json({ message: 'organizers not found', success: false })

    }
    res.status(200).json({ success: true, data: quotations })

}

export const viewCount = async (req, res) => {
    try {
        const data = req.body
        console.log("viewcount", data.id)
        const userId=req.user_id
        console.log("uuuuuuuuuuuu",userId);
        eventSchema.exists({ $and:[{_id:data.id},{viewed_by: userId}] },async (err, res)=>{
            console.log("event view");
            if (res === null) {
                console.log("no user");
                const viewupdate = await eventSchema.updateOne({ _id: data.id }, {$push: { viewed_by: userId}},{
                    $inc: {
                        views
                            : 1
                    }
                })
                console.log("viewupdationnnnnnn",viewupdate);
            }
            else{
                console.error('user already found');
                
               
            }
        
        })
       
    }
    catch (error) {
        res.status(200).json({ success: false, message: 'viewcount failed' })

    }
}
export const closeEvent: any = async (req: Req, res: Response) => {

    // declare reqest data
    const bodyData: any = req.body
    //declare userid
    const userId = req.user_id

    // log data
    console.log('CLOSE EVENT   ', { bodyData }, { userId });

    try {
        if (!bodyData || bodyData === undefined) {
            throw ('data cant be got in server')
        }

        // update status in database
        const updatedEvent: any = await eventSchema.updateOne({ $and: [{ _id: bodyData.projectId }, { status: 'ACTIVE' }] }, { status: 'INACTIVE' }).select('status')
        console.log({ updatedEvent });

        if (updatedEvent.modifiedCount === 0) {
            throw (' event can`t be updated')
        } else {
            const record = {
                status: 'INACTIVE',
                objectID: bodyData.projectId
            }
            await updateEventToAlgolio(record, false)
        }

        return res.status(200).json({ message: 'event is closed', success: true })



    } catch (error) {
        const errorMessage: any = error
        return res.status(200).json({ success: false, message: errorMessage })
    }
}
