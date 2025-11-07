import { adminFaqSchema } from '../models/faq';
import { inquirySchema } from '../models/inquiries'
import { userFaqSchema } from '../models/userQuestions';
import { blogSchema } from '../models/blogs';
import { Router, static as st } from "express";
import path from 'path'
const router = Router()


// contact us page
export const postInquiry = async (req, res) => {
    const data = req.body
    console.log({ data });
    if (!data || data === undefined || data === null) {
        console.log('data is not found');
        res.status(200).json({ message: 'data not found', success: false })

    } else {
        const user = {
            name: data.name,
            mobile: data.mobile,
            email: data.email,
            subject: data.subject,
            message: data.message
        }

        const userData = await new inquirySchema(user)
        userData.save(async (err) => {
            if (err) {
                console.log({ err });
                res.status(200).json({ message: 'database error:' + err, success: false })

            } else {
                console.log({ err });
                res.status(200).json({ message: 'data add to database', success: true })
            }

        })
    }


}

// faq page
export const postQuestion = async (req, res) => {
    const data = req.body
    console.log({ data });
    if (!data || data === undefined || data === null) {
        console.log('data is not found');
        res.status(200).json({ message: 'data not found', success: false })

    } else {
        const user = {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message
        }

        const userData = await new userFaqSchema(user)
        userData.save(async (err) => {
            if (err) {
                console.log({ err });
                res.status(200).json({ message: 'database error:' + err, success: false })

            } else {
                console.log({ err });
                res.status(200).json({ message: 'data add to database', success: true })
            }

        })
    }


}

export const getFaq = async (req, res) => {
    const questions = await adminFaqSchema.find({})
    if (questions.length === 0) {
        
        res.status(200).json({ success: false, data: questions, message: ' database is empty' })

    } else {

        res.status(200).json({ success: true, data: questions, message: ' data fetched' })

    }


}
export const viewBlogs = async(req,res)=>{
    console.log("viewblogdetail")
    try{
    const data=req.body
    console.log('blog data',data)
    const blogData=await blogSchema.findOne({_id:data.id})

console.log("blogData",blogData)

   res.status(200).json({ success: true, data: blogData })
   }
   catch (error) {
    res.status(200).json({ success: false, message: 'blog not found'})

 }
}
