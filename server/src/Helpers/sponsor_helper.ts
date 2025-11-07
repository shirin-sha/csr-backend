import randToken from 'rand-token'
import jwt from 'jsonwebtoken'
//local modules
import validator from '../func/validator'
import { bcrypt_data, validate_data } from '../func/bcrypt'
import sponsorSchema from '../models/sponsor'
import fileUploader from '../func/fileUpload'
import { signing } from '../func/jwt'
import { eventSchema } from '../models/event'
import { activating_link_string, client_url, Mail, secretKey } from '../config/variables'
import transporter from '../func/mail_config'
import { organizerSchema } from '../models/organizer'
import { ActivationLink, resetPasswordMail } from '../config/mailTemplates'
import imageUpload from '../func/imageUpload';
import { addEventToAlgolio } from '../func/algolio'
import mongoose from 'mongoose'
import { Req } from '../types/types'
import { Response } from 'express'

//config


// registration
export const registration = (data: any, files: any) => {

   return new Promise((resolve, reject) => {
      // form validation
      validator.sponsor_validator(data).then(async (response) => {
         // if validation success

         //hash the password
         const hashedPassword = await bcrypt_data(data.password)


         //data added to database
         const sponsor_data = await new sponsorSchema({
            company_name: data.company_name,
            email: data.email,
            password: hashedPassword,
            mobile: data.mobile,
            address: data.address,
            contact_person_name: data.contact_person_name,
            interested_categories: data.interested_categories,
            submission_date: Date.now(),
         })
         sponsor_data.save(async (err, result) => {
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
                           console.log('document data uploaded id:', (response as any)._id);
                           await sponsor_data.updateOne({ $push: { documents: response._id } })

                        }).catch(err => {
                           reject(err)
                        })
                     });
                  } else {
                     fileUploader(files).then(async (response: any) => {
                        console.log('document data uploaded id:', (response as any)._id);
                        await sponsor_data.updateOne({ $push: { documents: response._id } })

                     }).catch(err => {
                        reject(err)
                     })
                  }

               }
               resolve({
                  success: true,
                  message: "Account is Registered ,Please waiting for Approval of admin",
                  data: { user_id: result._id }
               })


            }
         })

      }).catch(err => {
         // validation error
         resolve(err)

      })
   })

}

