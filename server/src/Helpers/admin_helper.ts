import { BodyParser } from 'body-parser';
// local modules
import validator from '../func/validator'
import { bcrypt_data, validate_data } from '../func/bcrypt'
import { adminSchema } from '../models/admin'
import { categorySchema } from '../models/categories'
import { applicantSchema } from '../models/applicant'
import { organizerSchema } from '../models/organizer'
import sponsorSchema from '../models/sponsor'
import randToken from 'rand-token'
import transporter from '../func/mail_config'
import fileUploader from '../func/fileUpload'
import imageUploader from '../func/imageUpload'
import fs from 'fs'

import { signing } from '../func/jwt'
import Joi, { object } from 'joi'
import mongoose from 'mongoose'
import { activating_link_string, DB, Mail } from '../config/variables'
import path, { join } from 'path'
import { SettingsSchema } from '../models/settings'
import { inquirySchema } from '../models/inquiries'
import { discountSchema } from '../models/discount'
import { projectSchema } from '../models/project'
import { contactSchema } from '../models/contactInfo'
import { userFaqSchema } from '../models/userQuestions'
import { adminFaqSchema } from '../models/faq'
import { ourProjectSchema } from '../models/ourProject'
import { blogSchema } from '../models/blogs'
import { ActivationLink, } from '../config/mailTemplates'
import { updateProjectToAlgolio } from '../func/algolio';
import dayjs from 'dayjs';
import imageUpload from '../func/imageUpload';
import { ObjectId } from 'mongodb'; 


// login
export const login = (userData) => {
    return new Promise((resolve, reject) => {
        // check email
        console.log('email:', userData.email);
        validator.admin_login_validator(userData).then(result => {

            adminSchema.findOne({ name: userData.name }, async (err, res) => {

                if (res === null) {
                    console.error('user not exist');

                    resolve({
                        success: false,
                        message: 'user not exist'
                    })


                } else {
                    //
                    validate_data(userData.password, res.password).then(async (resp) => {
                        console.log(resp);
                        if (resp === false) {
                            resolve({ success: false, message: 'password is incorrect' })
                        }
                        // make  token
                        const token_data = {
                            id: (res as any)._id,
                            role: res.role ?? 0
                        }
                        signing(token_data).then(async (token) => {
                            const user = res
                            user.password = null

                            resolve({ token, message: 'password is correct', data: user, success: true, role:  res.role ?? 0 })
                        })


                    }).catch(err => {
                        resolve(err)
                    })

                }

            })
        }).catch(err => {
            //validator error
            resolve(err)
        })

    })


}
export const userProfileUpdateByAdmin = async (req, res) => {
    try {
        const data = req.body
        console.log("idddddddddddd", data.userId)
        // const file=req.file
        // console.log('file',file);
        const file = (req as any).files?.img && (req as any).files.img
        console.log('files :', req.files);
        const img = (req as any).files?.img

        const response: any = await imageUpload(img)
        console.log('document data uploaded in profile:', (response as any));
        const imgUpload = await applicantSchema.updateOne({ _id: data.user_id }, { $set: { img: response } })
        console.log("imgupdate", { imgUpload });

        console.log("reqdata", data)
        const type = req.body.type
        console.log("type", type)
        console.log('body', req.body.first_name, req.body.last_name, data.user_id);
        if (type == 0) {
            const appProfile = await applicantSchema.updateOne(
                { _id: data.user_id }, {
                $set: {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    img: req.body.img
                }
                // first_name:data.first_name,
                // last_name:data.last_name

            }, { new: true }
            )
            console.log("appp", { appProfile });
            res.status(200).json({ success: true, data: appProfile })

        }
        else if (type == 1) {
            const appProfile = await applicantSchema.updateOne(
                { _id: data.user_id }, {

                $set: {
                    company_name: req.body.company_name,
                    address: req.body.address,
                    contact_person_name: req.body.contact_person_name,
                    img: req.body.img
                }

            }, { new: true }
            )
            console.log("copappprofile", { appProfile });

            res.status(200).json({ success: true, data: appProfile })

        }

    }
    catch (error) {
        res.status(200).json({ success: false, message: 'updated failed' })

    }
}
//-------
// add categories
export const add_category = (category) => {
    return new Promise((resolve, reject) => {
        categorySchema.insertMany({ name: category }).then((res) => {
            console.log('res from db:', res);
            resolve(res)

        }).catch(err => {
            console.log('db error');
            reject({
                success: false,
                message: 'validation error:' + err
            })

        })
    })
}
// delete category
export const delete_category = (id) => {
    return new Promise((resolve, reject) => {
        categorySchema.remove({ _id: id }).then((res) => {
            console.log('res from db:', res);
            resolve(res)

        }).catch(err => {
            console.log('db error');
            reject({
                success: false,
                message: 'validation error:' + err
            })

        })
    })
}
//list applicants

