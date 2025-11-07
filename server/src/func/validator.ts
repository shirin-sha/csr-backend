import joi, { allow, any } from 'joi'


export default {

    applicant_register: (data: any, isIndividal: boolean) => {
        return new Promise(async (resolve, reject) => {
            let schema: any
            // create schema
            if (isIndividal) {

                schema = joi.object({
                    type: joi.number().min(0).max(1),
                    first_name: joi.string().required().min(3).max(100),
                    last_name: joi.string().required().max(100),
                    email: joi.string().email().required().min(4),
                    password: joi.string().required().min(3).max(200).strict(),
                    re_password: joi.string().valid(joi.ref('password')).required().strict(),
                    mobile: joi.string().required().min(5),
                    gender: joi.allow(),
                    dob: joi.allow()
                })
            } else {
                schema = joi.object({
                    type: joi.number().min(0).max(1),
                    company_name: joi.string().required().min(3).max(100),
                    email: joi.string().email().required().min(4),
                    password: joi.string().required().min(3).max(200).strict(),
                    re_password: joi.string().valid(joi.ref('password')).required().strict(),
                    mobile: joi.string().required().min(5),
                    address: joi.string().min(5).max(200),
                    contact_person_name: joi.string().min(3),
                    documents: joi.allow()


                });
            }


            // validate data
            const { error } = await schema.validate(data)
            if (error) {
                reject({
                    success: false,
                    message: error.details[0].message,

                })
            } else {
                resolve({ success: true })

            }

        })




    },
    organizer_register: (data: any, isIndividal: boolean) => {
        return new Promise(async (resolve, reject) => {
            let schema: any
            // create schema
            if (isIndividal) {

                schema = joi.object({
                    type: joi.number().min(0).max(1),
                    first_name: joi.string().required().min(3).max(100),
                    last_name: joi.string().required().max(100),
                    email: joi.string().email().required().min(4),
                    password: joi.string().required().min(3).max(200).strict(),
                    re_password: joi.string().valid(joi.ref('password')).required().strict(),
                    mobile: joi.string().required().min(5),
                    interested_categories: joi.allow()
                })
            } else {
                schema = joi.object({
                    type: joi.number().min(0).max(1),
                    company_name: joi.string().required().min(3).max(100),
                    email: joi.string().email().required().min(4),
                    password: joi.string().required().min(3).max(200).strict(),
                    re_password: joi.string().valid(joi.ref('password')).required().strict(),
                    mobile: joi.string().required().min(5),
                    address: joi.string().min(5).max(200),
                    contact_person_name: joi.string().min(3),
                    documents: joi.allow(),
                    interested_categories: joi.allow()


                });
            }


            // validate data
            const { error } = await schema.validate(data)
            if (error) {
                reject({
                    success: false,
                    message: error.details[0].message,

                })
            } else {
                resolve({ success: true })

            }

        })




    },
    sponsor_validator: (data: any) => {
        return new Promise(async (resolve, reject) => {
            const schema = joi.object({
                company_name: joi.string().required().min(3).max(10),
                email: joi.string().email().required().min(4),
                password: joi.string().required().min(3).max(20).strict(),
                re_password: joi.string().valid(joi.ref('password')).required().strict(),
                mobile: joi.string().required().min(5),
                address: joi.string().min(5).max(300).required(),
                contact_person_name: joi.string().min(3),
                documents: joi.allow(),
                interested_categories: joi.allow()

            });

            // validate data
            const { error } = await schema.validate(data)
            if (error) {
                reject({
                    success: false,
                    message: error.details[0].message
                })
            } else {
                resolve({
                    msg: 'validation success',


                })

            }

        })

    },
    admin_validator: (data: any) => {
        return new Promise(async (resolve, reject) => {
            const schema = joi.object({
                name: joi.string().required().min(1).max(100),
                email: joi.string().email().required().min(4),
                password: joi.string().required().min(3).max(20).strict(),
                role: joi.number().allow(),


            });

            // validate data
            const { error } = await schema.validate(data)
            if (error) {
                reject({

                    message: error.details[0].message,
                    success: false
                })
            } else {
                resolve({
                    msg: 'validation success',


                })

            }

        })

    },
    login_validator: (data: any) => {
        return new Promise(async (resolve, reject) => {
            const schema = joi.object({

                email: joi.string().email().required().min(5),
                password: joi.string().required().max(20).strict(),
            });

            // validate data
            const { error } = await schema.validate(data)
            if (error) {
                reject({
                    message: error.details[0].message,
                    success: false
                })
            }

            resolve({
                message: 'validation success',
                success: true
            })
        })
    },

    admin_login_validator: (data: any) => {
        return new Promise(async (resolve, reject) => {
            const schema = joi.object({

                name: joi.string().required().min(5),
                password: joi.string().required().min(3).max(20).strict(),
            });

            // validate data
            const { error } = await schema.validate(data)
            if (error) {
                reject({
                    message: error.details[0].message,
                    success: false
                })
            }

            resolve({
                message: 'validation success',
                success: true
            })
        })
    },

    //project validator
    project_validator: (form_data) => {
        return new Promise(async (resolve, reject) => {
            const schema = joi.object({

                project_name: joi.string().required().min(2),
                project_name_ar: joi.allow(),
                budget: joi.number().required(),
                documents: joi.allow(),
                fees: joi.number().required(),
                category: joi.string().allow(),
                img:joi.allow()

            });

            // validate data
            const { error } = await schema.validate(form_data)
            if (error) {
                reject({
                    message: error.details[0].message,
                    success: false
                })
            }

            resolve({
                message: 'validation success',
                success: true
            })
        })
    },

    // event validator
    event_validator: (form_data) => {
        return new Promise(async (resolve, reject) => {
            const schema = joi.object({

                event_title: joi.string().required().min(2),
                event_title_ar: joi.string().required().min(2),
                budget: joi.number().required(),
                type: joi.string().required(), // PRIVATE .PUBLIC
                location: joi.allow(),
                submission_date: joi.allow(),
                from_date: joi.date(),
                to_date: joi.date(),
                number_of_attendees: joi.allow(),
                documents: joi.allow(),
                fees: joi.number().required(),
                category: joi.string().allow(),
                img:joi.allow()
            });

            // validate data
            const { error } = await schema.validate(form_data)
            if (error) {
                reject({
                    message: error.details[0].message,
                    success: false
                })
            }

            resolve({
                message: 'validation success',
                success: true
            })
        })
    },

    resetPassword_email_validator: (data: any) => {
        return new Promise(async (resolve, reject) => {
            console.log('data for validator ', data);

            const schema = joi.string().email().required().min(5)



            // validate data
            const { error } = await schema.validate(data)
            if (error) {

                reject({
                    message: error.details[0].message,
                    success: false
                })

            }

            resolve({
                message: 'validation success',
                success: true
            })
        })
    },


    update_password_validator: (data: any) => {
        return new Promise(async (resolve, reject) => {
            const schema = joi.object({
                password: joi.string().required().min(3).max(20).strict(),
                re_password: joi.string().valid(joi.ref('password')).required().strict(),
                token: joi.required()
            })



            // validate data
            const { error } = await schema.validate(data)
            if (error) {

                reject({
                    message: error.details[0].message,
                    success: false
                })

            }

            resolve({
                message: 'validation success',
                success: true
            })
        })
    },

change_password:(data:any)=>{
    return new Promise(async (resolve, reject) => {
        const schema = joi.object({
                password: joi.string().required().strict(),
                re_password: joi.string().valid(joi.ref('password')).required().strict(),
                currentpassword:joi.string().required().strict()

        }) 
        const { error } = await schema.validate(data)
            if (error) {

                reject({
                    message: error.details[0].message,
                    success: false
                })

            }

            resolve({
                message: 'validation success',
                success: true
            })
    })

},

    sponsor_ships: (data: any) => {
        return new Promise(async (resolve, reject) => {
            const schema = joi.object({
                amount: joi.number().min(1).required(),
                hide_name: joi.boolean().default(false),
                type: joi.string().allow(),
                project_id: joi.allow(),
                status: joi.allow()

            })



            // validate data
            const { error } = await schema.validate(data)
            if (error) {

                reject({
                    message: error.details[0].message,
                    success: false
                })

            }

            resolve({
                message: 'validation success',
                success: true
            })
        })
    },
    quotations: (data: any) => {
        return new Promise(async (resolve, reject) => {
            const schema = joi.object({
                amount: joi.number().min(1).required(),
                note: joi.string().allow(),
                event_id: joi.allow(),
                documents: joi.string().allow()
            })



            // validate data
            const { error } = await schema.validate(data)
            if (error) {

                reject(error.details[0].message)

            }

            resolve({
                message: 'validation success',
                success: true
            })
        })
    },

}