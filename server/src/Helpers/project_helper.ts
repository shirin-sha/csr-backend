import { valid } from "joi"
import mongoose, { Schema } from "mongoose"
import { ACTIONS, Mail } from "../config/variables"
import validator from "../func/validator"
import { applicantSchema } from "../models/applicant"
import { projectSchema } from "../models/project"
import sponsor from "../models/sponsor"
import transporter from '../func/mail_config'
import { organizerSchema } from "../models/organizer"
import sponsorSchema from '../models/sponsor'
import { applicantProjectConfirmation, applicantProjectSponsorRemove, applicantQueedProject, closeProjectTemplate, sponsorProjectConfirmation, sponsorProjectRemove } from '../config/mailTemplates'

import { updateProjectToAlgolio } from "../func/algolio"
import notificationTranspoter from "../func/notificationTranspoter"
import { NotifApplicantProjectConfirmation, NotifApplicantProjectSponsorRemove, NotifApplicantQueedProject, NotifSponsorProjectConfirmation, NotifSponsorProjectRemove } from "../config/notifyTemplate"





export const list_projects = (data) => {

    return new Promise(async (resolve, reject) => {
        const limit = data.limit || 2
        const page = data.page || 1
        const condition = data.condition
        try {
            console.log(condition);

            // fetch from DB -query
            const projects = await projectSchema.find(
                condition, {
                name: 1,
                status: 1,
                name_ar: 1,
                category: 1,
                budget: 1,
                submission_date: 1,
                views: 1,
                sponsor_count: 1,
                expire_date: 1,
                marked: 1,
                img: 1
            }).sort({ _id: -1 }).skip(limit * (page - 1)).limit(limit).populate('category').lean()
            if (projects === null || projects.length === 0) {
                resolve({
                    success: false,
                    message: 'Content not found' + projects
                })
            }

            const count = await projectSchema.countDocuments(condition)
            console.log({ count });

            resolve({ count, page, limit, projects })
        } catch (error) {
            reject({
                success: false,
                message: 'internal server Error ' + error
            })
        }

    })
}

// find project details by id
export const project_details = (id: any, isSponsor, userId?) => {

    return new Promise(async (resolve, reject) => {
        try {

            id = new mongoose.Types.ObjectId(id)
            console.log('got at helper fn ', id);

            if (isSponsor) {
                const viewedBy = await sponsorSchema.updateOne({ _id: userId , "notification.isShowed": false }, { $set:{'notification.$.isShowed': true}},{ "multi": true })
                console.log({viewedBy});
                
                const project: any = await projectSchema.findOne({ _id: id }, {
                    marked: 0, log: 0, renew_amount: 0
                }).populate('documents').populate('category').populate('sponsorships.sponsor_id', '_id company_name email mobile type islamic_type').lean().catch((e) => {
                    console.log('database error', e);

                })
                console.log({ project });
                const mySponsorShip = project.sponsorships.filter((dat) => {
                    //  console.log('data sponsor ', dat);

                    return dat.sponsor_id._id == userId
                })
                const activeSponsorShip = project?.sponsorships.filter((dat) => {
                    //  console.log('data sponsor act', dat);
                    return dat.status == 0 && dat.sponsor_id._id != userId
                })
                console.log({ mySponsorShip });
                console.log({ activeSponsorShip });

                project.sponsorships = null
                console.log('sponsorships for applicant view:', project?.sponsorships);

                if (project === null) {
                    resolve({
                        success: false,
                        message: 'project not found'
                    })
                } else {
                    resolve({
                        success: true,
                        message: 'got project details',
                        data: project,
                        mySponsorShip,
                        activeSponsorShip
                    })
                }

            } else {
                const project: any = await projectSchema.findOne({ _id: id }, {
                    marked: 0, log: 0, renew_amount: 0
                }).populate('documents').populate('category').populate('sponsorships.sponsor_id', 'company_name _id').catch(e => {
                    console.log('database error', e);

                })
                console.log({ project });
                console.log('sponsorships for applicant view:', project.sponsorships);


                if (project === null) {
                    resolve({
                        success: false,
                        message: 'project not found'
                    })
                } else {
                    resolve({
                        success: true,
                        message: 'got project details',
                        data: project
                    })
                }

            }



        } catch (error) {
            reject({
                success: false,
                message: 'Internal server error ' + error
            })
        }

    })
}

