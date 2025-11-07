// local modules
import validator from '../func/validator'
import { bcrypt_data, validate_data } from '../func/bcrypt'
import { adminSchema } from '../models/admin'
import { categorySchema } from '../models/categories'
import { applicantSchema } from '../models/applicant'
import { organizerSchema } from '../models/organizer'
import sponsorSchema from '../models/sponsor'



import { object } from 'joi'
import mongoose from 'mongoose'
import { documentSchema } from '../models/document'

export const get_categories = () => {
    return new Promise(async (resolve, reject) => {

        try {
           
            const categories = await categorySchema.find()

            if (!categories) {
                resolve({ success: false, message: 'Categories not found' })

            } else {
                resolve({ success: true, message: 'categories ', categories })
            }
        } catch (error) {
            resolve({ success: false, message: ' Categories can`t find verify category Id' })

        }



    })
}