export const list_applicants = (data) => {
    return new Promise(async (resolve, reject) => {
        const limit = data.limit || 10
        const page = data.page || 1
        const condition = data.condition || {}
        // fetch from DB -query
        const applicants = await applicantSchema.find(
            condition, {
            _id: 1,
            type: 1,
            company_name: 1,
            first_name: 1,
            last_name: 1,
            gender: 1,
            email: 1,
            mobile: 1,
            activated: 1,
            blocked: 1
        }).sort({ _id: -1 })
            .skip(limit * (page - 1)).limit(limit)
        if (applicants === null || applicants.length === 0) {
            resolve({
                success: false,
                message: 'invalid page number'
            })
        }
        const count = await applicantSchema.count()
        resolve({ count, page, limit, applicants })


    })
}

//list organizers
export const list_organizers = (data) => {
    return new Promise(async (resolve, reject) => {
        const limit = data.limit || 8
        const page = data.page || 1
        const condition = data.condition || {}
        // fetch from DB -query
        const organizers = await organizerSchema.find(
            condition, {
            _id: 1,
            type: 1,
            company_name: 1,
            first_name: 1,
            last_name: 1,
            gender: 1,
            email: 1,
            mobile: 1,
            activated: 1,
            blocked: 1
        })
            .sort({ _id: -1 }).skip(limit * (page - 1)).limit(limit)
        if (organizers === null || organizers.length === 0) {
            resolve({
                success: false,
                message: 'invalid page number'
            })
        }
        const count = await organizerSchema.count()
        resolve({ count, page, limit, organizers })


    })
}

//list sponsors
export const list_sponsors = (data) => {
    return new Promise(async (resolve, reject) => {
        const limit = data.limit || 2
        const page = data.page || 1
        const condition = data.condition || {}
        try {
            // fetch from DB -query
            const sponsors = await sponsorSchema.find(
                condition, {
                _id: 1,
                type: 1,
                interested_categories: 1,
                company_name: 1,
                email: 1,
                mobile: 1,
                activated: 1,
                blocked: 1
            })
                .sort({ _id: -1 }).skip(limit * (page - 1)).limit(limit)
            if (sponsors === null || sponsors.length === 0) {
                resolve({
                    success: false,
                    message: 'invalid page number'
                })
            }
            const count = await sponsorSchema.count()
            resolve({ count, page, limit, sponsors })
        } catch (error) {
            reject({
                success: false,
                message: 'internal server Error ' + error
            })
        }

    })
}


//find applicant
export const find_applicant = (id) => {
    return new Promise(async (resolve, reject) => {
        try {

            id = new mongoose.Types.ObjectId(id)
            console.log('got at helper fn ', id);
            const applicant = await applicantSchema.findOne({ _id: id }, { password: 0, activation_token: 0 }).populate('documents')
            if (applicant === null) {
                resolve({
                    success: false,
                    message: 'user not found'
                })
            } else {
                console.log({ applicant });

                resolve({
                    success: true,
                    message: 'got user details',
                    data: applicant
                })
            }

        } catch (error) {
            reject({
                success: false,
                message: 'Internal server error ' + error
            })
        }

    })
}

//find organizer
export const find_organizer = (id) => {
    return new Promise(async (resolve, reject) => {
        try {

            id = new mongoose.Types.ObjectId(id)
            console.log('got at helper fn ', id);
            const user = await organizerSchema.findOne({ _id: id }, { password: 0, activation_token: 0 }).populate('interested_categories').populate('documents')
            if (user === null) {
                resolve({
                    success: false,
                    message: 'user not found'
                })
            }
            resolve({
                success: true,
                message: 'got user details',
                data: user
            })
        } catch (error) {
            reject({
                success: false,
                message: 'Internal server error ' + error
            })
        }

    })
}

//find sponsor
export const find_sponsor = (id) => {
    return new Promise(async (resolve, reject) => {
        try {

            id = new mongoose.Types.ObjectId(id)
            console.log('got at helper fn ', id);
            const user = await sponsorSchema.findOne({ _id: id }, { password: 0, activation_token: 0 }).populate('interested_categories').populate('documents')
            if (user === null) {
                resolve({
                    success: false,
                    message: 'user not found'
                })
            } else {
                resolve({
                    success: true,
                    message: 'got user details',
                    data: user
                })
            }

        } catch (error) {
            reject({
                success: false,
                message: 'Internal server error ' + error
            })
        }

    })
}


