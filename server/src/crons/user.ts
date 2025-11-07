import dayjs from 'dayjs'
import { applicantSchema } from '../models/applicant'
import { organizerSchema } from '../models/organizer'
import sponsorSchema from '../models/sponsor'


export const deleteInactiveAccountsApplicant = async () => {

    try {
        const applicants = await applicantSchema.find({ activated: null }).select('activated company_name first_name  submission_date').lean()

        applicants.map(async (user, idx) => {
            // declrating submission_date of user
            const submissionDate = dayjs(user.submission_date)

            //find date difference between submission date and time at now
            const dateDiff = dayjs(Date.now()).diff(submissionDate, 'd')

            console.log(dateDiff);
            console.log(applicants);

            if (dateDiff >= 180) {
                const delete_applicant = await applicantSchema.deleteOne({ _id: user._id })
                console.log({ delete_applicant });

            }

        })
    } catch (error) {
        console.error('error from remove inactive account ', error)
    }


}

export const deleteInactiveAccountsSponsor = async () => {

    try {
        const sponsors = await sponsorSchema.find({ activated: null }).select('activated company_name   submission_date').lean()

        sponsors.map(async (user, idx) => {
            // declrating submission_date of user
            const submissionDate = dayjs(user.submission_date)

            //find date difference between submission date and time at now
            const dateDiff = dayjs(Date.now()).diff(submissionDate, 'd')

            console.log(dateDiff);
            console.log(sponsors);

            if (dateDiff >= 180) {
                const delete_sponsor = await sponsorSchema.deleteOne({ _id: user._id })
                console.log({ delete_sponsor });

            }

        })
    } catch (error) {
        console.error('error from remove inactive account ', error)

    }


}

export const deleteInactiveAccountsOrganizer = async () => {

    try {
        const organizers = await organizerSchema.find({ activated: null }).select('activated company_name first_name  submission_date').lean()

        organizers.map(async (user, idx) => {
            // declrating submission_date of user
            const submissionDate = dayjs(user.submission_date)

            //find date difference between submission date and time at now
            const dateDiff = dayjs(Date.now()).diff(submissionDate, 'd')

            console.log(dateDiff);
            console.log(organizers);

            if (dateDiff >= 180) {
                const delete_organizer = await organizerSchema.deleteOne({ _id: user._id })
                console.log({ delete_organizer });

            }

        })
    } catch (error) {
        console.error('error from remove inactive account ', error)
    }


}

export const expireOrganizer = async () => {

    try {
        const now = new Date();
        const organizers = await organizerSchema.updateMany({ valid_upto: { $lt: now } },{expired:true})
        console.log({ organizers });


    } catch (error) {
        console.error('error from expire organizer module  ', error)

    }
}