export const changeStatus = (req, res) => {
    const data = req.body
    let condition: {
        _id: string,
        status: string
    } = {
        _id: '',
        status: ''
    }
    if (data == null || data == undefined) {
        console.log('data is empty');
        res.status(200).json({ success: false, message: 'received data is empty' })

    }
    console.log({ data });

    if (data.status === 'ACTIVE') {
        condition = { _id: data.id, status: 'INACTIVE' }
    } else if (data.status === 'INACTIVE') {
        condition = { _id: data.id, status: 'ACTIVE' }
    }
    console.log(condition);

    projectSchema.updateOne(condition, { status: data.status }).then(async (resp: any) => {
        if (resp.modifiedCount === 0) {
            console.error(resp);
            res.status(200).json({ success: false, message: 'change status of project cant proceed' })

        } else {
            const record = {
                objectID: data.id,
                status: data.status
            }

            await updateProjectToAlgolio(record)
            res.status(200).json({ success: true, message: 'status is changed', data: resp.message })

        }
    })
}


export const addSponsorShip = (req, res) => {
    const data = req.body
    const userId = req.user_id
    console.log('sponsorship....');

    console.log({ data });
    console.log({ userId });

    if (!data) {
        console.log('data not found');
        res.status(200).json({ success: false, message: `body data cant access from server` })

    }

    validator.sponsor_ships(data).then(async (formValidationResult: any) => {
        console.log({ formValidationResult });

        console.log(`id:`, userId);

        const sponsorship: any = {
            status: data.status,
            sponsor_id: userId,
            amount: data.amount,
            hide_name: data.hide_name,
            type: data.type ?? 'GENERAL',
            sponsor_status: false,
            applicant_status: false,

        }
        console.log('SPONSOSORSHIP FORM', { sponsorship });

        // const isExist :any=projectSchema.exists({sponsorships.sponsor_id:sponsorship.sponsor_id})

        const currentDate = Date.now()

        // queue state
        if (data.status == 1) {
            projectSchema.updateOne({ $and: [{ _id: data.project_id }, { status: 'QUEUE' }] }, { $push: { sponsorships: sponsorship, log: { status: 'sponsorship added to this queue project', date: currentDate } } }).then(async (dbResult) => {
                console.log('queue project update', dbResult);
                if (dbResult.modifiedCount === 0) {
                    return res.status(200).json({ success: false, message: ` This project sponsorship have some issue ` })


                } else {
                    const { sponsorships }: any = await projectSchema.findOne({ _id: data.project_id }).lean()
                    console.log('updated sponsorships', { sponsorships });
                    // update data to algolia server

                    const record = {
                        sponsorships: sponsorships,
                        status: 'QUEUE',

                        objectID: data.project_id,
                    }
                    updateProjectToAlgolio(record)
                    return res.status(200).json({ success: true, message: dbResult })

                }

            }).catch((DbError: any) => {
                console.log({ DbError });
                return res.status(200).json({ success: false, message: DbError.message })

            })
        }

        // at active state
        if (data.status == 0) {

            projectSchema.findOneAndUpdate({ $and: [{ _id: data.project_id }, { status: 'ACTIVE' }] }, { $push: { sponsorships: sponsorship, log: { status: 'sponsorship added to this project', date: currentDate } }, $inc: { sponsor_amount: sponsorship.amount, sponsor_count: 1 } }).then(async (dbResult) => {
                console.log('active project update', dbResult);


                const queueStatusChange = await projectSchema.updateOne({ $and: [{ _id: data.project_id }, { sponsor_amount: { $gte: dbResult?.budget } }] }, { status: 'QUEUE', $push: { log: { status: 'project  status changed to QUEUE', date: currentDate } } })
                console.log({ queueStatusChange });
                // update data to algolia server
                const status = queueStatusChange.matchedCount > 0 ? 'QUEUE' : 'ACTIVE'

                const { sponsorships }: any = await projectSchema.findOne({ _id: data.project_id }).lean()
                console.log('updated sponsorships', { sponsorships });

                const record = {
                    sponsorships: sponsorships,
                    status: status,

                    objectID: data.project_id,
                }
                updateProjectToAlgolio(record)
                return res.status(200).json({ success: true, message: dbResult })



            }).catch((DbError: any) => {
                console.log({ DbError });
                return res.status(200).json({ success: false, message: DbError.message })

            })

        }




    }).catch((validationError: any) => {
        return res.status(200).json(validationError)

    })


}