export const updateSponsorType = (data) => {
    return new Promise(async (resolve, reject) => {
        sponsorSchema.updateOne({ _id: data.id }, { type: data.type }).then((response) => {
            resolve({ message: 'sponsor type changed', success: true })

        }).catch((err) => {
            reject({ success: false, message: 'database error' })
        });


    })
}

export const sendActivateMail = (data) => {

    return new Promise(async (resolve, reject) => {
        let schema;
        let string;
        let role;
        console.log({ data });
        // for organizer
        if (data.role === 1) {
            schema = organizerSchema
            string = 'organizer'
            role = 2
        }
        // for sponsor
        if (data.role === 2) {
            schema = sponsorSchema
            string = 'sponsor'
            role = 1
        }
        console.log({ schema, string });

        const user_id = data.id.toString()
        const token_data = { email: data.email }
        signing(token_data).then(async (token) => {
            console.log('activated token: ', token);
            // add activation token to database
            await schema.updateOne({ _id: data.id }, { "activation_token": token, admin_approval: true })

            console.log('string :' + activating_link_string + token)

            transporter(ActivationLink(data.email, token, role)).then(info => {
                console.log('info :=>', info);
                resolve({ success: true, message: 'Activating link is sent' })

            }).catch(err => {
                console.log('error from nodeMail', err);

                reject(err)
            })

        })
    })
}
// event orgasizer notificatin mail




export const setExpireDate = (data) => {
    return new Promise((resolve, reject) => {
        organizerSchema.updateOne({ _id: data.id }, { valid_upto: data.date }).then(result => {
            if (result === null) {
                resolve({ sucess: false, message: 'wrong user id' })
            } else {
                resolve({ success: true, message: 'data updated', result })

            }
        }).catch(err => {
            reject(err)
        })
    })
}

export const blockUser = (data) => {
    return new Promise((resolve, reject) => {
        const role = data.role
        let schema
        if (role === 1) {
            schema = applicantSchema

        } else if (role === 2) {
            schema = organizerSchema

        } else if (role === 3) {
            schema = sponsorSchema
        }
        schema.updateOne({ _id: data.id }, { blocked: data.value }).then((result) => {
            resolve({ success: true, message: 'user is blocked', data: result })
        }).catch(err => {
            reject({ success: false, message: 'user cannot  found' })
        })
    })
}
export const changeFixedFee = async (req, res) => {

    const data = req.body
    console.log({ data });

    const schema = Joi.object({
        fixed_fee: Joi.number().min(1)
    })

    // validate data
    const { error } = await schema.validate(data)
    if (error) {
        res.status(200).json({
            message: 'validation error' + error.details[0].message,
            success: false
        })
    } else {
        const collection = await SettingsSchema.find({})
        console.log(collection);
        if (collection.length === 0) {
            SettingsSchema.insertMany({ fixedFees: data.fixed_fee })
            res.status(200).json({ success: true, message: 'fixed fees is updated' })

        } else {
            console.log('update');

            SettingsSchema.updateOne({ _id: collection[0]._id }, { fixedFees: data.fixed_fee }).then((result) => {
                console.log({ result });
                res.status(200).json({ success: true, message: 'fixed fees is updated' })

            }).catch((err => {
                console.log({ err });

            }))

        }





    }




}

export const changePercentageFee = async (req, res) => {

    const data = req.body
    console.log({ data });

    const schema = Joi.object({
        percentage_fee: Joi.number().min(1).max(100)
    })

    // validate data
    const { error } = await schema.validate(data)
    if (error) {
        res.status(200).json({
            message: 'validation error' + error.details[0].message,
            success: false
        })
    } else {
        const collection = await SettingsSchema.find({})
        console.log(collection);
        if (collection.length === 0) {
            SettingsSchema.insertMany({ percentageFees: data.percentage_fee })
            res.status(200).json({ success: true, message: 'Percentage fees is updated' })

        } else {
            console.log('update');

            SettingsSchema.updateOne({ _id: collection[0]._id }, { percentageFees: data.percentage_fee }).then((result) => {
                console.log({ result });
                res.status(200).json({ success: true, message: 'Percentage fees is updated' })

            }).catch((err => {
                console.log({ err });

            }))

        }





    }




}

export const getFees = async (req, res) => {


    const feesObj = await SettingsSchema.find({})
    if (feesObj.length === 0) {
        res.status(200).json({ success: false, message: 'data is empty' })
    } else {
        res.status(200).json({ success: true, message: 'data are fetched', data: feesObj })
    }
}

export const getAdmins = async (req, res) => {

    const admins = await adminSchema.find().sort({ _id: -1 })
    if (admins.length === 0) {
        console.log('admins are not found');
        res.status(200).json({ message: 'there is no admins information found in database', success: false })

    } else {
        console.log({ admins });


        res.status(200).json({ success: true, message: 'data are fetched', data: admins })

    }
}

