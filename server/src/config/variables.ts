import { ObjectId } from "mongoose";

const dotenv = require('dotenv');
dotenv.config();

export const PORT = process.env.PORT
export const DB = process.env.DB as string
export const saltRounds = 10
export const secretKey = process.env.SECRET as string
export const activating_link_string = process.env.BASE_URL as string
export const client_url = process.env.CLIENT_URL as string
export const Mail = process.env.EMAIL as string

export const ACTIONS = {
    RM: 'remove',
    CF: 'confirm',
    AC: 'accept',
    AD: 'add'
}


export const adminLogData = ({ message, action, adminId }:
    {
        message: string,
        action?: string,
        adminId: string | ObjectId,
    }) => ({
        type: "admin",
        message,
        action,
        adminId,
    })

enum roles {
    SUPER_ADMIN =0,
    APPLICANT_MASTER=10,
    SPONSOR_MASTER=20,
    EVENT_ORGANIZER_MASTER=30,
    PROJECT_MASTER=40
};

export const Admin_Strict_List=[roles.SUPER_ADMIN]
export const Admin_Applicant_Master_List=[roles.SUPER_ADMIN,roles.APPLICANT_MASTER]
export const Admin_Sponsor_Master_List=[roles.SUPER_ADMIN,roles.SPONSOR_MASTER]
export const Admin_Organizer_Master_List=[roles.SUPER_ADMIN,roles.EVENT_ORGANIZER_MASTER]
export const Admin_Project_Master_List=[roles.SUPER_ADMIN,roles.PROJECT_MASTER]






