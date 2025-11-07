import {Request,Response} from 'express'

export interface Req extends Request {
    user_id: any,
    role: any

}