export const register = async (req, res) => {
    const data: any = req.body
    if (!data || data === null || data === undefined) {
        console.log('post data not found');
        res.status(200).json({ message: 'post data not found', success: false })

    } else {
        validator.admin_validator(data).then(async (resp) => {
            //hash the password
            const hashedPassword = await bcrypt_data(data.password)
            console.log('hashed password:', hashedPassword);
            const user = {
                name: data.name,
                password: hashedPassword,
                role: data.role,
                email: data.email

            }
            adminSchema.insertMany(user).then((resp) => {
                console.log(resp);
                res.status(200).json({ success: true, data: resp, message: 'admin account registered' })

            }).catch(DbErr => {
                console.log({ DbErr });
                res.status(200).json({ success: false, message: 'This Account already registered' })

            })

        }).catch((err: any) => {
            console.log({ err });
            res.status(200).json({ success: false, message: err.details })

        })
    }
}

export const getInquiries = async (req, res) => {
    const data = req.body
    const limit = data.limit || 10
    const page = data.page || 1

    // fetch from DB -query
    const inquiries = await inquirySchema.find({}).skip(limit * (page - 1)).limit(limit)
    if (inquiries === null || inquiries.length === 0) {
        res.status(200).json({
            success: false,
            message: 'invalid page number'
        })
    } else {
        const count = await inquirySchema.count()
        console.log({ count });

        res.status(200).json({ success: true, message: 'data fetched', count, page, limit, inquiries })
    }

}

export const addDiscount = async (req, res) => {
    const data: any = req.body

    if (!data || data === null || data === undefined) {
        console.log('request data not found');
        res.status(200).json({ message: 'request data not found', success: false })

    } else {
        discountSchema.insertMany(data).then((DBres) => {
            console.log({ DBres });
            res.status(200).json({ message: 'discount grant', success: true })

        }).catch((DBerr) => {
            console.log({ DBerr });
            res.status(200).json({ message: 'DB error :' + DBerr, success: false })
        })
    }

}

export const expireProject = async (req, res) => {
    const bodyData = req.body
    console.log({ bodyData });

    console.log({ bodyData });
    if (!bodyData || bodyData === null || bodyData === undefined) {
        console.log('request data not found');
        res.status(200).json({ message: 'request data not found', success: false })

    } else {
        console.log('project is expired');

        projectSchema.updateOne({ _id: bodyData.project_id, status: 'INACTIVE', expire_date: null }, { expire_date: bodyData.date, status: bodyData.status }).then(async (dbRes) => {
            console.log({ dbRes });

            if (dbRes.modifiedCount > 0) {
                const record = {
                    objectID: bodyData.project_id,
                    status: bodyData.status
                }

                await updateProjectToAlgolio(record)
                res.status(200).json({ message: 'data modified ' + dbRes, success: true })

            } else {
                res.status(200).json({ message: 'Status cant be changed ' + dbRes, success: false })
            }

        }).catch((dbErr) => {
            console.log({ dbErr });
            res.status(200).json({ message: 'db error ' + dbErr, success: false })

        })
    }

}

export const extendProject = async (req, res) => {
    const bodyData = req.body
    console.log({ bodyData });

    console.log('new ', { bodyData });
    if (!bodyData || bodyData === null || bodyData === undefined) {
        console.log('request data not found');
        res.status(200).json({ message: 'request data not found', success: false })

    } else {
        projectSchema.updateOne({ $and: [{ _id: bodyData.project_id }, { status: 'INACTIVE' }] }, { extend_date: bodyData.date, status: bodyData.status }).then(async (dbRes) => {
            console.log({ dbRes });
            if (dbRes.modifiedCount > 0) {
                const record = {
                    objectID: bodyData.project_id,
                    status: bodyData.status
                }

                await updateProjectToAlgolio(record)
                res.status(200).json({ message: 'data modified ' + dbRes, success: true })

            } else {
                res.status(200).json({ message: 'Status cant be changed ' + dbRes, success: false })

            }



        }).catch((dbErr) => {
            console.log({ dbErr });
            res.status(200).json({ message: 'db error ' + dbErr, success: false })

        })
    }
}