export const confirmBid = async (req, res) => {
    const project = req.body.project
    const project_id = project?._id

    const mySponsorship = req.body.sponsorship
    const id = req.user_id
    console.log({ project_id }, { id });
    console.log('projects for confirm', { project });

    if (project_id == null || project_id == undefined || id == null || id == undefined) {
        return res.status(200).json({ message: 'database updating failed', success: false })

    }
    console.log({ project }, { project_id }, { mySponsorship });

    const dbResult = await projectSchema.updateOne({ _id: project_id, 'sponsorships.sponsor_id': id }, { $set: { "sponsorships.$[el].sponsor_status": true } },
        { arrayFilters: [{ "el.sponsor_id": id }] })
    console.log({ dbResult })
    if (dbResult.matchedCount === 0) {
        return res.status(200).json({ message: 'Sponsorship confirmation failed', success: false })
    } else {
        let schema;
        let applicant_id;
        let applicantType
        if (project.added_applicant) {
            console.log(
                'this is applicant'
            );
            schema = applicantSchema
            applicant_id = project.added_applicant
            applicantType = 'applicant'
        } else if (project.added_organizer) {
            console.log(
                'this is organizer'
            );
            schema = organizerSchema
            applicant_id = project.added_organizer
            applicantType = 'organizer'

        }
        const applicant: any = await schema.findOne({ _id: applicant_id })
        console.log({ applicant });

        if (applicant?._id) {

            transporter(sponsorProjectConfirmation(applicant, project, mySponsorship)).then(info => {
                console.log('info :=>', info);
            })
            // send notification
            const receptor = {
                id: applicant._id,
                type: applicantType
            }
            const notification = {
                createdAt: Date.now().toString(),
                productType: 'P', //E - event P -project
                projectId: project_id,
                action: ACTIONS.CF,
                message: NotifSponsorProjectConfirmation(applicant, project, mySponsorship),
                isShowed: false,
            }
            notificationTranspoter(receptor, notification).catch(err => {
                return res.status(200).json({ message: err, success: false })

            })
        }


        return res.status(200).json({ message: 'database updating success', success: true })


    }

}
export const acceptBid = async (req, res) => {

    const project_id = req.body.project_id
    const id = req.body.sponsor_id
    console.log({ project_id }, { id });
    if (project_id == null || project_id == undefined || id == null || id == undefined) {
        return res.status(200).json({ message: 'database updating failed', success: false })

    }
    const dbResult = await projectSchema.updateOne({ _id: project_id, 'sponsorships.sponsor_id': id }, { $set: { "sponsorships.$[el].applicant_status": true } },
        { arrayFilters: [{ "el.sponsor_id": id }] })
    console.log({ dbResult })
    if (dbResult.matchedCount === 0) {
        return res.status(200).json({ message: 'database updating failed', success: false })
    } else {

        const sponsor: any = await sponsorSchema.findOne({ _id: id }).lean()
        if (sponsor?._id) {

            transporter(applicantProjectConfirmation(sponsor)).then(info => {
                console.log('info :=>', info);
            })
            console.log({ sponsor });
            const receptor = {
                id: id,
                type: 'sponsor'
            }
            const notification = {
                createdAt: Date.now().toString(),
                productType: 'P', //E - event P -project
                projectId: project_id,
                action: ACTIONS.AC,
                message: NotifApplicantProjectConfirmation(sponsor),
                isShowed: false,
            }
            notificationTranspoter(receptor, notification)
        }




        return res.status(200).json({ message: 'database updating success', success: true })
    }

}
export const removeBid = async (req, res) => {
    console.log('body', req.body);

    const project_id = req.body.project_id
    const amount = req.body.amount
    const id = req.user_id
    console.log({ project_id }, { id }, { amount });
    // check bodydata
    if (project_id == null || project_id == undefined || id == null || id == undefined) {
        return res.status(200).json({ message: 'database updating failed', success: false })

    }
    console.log('sponsor id', id);

    // get sponsorship from sponsorship list
    const findSponsorship: any = await projectSchema.findOne({ _id: project_id }, {
        added_applicant: 1, added_organizer: 1,
        sponsorships: {

            $elemMatch: {
                sponsor_id: id,
            }

        }
    })

    console.log('sponosrships', { findSponsorship });

    // assign sponsorship to variable
    const mySponsorship = findSponsorship?.sponsorships[0]
    console.log({ mySponsorship });

    // if sponsorship not found then respond error message
    if (findSponsorship == null) {
        return res.status(200).json({ message: "We cant identify your authorization ,please  login ", success: false })

    }

    // if both sponsor and applicant confirmed the sponsorship , then we cant delete this request 
    if (mySponsorship && mySponsorship?.applicant_status === true && mySponsorship?.sponsor_status === true) {
        console.log('this is confirmed project');

        return res.status(200).json({ message: "You cannot remove this sponsorship,\n Because this sponsorship already confirmed by applicant and sponsor", success: false })
    }
    let removedCount = mySponsorship?.deleted_by
    console.log({ removedCount });
    const currentdate = Date.now()

    let dbResult;
    if (mySponsorship !== undefined) {
        if (removedCount == 1 || mySponsorship.status == 1) {
            dbResult = await projectSchema.updateOne({ $and: [{ _id: project_id }, { 'sponsorships.sponsor_id': id }] }, { $pull: { "sponsorships": { sponsor_id: id } }, $push: { log: { status: 'sponsorship is removed by sponsor', date: currentdate } } })
        } else {
            dbResult = await projectSchema.updateOne({ $and: [{ _id: project_id }, { 'sponsorships.sponsor_id': id }] }, { $pull: { "sponsorships": { sponsor_id: id } }, $inc: { sponsor_amount: -amount, sponsor_count: -1 }, $push: { log: { status: 'sponsorship is removed by sponsor', date: currentdate } } })

        }
    } else {
        return res.status(200).json({ message: "We cant identify your authorization ,please  login ", success: false })

    }

    // change queue state to active

    console.log({ dbResult })
    if (dbResult.matchedCount === 0 || dbResult.modifiedCount == 0) {
        return res.status(200).json({ message: 'database updating failed', success: false })
    } else {
        const queueStatusChange = await projectSchema.updateOne({ $and: [{ _id: project_id }, { status: 'QUEUE' }, { $expr: { $lt: ["$sponsor_amount", "$budget"] } }] }, { status: 'ACTIVE', $push: { log: { status: 'sponsorship is removed by sponsor', date: currentdate } } })
        if (queueStatusChange.matchedCount == 1 && queueStatusChange.modifiedCount == 1) {
            const records = {
                status: 'ACTIVE',
                objectID: project_id
            }
            console.log('algolia update status');

            await updateProjectToAlgolio(records)
        }
        console.log({ queueStatusChange });
        let schema;
        let applicant_id;
        let applicantType;
        if (findSponsorship.added_applicant) {
            console.log(
                'this is applicant'
            );
            schema = applicantSchema
            applicant_id = findSponsorship.added_applicant
            applicantType = 'applicant'
        } else if (findSponsorship.added_organizer) {
            console.log(
                'this is organizer'
            );
            schema = organizerSchema
            applicant_id = findSponsorship.added_organizer
            applicantType = 'organizer'

        }
        console.log({ applicant_id });
        console.log({ schema });


        const applicant: any = await schema.findOne({ _id: applicant_id }).lean()
        console.log({ applicant });
        if (applicant?._id) {
            transporter(sponsorProjectRemove(applicant, mySponsorship)).then(info => {
                console.log('info :=>', info);
            })
            const receptor = {
                id: applicant_id,
                type: applicantType
            }
            const notification = {
                createdAt: Date.now().toString(),
                productType: 'P', //E - event P -project
                projectId: project_id,
                action: ACTIONS.RM,
                message: NotifSponsorProjectRemove(applicant, mySponsorship),
                isShowed: false,
            }
            notificationTranspoter(receptor, notification)
        }


        return res.status(200).json({ message: 'database updating success', success: true })
    }
}

