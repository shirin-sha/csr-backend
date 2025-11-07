import { applicantSchema } from "../models/applicant";
import { organizerSchema } from "../models/organizer";
import sponsorSchema from "../models/sponsor";

interface notificationInter {
    createdAt?: String,
    productType: String, //E - event P -project
    projectId?: String,
    eventId?: String,
    action: String,
    message: String,
    isShowed: Boolean,
}
interface receptorInterface {
    id: String,
    type: String //applicant ,sponsor ,organizer
}
export default async (receptor: receptorInterface, notific: notificationInter) => {
    let pushNotification;
    console.log({ notific });

    const notif = {
        createdAt: notific.createdAt,
        productType: notific.productType, //E - event P -project
        projectId: notific.projectId,
        eventId: notific.eventId,
        action: notific.action,
        message: notific.message,
        isShowed: notific.isShowed,
    }
    try {
        if (receptor.type == 'applicant') {
            pushNotification = await applicantSchema.updateOne({ _id: receptor.id }, { $push: { notification: notif } }).lean()
            console.log({ pushNotification });
            // if(pushNotification.modifiedCount ==0){
            //     log
            // }

        } else if (receptor.type == 'sponsor') {
            pushNotification = await sponsorSchema.updateOne({ _id: receptor.id }, { $push: { notification: notif } }).lean()
            console.log({ pushNotification });
            // if(pushNotification.modifiedCount ==0){
            //     log
            // }

        }
        else if (receptor.type == 'organizer') {
            pushNotification = await organizerSchema.updateOne({ _id: receptor.id}, { $push: { notification: notif } }).lean()
            console.log({ pushNotification });
            // if(pushNotification.modifiedCount ==0){
            //     log
            // }

        }
    } catch (error) {
        console.error('Error occurs in notification storing module', error);

    }


}