//login
export const login = (userData) => {
   return new Promise((resolve, reject) => {
      // check email
      console.log('email:', userData.email);
      validator.login_validator(userData).then(result => {
         try {
            sponsorSchema.exists({ email: userData.email }, async (err, res) => {
               if (res === null) {
                  console.error('user not exist');

                  resolve({
                     success: false,
                     message: `The email address that you have entered doesn't match any account`
                  })



               } else {
                  const id = (res as any)?._id
                  //console.log('id:', id);
                  sponsorSchema.findById(id, { type: 1, email: 1, company_name: 1, mobile: 1, activated: 1, activation_token: 1, password: 1, blocked: 1 }, async (err, resp: any) => {
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
                     if (resp.activated === null) {
                        reject({ success: false, message: 'Your account is not activated,Please check your email for activating link' })
                     }
                     validate_data(userData.password, hashcode).then(async (response) => {
                        if (!response === true) {
                           resolve({ message: 'Your password is incorrect', success: false })

                        }
                        // make  token
                        const token_data = {
                           id: (res as any)._id, role: 3  // 3-sponsor
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
            reject({ success: false, message: 'something went wrong :' + error })

         }

      }).catch(err => {
         console.error(err);

         resolve(err)
      })

   })


}

//activate account
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
            sponsorSchema.find({ activation_token: code, email: email }, async (err, res) => {
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

                        await user.updateOne({ activated: Date.now() })

                        resolve({ success: true, data: user, message: 'Congratulations ! You have been successfully verified' })
                     } else {
                        reject({ success: true, message: 'Your Account is already activated ,Please login' })
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

//add event
export const add_event = (form_data, files, user_id, img) => {
   return new Promise((resolve, reject) => {
      // form validation
      validator.event_validator(form_data).then((async (resp) => {

         // add to db

         const event_data = await new eventSchema(form_data)

         await event_data.save(async (err, result) => {
            if (err) {
               console.log('error from db');
               resolve({
                  message: 'database validation error :' + err,
                  success: false
               })

            }
            const response: any = await imageUpload(img)
            console.log('document data uploaded in addproject id:', (response as any));
            const imgUpload = await event_data.updateOne({ img: response })

            console.log({ imgUpload });
            // add owner refference
            await event_data.updateOne({ added_sponsor: user_id }).then(res => {
               console.log('response from update owner data', res);

            })
            // upload documents
            if (files) {
               const isArray: boolean = Array.isArray(files)
               if (isArray) {
                  await files.forEach(async (file: any) => {
                     fileUploader(file).then(async (response: any) => {
                        console.log('document data uploaded id:', (response as any)._id);
                        await event_data.updateOne({ $push: { documents: response._id } })

                     }).catch(err => {
                        reject(err)
                     })
                  })
               } else {
                  fileUploader(files).then(async (response: any) => {
                     console.log('document data uploaded id:', (response as any)._id);
                     await event_data.updateOne({ $push: { documents: response._id } })

                  }).catch(err => {
                     reject(err)
                  })
               }

            }

            addEventToAlgolio(form_data._id)

            resolve({
               success: true,
               message: 'event added to database',
               data: result
            })
         })


      })).catch(err => {
         resolve(err)
      })
   })
}

//reset-password-email
export const reset_password_email = (email) => {
   return new Promise((resolve, reject) => {
      validator.resetPassword_email_validator(email).then(validation_res => {

         // search account from db
         sponsorSchema.findOne({ email: email }, async (err, result) => {
            if (err || result == null) {
               resolve({
                  success: false,
                  message: 'Account not found'

               })


            } else if (result?.activated === null) {
               console.log('Account is not activated');
               resolve({
                  success: false,
                  message: 'Account is not activated'
               })

            } else {
               signing({ email, role: 3 }).then(async (token) => {
                  // token store in db
                  await sponsorSchema.updateOne({ email: email }, { token: token })
                  //send email

                  transporter(resetPasswordMail(email, token)).then(info => {
                     console.log('email sent', info);


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
                     message: 'Email sent'
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
            sponsorSchema.updateOne({ token: data.token }, { password: hashedPassword }, (err, res) => {
               if (res == null) {
                  resolve({
                     success: false, message: 'Account not found'
                  })
               } else if (res.modifiedCount === 0) {
                  console.log('res', { res });

                  resolve({ success: false, message: 'Your link was expired' })




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
      const userData = await sponsorSchema.findOne({ email: data.email })
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
         await sponsorSchema.updateOne({ email: data.email }, { "activation_token": token, admin_approval: true })

         console.log('string :' + activating_link_string + token)
         const role = 1
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

export const userProfile = async (req, res) => {
   try {
      const user_id = req.user_id
      const profile = await sponsorSchema.findOne({ _id: user_id }).populate('documents')

      console.log('useriddd', user_id);
      console.log("profilee", profile)

      res.status(200).json({ success: true, data: profile })
   }
   catch (error) {
      res.status(200).json({ success: false, message: 'profile not found' })

   }

}
export const userUpdate = async (req, res) => {
   console.log('dfghh');

   try {
      const data = req.body
      console.log("reqdata", data)
      const type = req.body.type
      const file = (req as any).files?.img && (req as any).files.img
        console.log('files :', req.files);
        const img = (req as any).files?.img
        const response: any = await imageUpload(img)
        console.log('document data uploaded in profile:', (response as any));
        const imgUpload = await sponsorSchema.updateOne({_id:req.user_id},{$set:{img:response}})
          console.log("imgupdate",{ imgUpload });
      console.log("reqdata", data)
      console.log("type", type)
      console.log('body', req.body.first_name, req.body.last_name, req.user_id);

      const appProfile = await sponsorSchema.updateOne(
         { _id: req.user_id }, {



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

export const getNotification = async (req, res) => {

   const userId = new mongoose.Types.ObjectId(req.user_id);

   console.log('notification', userId);

   try {
      if (userId) {
         // const notifications = await applicantSchema.findOne({ _id: userId }).select('notification').sort({'notification._id':1})
         // console.log('notification',notifications?.notification);
         const notifications = await sponsorSchema.aggregate([
            { $match: { _id: userId } },


            { $unwind: '$notification' },
            { $sort: { "notification.createdAt": -1 } },
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
      const userData: any = await sponsorSchema.findOne({ _id: userId })
      const userPasswordDb = userData.password
      if (userPasswordDb) {
         validate_data(currentPassword, userPasswordDb).then(async (response) => {
            console.log('password check', response);

            if (!response === true) {
               res.status(200).json({ message: 'Your password is incorrect', success: false })

            }
            else {

               const updatePassword = await sponsorSchema.findByIdAndUpdate({ _id: userId }, { password: hashedPassword }, {
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


export const getNotifIndication: any = async (req: Req, res: Response) => {

   try {
      console.log('body',req.body);
      
      const { projectIds } = req.body
      const { user_id } = req
      console.log({ projectIds, user_id });
      const userId = new mongoose.Types.ObjectId(user_id);

      const projectIDs = projectIds.map(projectId => {
         return new mongoose.Types.ObjectId(projectId)
      })
      //const sponsorData :any= await sponsorSchema.findOne({ _id: user_id ,'notification.isShowed':false }, { notification: 1 }).lean()
      const notifications = await sponsorSchema.aggregate([
         { $match: { _id: userId } },
         { $unwind: '$notification' },
         { $sort: { "notification.createdAt": -1 } },
         { $match: { "notification.isShowed": false, "notification.projectId": { "$in": projectIDs } } },
         { $group: { _id: "$_id", notification: { $push: "$notification.projectId" } } },

      ])
      //const notifications =sponsorData.notification
      console.log(notifications[0].notification);
      let updatedProjects = notifications[0].notification
    
      console.log('updated projects', updatedProjects);
      // res.json({ datas: sponsorData })
      res.status(200).json({ message: 'success', data: updatedProjects, success: true })


   } catch (error) {
      res.status(200).json({ success: false, message: error })

   }


}