export const removeBidByapplicant = async (req, res) => {
    console.log('body', req.body);

    const project_id = req.body.project_id
    const amount = -req.body.amount
    const id = req.user_id
    const sponsor_id = req.body.sponsor_id
    console.log({ project_id }, { id }, { amount }, { sponsor_id });
    if (project_id == null || project_id == undefined || id == null || id == undefined) {
        return res.status(200).json({ message: 'data not found', success: false })

    }
    const findSponsorship: any = await projectSchema.findOne({ _id: project_id, "sponsorships.sponsor_id": sponsor_id }, {
        sponsorships: {
            $elemMatch: {
                sponsor_id: sponsor_id,
            },
        }
    })
    console.log('sponosrships', { findSponsorship });
    const mySponsorship = findSponsorship?.sponsorships[0]
    console.log({ mySponsorship });

    if (mySponsorship && mySponsorship?.applicant_status === true && mySponsorship?.sponsor_status === true) {
        console.log('this is confirmed project');

        return res.status(200).json({ message: "you cannot remove this sponsorship, Because this sponsorship already confirmed by applicant and sponsor", success: false })
    }
    try {
        const dbResult = await projectSchema.updateOne({
            _id: project_id
        }, { $inc: { sponsor_count: -1, sponsor_amount: amount }, $set: { "sponsorships.$[outer].deleted_by": 1 } }, { "arrayFilters": [{ "outer.sponsor_id": sponsor_id }] })
        console.log({ dbResult });

        if (dbResult.matchedCount === 0 || dbResult.modifiedCount == 0) {
            return res.status(200).json({ message: 'database updating failed', success: false })
        } else {

            const resultProject = await projectSchema.findOne({ _id: project_id }, { sponsor_amount: 1, status: 1, budget: 1 }).lean()
            console.log({ resultProject });

            if (resultProject?.status == 'QUEUE' && resultProject.budget >= resultProject.sponsor_amount) {

                const resultStatusUpdate = await projectSchema.updateOne({ _id: project_id }, { status: 'ACTIVE' }).lean()
                console.log({ resultStatusUpdate });
                if (resultStatusUpdate.modifiedCount > 0) {
                    const record = {
                        objectID: project_id,
                        status: 'ACTIVE'
                    }
                    updateProjectToAlgolio(record)
                }

            }
            const sponsor: any = await sponsorSchema.findOne({ _id: sponsor_id }).lean()
            if (sponsor?._id) {
                console.log({ sponsor });
                transporter(applicantProjectSponsorRemove(sponsor)).then(info => {
                    console.log('info :=>', info);
                })
                const receptor = {
                    id: sponsor_id,
                    type: 'sponsor'
                }
                const notification = {
                    createdAt: Date.now().toString(),
                    productType: 'P', //E - event P -project
                    projectId: project_id,
                    action: ACTIONS.RM,
                    message: NotifApplicantProjectSponsorRemove(sponsor),
                    isShowed: false,
                }
                notificationTranspoter(receptor, notification)
            }





            return res.status(200).json({ message: 'database updating success', success: true })
        }
    } catch (err) {
        console.log('db error', { err });

    }


}