export const postContactInfo = async (req, res) => {
    const data = req.body
    console.log({ data });

    console.log({ data });
    if (!data || data === null || data === undefined) {
        console.log('request data not found');
        res.status(200).json({ message: 'request data not found', success: false })

    } else {
        const collection: any = await contactSchema.find({})
        console.log(collection.length);
        if (collection.length === 0) {

            contactSchema.create(data).then((resp: any) => {
                console.log({ resp });
                res.status(200).json({ message: 'request data found', resp, success: true })
            }).catch((dbErr) => {
                console.log({ dbErr });
                res.status(200).json({ message: 'request data not found', dbErr, success: false })
            })
        } else {
            contactSchema.updateMany(data).then((resp: any) => {
                console.log({ resp });
                res.status(200).json({ message: 'request data found on updation', resp, success: true })
            }).catch((dbErr) => {
                console.log({ dbErr });
                res.status(200).json({ message: 'request data not found', dbErr, success: false })
            })
        }

    }
}

export const getContactInfo = async (req, res) => {

    const information = await contactSchema.find({})
    if (information.length === 0) {
        res.status(200).json({ success: false, data: information, message: ' database is empty' })

    } else {
        console.log({ information });

        res.status(200).json({ success: true, data: information[0], message: ' data fetched' })

    }
}

export const getUserFaq = async (req, res) => {

    const information = await userFaqSchema.find({})
    if (information.length === 0) {
        res.status(200).json({ success: false, data: information, message: ' database is empty' })

    } else {
        res.status(200).json({ success: true, data: information, message: ' data fetched' })

    }
}

export const postFaq = async (req, res) => {
    const data = req.body
    console.log({ data });
    const img = (req as any).files?.image
    console.log({ img });

    console.log({ data });
    if (!data || data === null || data === undefined) {
        console.log('request data not found');
        res.status(200).json({ message: 'request data not found', success: false })

    } else {
        const collection: any = await adminFaqSchema.find({})
        console.log(collection.length);
        if (collection.length <= 5) {

            adminFaqSchema.create(data).then((resp: any) => {
                console.log({ resp });
                imageUploader(img).then(async (response: any) => {
                    console.log('document data uploaded id:', (response as any));
                    await adminFaqSchema.updateOne({ _id: resp._id }, { img: response })

                }).catch(err => {
                    return res.status(200).json({ message: 'file uploading error', success: false })

                })
                return res.status(200).json({ message: 'data inserted to database', success: true })

            }).catch((dbErr) => {
                console.log({ dbErr });
                res.status(200).json({ message: 'data cant be inserted', dbErr, success: false })
            })

        } else {
            res.status(200).json({ message: 'maximum 5 questions are allowed', success: false })

        }

    }
}
export const removeFaq = (req, res) => {
    const id = req.body.id
    console.log({ id });
    if (id === null || id === undefined) {
        res.status(200).json({
            success: false,
            message: ' faq cannot access'
        })
    }

    adminFaqSchema.deleteOne({ _id: id }).then((resp) => {
        console.log('res from db:', resp);
        res.status(200).json({ success: true, message: resp })

    }).catch(err => {
        console.log('db error');
        res.status(200).json({
            success: false,
            message: 'validation error:' + err
        })

    })

}
export const postOurProject = async (req, res) => {
    const data = req.body
    console.log("cttttttttt", { data });
    const img = await (req as any).files?.image
    console.log({ img });
    console.log('category', data.category);

    const qData = {
        heading: data.heading,
        description: data.description,
        category: [data.category]
    }
    console.log("qdata", qData);

    console.log({ data });
    if (!data || data === null || data === undefined) {
        console.log('request data not found');
        res.status(200).json({ message: 'request data not found', success: false })

    } else {
        const collection: any = await ourProjectSchema.find({})
        console.log(collection.length);
        if (collection.length <= 100) {

            ourProjectSchema.create(qData).then((resp: any) => {
                console.log({ resp });
                imageUploader(img).then(async (response: any) => {
                    console.log('image name:', (response as any));
                    await ourProjectSchema.updateOne({ _id: resp._id }, { img: response })


                }).catch(err => {
                    return res.status(200).json({ message: 'file uploading error', success: false })

                })

                return res.status(200).json({ message: 'project inserted to database', success: true })

            }).catch((dbErr) => {
                console.log({ dbErr });
                res.status(200).json({ message: 'project cant be inserted', dbErr, success: false })
            })

        } else {
            res.status(200).json({ message: 'maximum 100 projects are allowed', success: false })

        }

    }
}
export const editOurProject = async (req, res) => {
    const data = req.body
    console.log({ data });
    const img = await (req as any).files?.image
    console.log({ img });


    if (!data || data === null || data === undefined) {
        console.log('request data not found');
        res.status(200).json({ message: 'request data not found', success: false })

    } else {


        const updateData = {
            heading: data.heading,
            description: data.description
        }
        console.log({ __dirname }, 'previmg:', data.prevImg);
        // delete previous image
        fs.unlink(path.join(__dirname, `../../images/${data.prevImg}`), (resp: any) => {
            console.log({ resp });

        })
        ourProjectSchema.updateOne({ _id: data._id }, updateData).then((resp: any) => {
            console.log({ resp });
            imageUploader(img).then(async (response: any) => {
                console.log('image name:', (response as any));

                await ourProjectSchema.updateOne({ _id: data._id }, { img: response })


            }).catch(err => {
                return res.status(200).json({ message: 'File uploading error', success: false })

            })

            return res.status(200).json({ message: 'Project updated to database', success: true })

        }).catch((dbErr) => {
            console.log({ dbErr });
            res.status(200).json({ message: 'Project cant be inserted', dbErr, success: false })
        })



    }
}
export const categoryProject = async (req, res) => {
    const data = req.body
    console.log("data", data.category);
    if (data.category) {
        const categoryfilter = await ourProjectSchema.find({ category: data.category })
        console.log("categoryfilter", categoryfilter);

        res.status(200).json({ success: true, data: categoryfilter, message: ' category projects fetched' })
    }
    else {
        res.status(200).json({ success: false, message: ' database is empty' })

    }
}
export const getOurProject = async (req, res) => {

    const data = req.body
    console.log("dataabutton", data)
    console.log("data", data.category);

    const information = await ourProjectSchema.find({}).populate('category').sort({ _id: -1 })
    console.log("informationinformationinformation", information);


    if (data.category == "all") {
        console.log("enter")
        return (res.status(200).json({ success: true, data: information, message: ' All projects fetched' }))

    }

    const categoryArray = information.map((cat: any) => {

        console.log("mappeddd");

        console.log("ccccccccccc", cat);

        return (cat.category[0])
    })

    console.log("categoryArraycategoryArraycategoryArraycategoryArray", categoryArray)
    const arrayfiltercategory = categoryArray.filter(function (element) {
        return element !== undefined;
    });
    console.log("arrayfilter", arrayfiltercategory);
    function getUniqueListBy(arrayfiltercategory, key) {
        return [...new Map(arrayfiltercategory.map(item => [item[key], item])).values()]
    }

    const arrayfilter = getUniqueListBy(arrayfiltercategory, 'name')
    console.log(JSON.stringify(arrayfilter))
    console.log("arr1", arrayfilter)

    if (data.category) {
        const categoryfilter = await ourProjectSchema.find({ category: data.category })
        console.log("categoryfilter", categoryfilter);

        res.status(200).json({ success: true, data: categoryfilter, message: ' category projects fetched' })
    }

    else {


        if (information.length === 0) {

            res.status(200).json({ success: false, data: { information, arrayfilter }, message: ' database is empty' })

        } else {

            res.status(200).json({ success: true, data: { information, arrayfilter }, message: ' data fetched' })

        }
    }
}




