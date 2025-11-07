import randToken from 'rand-token'
import jwt from 'jsonwebtoken'
// local modules
import validator from '../func/validator'
import { bcrypt_data, validate_data } from '../func/bcrypt'
import { organizerSchema } from '../models/organizer'
import fileUploader from '../func/fileUpload'
import { signing } from '../func/jwt'
import { projectSchema } from '../models/project'
import { activating_link_string, client_url, Mail, secretKey } from '../config/variables'
import transporter from '../func/mail_config'
import { ActivationLink, resetPasswordMail } from '../config/mailTemplates'
import imageUpload from '../func/imageUpload';
import { addProjectToAlgolio } from '../func/algolio'
import mongoose from 'mongoose'
import dayjs from 'dayjs'


//registration
export const registration = (data: any, isIndividal: boolean, files: any) => {
    return new Promise(async (resolve, reject) => {
        // validate fetched data

        validator.organizer_register(data, isIndividal).then(async (response) => {


            //hash the password
            const hashedPassword = await bcrypt_data(data.password)
            console.log('email :', data.email);
            console.log('category got', data.interested_categories);

            // add to database 
            const userData = await new organizerSchema({
                type: data.type,
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: hashedPassword,
                mobile: data.mobile,
                company_name: data.company_name,
                address: data.address,
                contact_person_name: data.contact_person_name,
                interested_categories: data.interested_categories,
                submission_date: Date.now(),
            })
            userData.save(async (err, res) => {
                if (err) {
                    console.log("err :", err.message);
                    reject({
                        success: false,
                        message: 'Email or Phone number already exists'
                    })

                } else {


                    //upload documents
                    if (files) {
                        const isArray: boolean = Array.isArray(files)
                        if (isArray) {
                            await files.forEach(async (file: any) => {
                                fileUploader(file).then(async (response: any) => {
                                    console.log('document data upoaded id:', (response as any)._id);
                                    await userData.updateOne({ $push: { documents: response._id } })
                                }).catch(err => {
                                    reject(err)
                                })
                            })
                        } else {
                            fileUploader(files).then(async (response: any) => {
                                console.log('document data uploaded id:', (response as any)._id);
                                await userData.updateOne({ $push: { documents: response._id } })

                            }).catch(err => {
                                reject(err)
                            })
                        }

                    }
                    resolve({
                        success: true,
                        message: "data added to database",
                        data: { user_id: res._id }
                    })


                }
            })

        }).catch((err) => {

            resolve(err)
        })





    })
}



// login
export const login = (userData) => {
    return new Promise((resolve, reject) => {
        // check email
        console.log('email:', userData.email);
        validator.login_validator(userData).then(result => {

            try {
                organizerSchema.exists({ email: userData.email }, async (err, res) => {
                    if (res === null) {
                        console.error('user not exist');

                        resolve({
                            success: false,
                            message: `The email address that you have entered doesn't match any account`
                        })

                    } else {
                        const id = (res as any)._id
                        //console.log('id:', id);
                        organizerSchema.findById(id, { type: 1, first_name: 1, last_name: 1, email: 1, company_name: 1, mobile: 1, activated: 1, activation_token: 1, password: 1, blocked: 1, expired: 1 }, async (err, resp: any) => {
                            if (err) {
                                reject(err.message)
                            }
                            // if account is blocked then show error message
                            if (resp.blocked == true) {
                                resolve({ success: false, message: 'Your account is blocked by admin,you can contact admin for other Information' })

                            }
                            //decrypt password
                            const hashcode = await resp.password
                            const t = resp.activation_token
                            console.log('t:', t);
                            if (resp.expired == true) {
                                reject({ success: false, message: 'Your account is Expired , Please contact admin for access your account' })

                            }
                            if (resp.activated == null) {
                                reject({ success: false, message: 'Your account is not activated,Please check your email for activating link' })
                            }
                            validate_data(userData.password, hashcode).then(async (response) => {
                                if (!response === true) {
                                    resolve({ message: 'Your password is incorrect', success: false })

                                }
                                // make  token
                                const token_data = {
                                    id: (res as any)._id, role: 2  // 2-organizer
                                }
                                signing(token_data).then(token => {
                                    const user = resp
                                    user.password = null
                                    resolve({ token, message: 'password is correct', user, success: true })
                                })




                            }).catch(err => {
                                reject(err)
                            })




                        }).lean()
                    }







                })
            } catch (error) {
                resolve({ message: 'Something went wrong' + error, success: false })

            }


        }).catch(err => {
            //validation error
            console.error(err);

            resolve(err)
        })

    })


}