// accept queued request by applicant
export const acceptQueue = async (req, res) => {

    console.log('request for accept queue request');

    const project_id = req.body.project_id
    const id = req.body.sponsor_id
    const amount = req.body.amount
    console.log({ project_id }, { id });
    if (project_id == null || project_id == undefined || id == null || id == undefined) {
        return res.status(200).json({ message: 'database updating failed', success: false })

    }
    const projectStatus = await projectSchema.exists({ _id: project_id, $expr: { $gte: ["$sponsor_amount", "$budget"] } })
    if (projectStatus) {
        return res.status(200).json({ message: 'You must delete one of the offer from main list', success: false })

    }
    console.log({ projectStatus });

    const dbResult = await projectSchema.updateOne({ _id: project_id, 'sponsorships.sponsor_id': id }, { $set: { "sponsorships.$[el].status": 0 }, $inc: { sponsor_amount: amount, sponsor_count: 1 } },
        { arrayFilters: [{ "el.sponsor_id": id }] })
    console.log({ dbResult })
    if (dbResult.matchedCount === 0) {
        return res.status(200).json({ message: 'database updating failed', success: false })
    } else {

        const sponsor: any = await sponsorSchema.findOne({ _id: id }).lean()
        if (sponsor?._id) {
            transporter(applicantQueedProject(sponsor)).then(info => {
                console.log('info :=>', info);
            })
            console.log({ sponsor });
            const receptor = {
                id: id,
                type: 'sponsor'
            }
            const notification = {
                createdAt: Date.now().toString(),
                productType: 'P', //E - event P -project
                projectId: project_id,
                action: ACTIONS.AC,
                message: NotifApplicantQueedProject(sponsor),
                isShowed: false,
            }
            notificationTranspoter(receptor, notification)
        }


        return res.status(200).json({ message: 'database updating success', success: true })
    }
}