export const postBlogs = async (req, res) => {
    const data = req.body
    console.log({ data });
    const img = await (req as any).files?.image
    console.log({ img });
    data.submission_date = Date.now()
    console.log({ data });


    if (!data || data === null || data.heading === undefined) {
        console.log('request data not found');
        return res.status(200).json({ message: 'request data not found', success: false })

    } else {

        blogSchema.create(data).then((resp: any) => {
            console.log({ resp });
            imageUploader(img).then(async (response: any) => {
                console.log('document data uploaded id:', (response as any));
                await blogSchema.updateOne({ _id: resp._id }, { img: response })

            }).catch(err => {
                return res.status(200).json({ message: 'file uploading error', success: false })

            })
            return res.status(200).json({ message: 'blog inserted to database', success: true })


        }).catch((dbErr) => {
            console.log({ dbErr });
            return res.status(200).json({ message: 'blog cant be inserted', dbErr, success: false })
        })





    }
}
export const editBlogs = async (req, res) => {
    const data = req.body
    console.log({ data });
    const img = await (req as any).files?.image
    console.log({ img });


    if (!data || data === null || data === undefined) {
        console.log('request data not found');
        res.status(200).json({ message: 'request data not found', success: false })

    } else {


        const updateData = {
            heading: data.heading || '',
            description: data.description || '',
            location: data.location || '',
            submission_date: Date.now()
        }
        console.log({ __dirname }, 'previmg:', data.prevImg);
        // delete previous image
        fs.unlink(path.join(__dirname, `../../images/${data.prevImg}`), (resp: any) => {
            console.log({ resp });

        })
        blogSchema.updateOne({ _id: data._id }, updateData).then((resp: any) => {
            console.log({ resp });
            imageUploader(img).then(async (response: any) => {
                console.log('image name:', (response as any));

                await blogSchema.updateOne({ _id: data._id }, { img: response })


            }).catch(err => {
                return res.status(200).json({ message: 'File uploading error', success: false })

            })

            return res.status(200).json({ message: 'Blog updated to database', success: true })

        }).catch((dbErr) => {
            console.log({ dbErr });
            res.status(200).json({ message: 'Blog cant be inserted', dbErr, success: false })
        })





    }
}
export const getBlogs = async (req, res) => {
    const data = req.body
    console.log({ data });
    if (!data || data === null || data === undefined) {
        console.log('request data not found');
        res.status(200).json({ message: 'request data not found', success: false })

    } else {
        const limit = data.limit || 100
        const page = data.page || 1
        // fetch from DB -query
        const blogs = await blogSchema.find({})
            .skip(limit * (page - 1)).limit(limit).sort({ 'submission_date': -1 })
        if (blogs === null || blogs.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'invalid page number'
            })
        }
        const count = await applicantSchema.count()
        res.status(200).json({ count, page, limit, blogs })
    }

}
export const deleteProject = async (req, res) => {
    console.log("delete function called");

    const data = req.body
    console.log("deleteproject", data);
    if (data) {
        const findProject = await ourProjectSchema.findByIdAndRemove({ _id: data.id })
        console.log("findProject", findProject);
        return res.status(200).json({ message: 'project deleted', success: true })


    }





}
export const deleteBlog = async (req, res) => {
    console.log("delete blog cliced")
    const data = req.body
    console.log("deleteblog", data);
    if (data) {
        const findBlog = await blogSchema.findByIdAndRemove({ _id: data.id })
        console.log("findProject", findBlog);
        return res.status(200).json({ message: 'blog deleted', success: true })

    }

}