// activate account
export const activate_account = (code) => {
    return new Promise((resolve, reject) => {
        console.log('code', code);
        jwt.verify(code, secretKey, (err, value) => {
            if (err) {
                console.log(err.message);
                reject({ success: false, message: 'Your link is invalid' })
            } else {
                console.log('value', value);
                const email = value.data.email
                if (Date.now() >= value.exp * 1000) {
                    reject({ message: 'Your token was expired ,Please resend activating link request', success: false })

                }
                organizerSchema.find({ activation_token: code, email: email }, async (err, res) => {
                    try {
                        console.log('res:', res);
                        if (res === null) {
                            resolve({ message: 'Account not found', success: false })
                        } else {


                            // console.log('validate ', respon);
                            console.log('res id:', res[0]?._id);

                            let user = res[0]
                            console.log('userdata:', user?._id);

                            console.log('up:', user);
                            if (user?.activated === null) {
                                console.log('activated :', user.activated);

                                const activateStatus = await user.updateOne({ activated: Date.now() })
                                console.log({ activateStatus });

                                resolve({ success: true, data: user, message: 'Congratulations ! You have been successfully verified' })
                            } else {
                                resolve({ success: true, message: 'Your Account is already activated ,Please login' })
                            }



                        }
                    } catch (error) {
                        reject({ message: 'Account not found', success: false })

                    }




                })
            }
        })

    })
}


// add project
export const add_project = (form_data, files, user_id, img) => {
    return new Promise((resolve, reject) => {
        //validaitoin of form
        validator.project_validator(form_data).then(async (resp) => {
            // add projec to db
            const project_data = await new projectSchema({
                name: form_data.project_name,
                name_ar: form_data.project_name_ar,
                category: [form_data.category],
                budget: form_data.budget,
                fee: form_data.fees,
                sponsorships: [],
                submission_date: Date.now()

            })
            await project_data.save(async (err, result) => {
                if (err) {
                    console.log('error from db');
                    resolve({
                        message: 'database validation error :' + err,
                        success: false
                    })

                }
                console.log('error from db', err);
                const response: any = await imageUpload(img)
                console.log('document data uploaded in addproject id:', (response as any));
                const imgUpload = await project_data.updateOne({ img: response })

                console.log({ imgUpload });
                // add owner refference

                await project_data.updateOne({ added_organizer: user_id }).then(res => {
                    console.log('response from update owner data', res);

                })
                //upload documents
                console.log('files:', files);

                if (files) {
                    const isArray: boolean = Array.isArray(files)
                    if (isArray) {
                        await files.forEach(async (file: any) => {
                            fileUploader(file).then(async (response: any) => {
                                console.log('document data uploaded id:', (response as any)._id);
                                await project_data.updateOne({ $push: { documents: response._id } })

                            }).catch(err => {
                                reject(err)
                            })
                        })
                    } else {
                        fileUploader(files).then(async (response: any) => {
                            console.log('document data uploaded id:', (response as any)._id);
                            await project_data.updateOne({ $push: { documents: response._id } })

                        }).catch(err => {
                            reject(err)
                        })
                    }

                }
                addProjectToAlgolio(project_data._id)


                resolve({
                    success: true,
                    message: 'project added to database',
                    data: result
                })
            })


        }).catch(validationErr => {
            resolve(validationErr)
        })


    })
}


// reset-password-email
export const reset_password_email = (email) => {
    console.log('email from user', email);

    return new Promise((resolve, reject) => {
        validator.resetPassword_email_validator(email).then(validation_res => {

            // search account from db
            organizerSchema.findOne({ email: email }, async (err, result) => {
                if (err || result == null) {
                    console.log({ err, result });
                    console.log('result is null');

                    reject({


                        success: false,
                        message: 'Account not found'

                    })


                }
                else if (result?.activated === null) {
                    console.log('Account is not activated');
                    resolve({
                        success: false,
                        message: 'Account is not activated'
                    })

                } else {
                    signing({ email, role: 2 }).then(async (token) => {
                        // token store in db
                        await organizerSchema.updateOne({ email: email }, { token: token })
                        //send email

                        transporter(resetPasswordMail(email, token)).then(info => {
                            console.log('Email sent', info);


                        }).catch(error => {
                            //console.error(error);

                            reject({
                                success: false,
                                message: "Email can't sent"
                            })
                            throw error


                        })
                        resolve({
                            success: true,
                            message: 'email sent'
                        })
                    })
                }



            })

        }).catch(validation_err => {
            resolve(validation_err)
        })

    })
}

//reset password
export const reset_password = (data) => {
    return new Promise((resolve, reject) => {
        //form validation


        validator.update_password_validator(data).then(async (res) => {
            jwt.verify(data.token, secretKey, async (err, value) => {
                if (err) {
                    return resolve({
                        success: false, message: err.message
                    })
                }
                // cross check token
                const hashedPassword = await bcrypt_data(data.password)
                console.log('hashed password:', hashedPassword);
                organizerSchema.updateOne({ token: data.token }, { password: hashedPassword }, (err, res) => {
                    console.log('password change', { err }, { res });

                    if (res == null) {
                        resolve({
                            success: false, message: 'Account not found'
                        })
                    } else if (res.modifiedCount === 0) {
                        resolve({ success: false, message: 'Your link was expired' })

                        console.log('password changed', { res });



                    } else {
                        resolve({ success: true, message: 'Password is updated' })
                    }
                })

            })

        }).catch(validation_err => {
            resolve(validation_err)
        })
    })
}