// viewcount
export const viewCount = async (req, res) => {
    try {
        const data = req.body
        console.log("dataaaa", data);

        const userId = req.user_id
        console.log("uuuuuuuuuuuu", userId);

        console.log("viewcount", data.id);

        // const userexist=await projectSchema.find({viewed_by:{ $in : userId}})

        projectSchema.exists({ $and:[{_id:data.id},{viewed_by: userId}] }, async (err, res) => {
            console.log("project view");

            if (res === null) {
                console.log("no user");

                const viewupdate = await projectSchema.updateOne({ _id: data.id }, { $push: { viewed_by: userId } }, {
                    $inc: {
                        views
                            : 1
                    }
                })
                console.log("viewupdationnnnnnn", viewupdate);

            }
            else {
                console.error('user already found');


            }
        })

    }
    catch (error) {
        res.status(200).json({ success: false, message: 'viewcount failed' })

    }
}

export const endSponsor = async (req, res) => {
    // data declaration
    const projectId = req.body.id
    console.log('end sponsor', projectId);

    // check body data
    if (!projectId || projectId == undefined) {
        return res.status(200).json({ success: false, message: 'Id not found' })
    }
    //------------------------------------------------
    try {


        //  const result = await projectSchema.updateOne({ $and: [{ _Id: projectId }, { status: 'ACTIVE' }] }, { $set: { status: 'CLOSED' } }).lean()

        const result = await projectSchema.updateOne({ $and: [{ _id: projectId }, { status: 'ACTIVE' }] }, { $set: { status: 'CLOSED' } }, { new: true })
        console.log('end sponsor', { result })
        // if updation not work
        if (result.modifiedCount === 0) {
            // checkqueue list
            console.log('queue filtering ..');

            const queueFilter = await projectSchema.exists({ $and: [{ _id: projectId }, { status: 'QUEUE' }, { sponsorships: { $elemMatch: { status: 1 } } }] })
            console.log({ queueFilter });
            // if no qeue request exist in project ,then close the project
            if (!queueFilter) {
                const result = await projectSchema.updateOne({ $and: [{ _id: projectId }, { status: 'QUEUE' }] }, { status: 'CLOSED' })
                if (result.modifiedCount !== 0) {

                    closeProject()
                }

            } else {
                // else return message
                return res.status(200).json({ success: false, message: 'Project can`t be closed, may be you have sponsorship request in queue list ' })
            }


        } else {
            closeProject()
        }


        // calling functions
        async function closeProject() {
            const records = {
                status: 'CLOSED',
                objectID: projectId
            }

            console.log('inactived ', { records })

            updateProjectToAlgolio(records)
            /// send mails to sponsors

            // sponsors email
            const fetchData: any = await projectSchema.findOne({ _id: projectId }, { 'sponsorships.sponsor_id': 1, name: 1, }).populate('sponsorships.sponsor_id', 'email company_name').lean()
            const name = fetchData.name
            console.log({ name });

            fetchData.sponsorships.map((data, idx) => {
                console.log('sponsors data', data);
                transporter(closeProjectTemplate(data.sponsor_id, name)).then(info => {
                    console.log('info :=>', info);
                })

            })

            return res.status(200).json({ success: true, message: 'Project is closed' })
        }


    } catch (error) {
        return res.status(200).json({ success: false, message: error })

    }
}