// export const listLogs = async (req, res) => {
//     try {
//         const db = mongoose.connection;
//         const { limit, page } = req.query;

//         const count = (limit < 1 || limit === null || limit === undefined) ? 10 : parseInt(limit);
//         const skip = (page < 0 || page === null || limit === undefined) ? 0 : (parseInt(page) - 1) * count;
//         console.log({ count, skip });

//         const logCollection = db.collection('logs');
//         const logs = await logCollection.find({ "meta.type": "admin" }).limit(count).skip(skip).toArray();


//         console.log("logsss",logs);

//         res.status(200).json({
//             success: true,
//             msg: "Logs fetched successfully",
//             logs: logs
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             msg: error.message || error + ""
//         });
//     }
// }


export const listLogs = async (req, res) => {
    // try {
    //     const db = mongoose.connection;
    //     const { limit, page } = req.query;

    //     const count = (limit < 1 || limit === null || limit === undefined) ? 10 : parseInt(limit);
    //     const skip = (page < 0 || page === null || limit === undefined) ? 0 : (parseInt(page) - 1) * count;

    //     const logCollection = db.collection('logs');

    //     // Use the aggregation framework to join the 'logs' collection with the 'admin' collection
    //     const logs = await logCollection.aggregate([
    //         {
    //             $match: { "meta.type": "admin" }
    //         },
    //         {
    //             $lookup: {
    //                 from: 'admin', // Replace 'admin' with the actual name of the collection where admin user data is stored
    //                 localField: "meta.adminId", // Assuming 'meta.userId' is the field that links to admin user ID
    //                 foreignField: '_id', // Assuming admin user documents have '_id' as their unique identifier
    //                 as: 'adminInfo'
    //             }
    //         },
    //         {
    //             $limit: count
    //         },
    //         {
    //             $skip: skip
    //         }
    //     ]).toArray();

    //     console.log("logs", logs);

    //     res.status(200).json({
    //         success: true,
    //         msg: "Logs fetched successfully",
    //         logs: logs
    //     });
    // } catch (error: any) {
    //     res.status(500).json({
    //         success: false,
    //         msg: error.message || error + ""
    //     });
    // }

    try {
        const db = mongoose.connection;
        const { limit, page } = req.query;
    
        const count = (limit < 1 || limit === null || limit === undefined) ? 10 : parseInt(limit);
        const skip = (page < 0 || page === null || limit === undefined) ? 0 : (parseInt(page) - 1) * count;
    
        const logCollection = db.collection('logs');
    
        // Use the aggregation framework to join the 'logs' collection with the 'admin' collection
        const logs = await logCollection.aggregate([
            {
                $match: { "meta.type": "admin" }
            },
            {
                $addFields: {
                    adminIdObjectId: { $toObjectId: "$meta.adminId" }
                }
            },
            
            {
                $lookup: {
                    from: 'admins',
                    localField: 'adminIdObjectId',
                    foreignField: '_id',
                    as: 'adminInfo'
                }
            },
            {
                $unwind: '$adminInfo' 
            },
            {
                $sort: { timestamp: -1 } 
            },
            {
                $limit: count
            },
            {
                $skip: skip
            }
        ]).toArray();
    
        console.log("logs", logs);
    
        res.status(200).json({
            success: true,
            msg: "Logs fetched successfully",
            logs: logs
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            msg: error.message || error + ""
        });
    }
}