export const sendActivateMail = (data) => {

    return new Promise(async (resolve, reject) => {

        const token_data = { email: data.email }
        const userData = await organizerSchema.findOne({ email: data.email })
        console.log('userData', { userData });
        if (userData === null) {
            resolve({ success: false, message: 'Account is not found' })

        }
        if (userData?.activated) {
            resolve({ success: false, message: 'Account was already activated' })

        }
        if (!userData?.admin_approval) {
            resolve({ success: false, message: "Admin didn't approve your account" })

        }
        signing(token_data).then(async (token) => {
            console.log('activated token: ', token);
            // add activation token to database
            await organizerSchema.updateOne({ email: data.email }, { "activation_token": token, admin_approval: true })

            console.log('string :' + activating_link_string + token)
            const role = 2
            transporter(ActivationLink(data.email, token, role)).then(info => {
                console.log('info :=>', info);


            }).catch(err => {
                console.log('error from nodeMail', err);

                reject(err)
            })
            resolve({ success: true, message: 'Activating link is sent' })

        })
    })
}
// profile view
export const userProfile = async (req, res) => {
    try {
        const user_id = req.user_id
        const profile = await organizerSchema.findOne({ _id: user_id }).populate('documents').populate("interested_categories")

        console.log('useriddd', user_id);
        console.log("profilee", profile)

        res.status(200).json({ success: true, data: profile })
    }
    catch (error) {
        res.status(200).json({ success: false, message: 'profile not found' })

    }

}
// profile update
export const userUpdate = async (req, res) => {
    try {

        const data = req.body
        console.log("data", data)
        const file = (req as any).files?.img && (req as any).files.img
        console.log('files :', req.files);
        const img = (req as any).files?.img
        const response: any = await imageUpload(img)
        console.log('document data uploaded in profile:', (response as any));
        const imgUpload = await organizerSchema.updateOne({_id:req.user_id},{$set:{img:response}})
          console.log("imgupdate",{ imgUpload });
      console.log("reqdata", data)
        const type = req.body.type
        console.log("type", type)
        console.log('body', req.body.first_name, req.body.last_name, req.user_id);
        if (type == 0) {

            const appProfile = await organizerSchema.updateOne(
                { _id: req.user_id }, {

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
                { _id: req.user_id }, {

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

export const getNotification = async (req, res) => {

    const userId = new mongoose.Types.ObjectId(req.user_id);

    console.log('notification', userId);

    try {
        if (userId) {
            // const notifications = await applicantSchema.findOne({ _id: userId }).select('notification').sort({'notification._id':1})
            // console.log('notification',notifications?.notification);
            const notifications = await organizerSchema.aggregate([

                { $match: { _id: userId } },
                { $unwind: '$notification' },
                { $sort: { "notification.createdAt":-1} },
                { $group: { _id: "$_id", notification: { $push: "$notification" } } }
            ])
            const notifArray = notifications[0].notification
            console.log('notification', notifications[0].notification);
            res.status(200).json({ success: true, message: 'notification etched', data: notifArray })
        }



    } catch (error) {
        res.status(200).json({ success: false, message: error })
    }

}
export const changePassword = async (req, res) => {
    const data = req.body
    const currentPassword = data.currentpassword;

    console.log('currentPassword', currentPassword);
    const newPassword = data.password
    const hashedPassword = await bcrypt_data(newPassword)
    console.log('hashedpassworsss', hashedPassword);

    console.log("changePassword", { data });
    console.log("passwod user idddddddd")
    console.log("req.headers", req.headers.token)
    let tokenData: any;

    try {
        tokenData = await jwt.verify(req.headers.token || '', secretKey)
        console.log("tokenData", tokenData)
        console.log("tokenData", tokenData?.data?.id)
        const userId = tokenData?.data?.id
        console.log("useridpassword", userId)
        const userData: any = await organizerSchema.findOne({ _id: userId })
        const userPasswordDb = userData.password
        if (userPasswordDb) {
            validate_data(currentPassword, userPasswordDb).then(async (response) => {
                console.log('password check', response);

                if (!response === true) {
                    res.status(200).json({ message: 'Your password is incorrect', success: false })

                }
                else {

                    const updatePassword = await organizerSchema.findByIdAndUpdate({ _id: userId }, { password: hashedPassword }, {
                        new: true,
                    })
                    console.log("newwwwwww", updatePassword);
                    res.status(200).json({ message: 'Password Updated', success: true })
                }

            }).catch(err => {
                res.status(200).json({ success: false, message: err })
            }
            )
        }
        else {
            res.status(200).json({ message: 'Your password is incorrect', success: false })
        }
    }
    catch (err) {
        console.log("token parse error")
    }
}


export const expireDateNotif = (email) => {
    return new Promise(async (resolve, reject) => {
        const currentDate = dayjs().format()
        console.log({ currentDate });
console.log({email});

        const organizerData: any = await organizerSchema.findOne({ email: email }, { valid_upto: 1 }).lean()
        console.log({organizerData});
        
        const expireDate = organizerData?.valid_upto
        const difference = dayjs(expireDate).diff(currentDate, 'd')
        console.log({ difference });
if(difference <= 15){
    resolve({showReminder:true})
}else{
    resolve({showReminder:false})
}
        

    })



}