export const editSponsor = async (req, res) => {

    const bodyData = req.body;
    const sponsorId = req.user_id
    const projectId: string = bodyData?.project_id
    console.log('edit data', bodyData, sponsorId);

    try {

        if (!bodyData.amount) {
            return res.status(200).json({ message: 'request failed', success: false });
        }
        // project details
        const projectData: any = await projectSchema.findOne({ $and: [{ _id: bodyData.project_id }, { sponsorships: { $elemMatch: { sponsor_id: sponsorId } } }, { 'sponsorships.sponsor_id': sponsorId }] }, { 'sponsorships.$': 1, sponsor_amount: 1, status: 1 }).lean()


        console.log({ projectData })
        console.table(projectData.sponsorships)
        const sponsorship = projectData.sponsorships[0]
        console.table(sponsorship)
        console.log('sponsorship', projectData.sponsorships)



        const newSponsorAmount: any = parseFloat(projectData.sponsor_amount) - parseFloat(sponsorship.amount) + parseFloat(bodyData.amount)
        if (sponsorship.applicant_status == true && sponsorship.sponsor_status == true) {
            return res.status(200).json({ message: 'This project is confirmed by both applicant and sponsor ,So you cant edit this project', success: false })

        }


        // update project in 2 cases that whic queue listed request and default request
        const editProject: any = sponsorship.status == 0 ? await projectSchema.updateOne({
            _id: bodyData.project_id
        }, { $set: { sponsor_amount: parseInt(newSponsorAmount), "sponsorships.$[outer].amount": bodyData.amount, "sponsorships.$[outer].hide_name": bodyData.hide_name, "sponsorships.$[outer].type": bodyData.type } }, { "arrayFilters": [{ "outer.sponsor_id": sponsorId }] }).lean()
            : await projectSchema.updateOne({
                _id: bodyData.project_id
            }, { $set: { "sponsorships.$[outer].amount": bodyData.amount, "sponsorships.$[outer].hide_name": bodyData.hide_name, "sponsorships.$[outer].type": bodyData.type } }, { "arrayFilters": [{ "outer.sponsor_id": sponsorId }] }).lean()

        console.log({ editProject });


        if (editProject?.modifiedCount == 0) {
            return res.status(200).json({ message: 'sponsorship did`nt updated ', success: false });

        } else {

            // update status of project

            if (projectData.status === 'ACTIVE') {
                console.log('project in active status');

                const statusUpdate: any = await projectSchema.updateOne({
                    $and: [{ _id: bodyData.project_id }, { budget: newSponsorAmount }, { budget: { $lte: newSponsorAmount } }]
                }, { status: 'QUEUE' }).lean()
                console.table({ statusUpdate });

                if (statusUpdate.modifiedCount === 1) {
                    const records = {
                        objectID: projectId,
                        status: 'QUEUE'
                    }
                    updateProjectToAlgolio(records)
                }

                console.log({ statusUpdate });
            } else {
                const statusUpdate: any = await projectSchema.updateOne({
                    $and: [{ _id: bodyData.project_id }, { budget: { $gt: newSponsorAmount } }]
                }, { status: 'ACTIVE' }).lean()
                if (statusUpdate.modifiedCount === 1) {
                    const records = {
                        objectID: projectId,
                        status: 'ACTIVE'
                    }
                    updateProjectToAlgolio(records)
                }
                console.log({ statusUpdate });
            }




            return res.status(200).json({ message: 'sponsor edit is successful', success: true });

        }
    } catch (error) {
        return res.status(200).json({ message: error, success: false });

    }


}