export const SponserUpdateData = async (req, res) => {

    console.log('dfghh');
 
    try {
        const userId=req.params.id
       const data = req.body
       console.log("reqdata", data)
       const type = req.body.type
       const file = (req as any).files?.img && (req as any).files.img
       
         const img = (req as any).files?.img
         const response: any = await imageUpload(img)
         console.log('document data uploaded in profile:', (response as any));
         const imgUpload = await sponsorSchema.updateOne({_id:userId},{$set:{img:response}})
           console.log("imgupdate",{ imgUpload });
       console.log("reqdata", data)
       console.log("type", type)
       console.log('body', req.body.first_name, req.body.last_name, userId);
 
       const appProfile = await sponsorSchema.updateOne(
          { _id: userId}, {
 
 
 
          $set: {
             company_name: req.body.company_name,
             address: req.body.address,
             contact_person_name: req.body.contact_person_name,
             secondemail: req.body.secondemail,
             img:req.body.img
          }
 
       }, { new: true }
 
 
 
 
       )
       console.log({ appProfile });
       res.status(200).json({ success: true, data: appProfile })
    }
 
    catch (error) {
       res.status(200).json({ success: false, message: 'updated failed' })
 
    }
 }




 export const organizerUpdate = async (req, res) => {
    try {

       const userId=req.params.id

        const data = req.body
        console.log("data", data)
        const file = (req as any).files?.img && (req as any).files.img
        console.log('files :', req.files);
        const img = (req as any).files?.img
        const response: any = await imageUpload(img)
        console.log('document data uploaded in profile:', (response as any));
        const imgUpload = await organizerSchema.updateOne({_id:userId},{$set:{img:response}})
          console.log("imgupdate",{ imgUpload });
      console.log("reqdata", data)
        const type = req.body.type
        console.log("type", type)
        console.log('body', req.body.first_name, req.body.last_name, userId);
        if (type == 0) {

            const appProfile = await organizerSchema.updateOne(
                { _id: userId }, {

                $set: {
                    first_name: req.body.first_name,

                    last_name: req.body.last_name,
                    img:req.body.img
                }
            }, { new: true }

            )
            console.log({ appProfile });
            res.status(200).json({ success: true, data: appProfile })

        }

        else if (type == 1) {

            const appProfile = await organizerSchema.updateOne(
                { _id: userId }, {

                $set: {
                    company_name: req.body.company_name,
                    address: req.body.address,
                    contact_person_name: req.body.contact_person_name,
                    img:req.body.img
                }


            }, { new: true }

            )
            console.log({ appProfile });

            res.status(200).json({ success: true, data: appProfile })

        }
    }
    catch (error) {
        res.status(200).json({ success: false, message: 'updated failed' })

    }
}


export const applicantUpdate = async (req, res) => {
    try {
        const userId:any = req.params.id
       const data = req.body
       console.log("idddddddddddd",userId)
       // const file=req.file
       // console.log('file',file);
       const file = (req as any).files?.img && (req as any).files.img
         console.log('files :', req.files);
         const img = (req as any).files?.img
 
         const response: any = await imageUpload(img)
         console.log('document data uploaded in profile:', (response as any));
         const imgUpload = await applicantSchema.updateOne({_id:userId},{$set:{img:response}})
           console.log("imgupdate",{ imgUpload });
 
       console.log("reqdata", data)
       const type = req.body.type
       console.log("type", type)
       console.log('body', req.body.first_name, req.body.last_name, userId);
       if (type == 0) {
          const appProfile = await applicantSchema.updateOne(
             { _id: userId }, {
             $set: {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                img:req.body.img
             }
             // first_name:data.first_name,
             // last_name:data.last_name
 
          }, { new: true }
          )
          console.log("appp", { appProfile });
          res.status(200).json({ success: true, data: appProfile })
 
       }
       else if (type == 1) {
          const appProfile = await applicantSchema.updateOne(
             { _id: userId }, {
 
             $set: {
                company_name: req.body.company_name,
                address: req.body.address,
                contact_person_name: req.body.contact_person_name,
                img:req.body.img
             }
 
          }, { new: true }
          )
          console.log("copappprofile", { appProfile });
 
          res.status(200).json({ success: true, data: appProfile })
 
       }
 
    }
    catch (error) {
       res.status(200).json({ success: false, message: 'updated failed' })
 
    }
 }