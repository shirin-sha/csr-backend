//modules
import { Router, Request, Response ,static as st} from "express";
import fileUpload from "express-fileupload"

import jwt from 'jsonwebtoken'

//local modules


import { registration, login, activate_account, add_event, reset_password, reset_password_email, sendActivateMail, userProfile, userUpdate, getNotification, changePassword, getNotifIndication } from '../Helpers/sponsor_helper'


import { secretKey } from "../config/variables";
import { addSponsorShip, confirmBid, editSponsor, list_projects, project_details, removeBid, viewCount } from "../Helpers/project_helper";
import { closeEvent, event_details, listQuotation, list_events } from "../Helpers/event_helper";
import path from "path";
import { getChatsData, startChat } from "../Helpers/chatHelper";
import sponsorSchema from "../models/sponsor";
import { Req } from "../types/types";


//config
const router = Router()
router.use(
    "/project-details",
    st(path.join(__dirname, '../../images')));
router.use(
    "/event-details",
    st(path.join(__dirname, '../../images')));
    router.use("/list-projects",st(path.join(__dirname, '../../images/thumbnails')));
    router.use("/list-events", st(path.join(__dirname, '../../images/thumbnails')));
    router.use("/profile", st(path.join(__dirname, '../../images/thumbnails')));
    router.use("/update-data", st(path.join(__dirname, '../../images/thumbnails')));
    
// apis
// interface Req extends Request {
//     user_id: any,
//     role: any

// }
const verifyLogin: any = (req: Req, res: Response, next) => {
    const token = req.headers.token;
    console.log("tk", token);
    jwt.verify(token, secretKey, async(err, value) => {
        if (err) {
            console.log(err.message);
            res.status(401).send('Authorization error');
        } else {
            console.log('value', value);
            req.user_id = value.data.id
            req.role = value.data.role
            console.log('id  :',req.user_id);
            
            // check the user is blocked by the admin

            // get user data from database
            const userId :string= value.data.id
            const userData :any = await sponsorSchema.findOne({ _id: userId }).select('blocked').lean()
           console.log('user data for block',{userData});
           
            if (userData?.blocked) {
                console.log('account is blocked');
                res.status(401).send('Account is blocked by admin');
            }else{
                next();

            }
        }
    });
};
//--- registration 

router.post('/register', fileUpload({ createParentPath: true }), (req, res) => {
    /* 
          
           #swagger.parameters['company_name']= {type:'string'}
            #swagger.parameters['address']= { type:'string',} 
           #swagger.parameters['email']= { type:'string'}
            #swagger.parameters['password']= { type:'string',} 
           #swagger.parameters['re_password']= { type:'string'}
            #swagger.parameters['mobile']= { type:'number',} 
           #swagger.parameters['contact_person_name']= { type:'string'}
           #swagger.parameters['documents']= { type:'string'}
           #swagger.parameters['interested_categories']= { type:'string'}

   
       */
    const data: any = req.body
    console.log({ data });

    try {
        const files = (req as any).files?.documents && (req as any).files.documents


        console.log('data got at server,\n body:', data, '\n file:', files);

        registration(data, files).then(response => {

            //provide activating link--x
            if (!(response as any).success) {
                res.status(200).json(response)

            } else {
                res.status(200).json(response)

            }
        }).catch(err => {

            res.status(200).json(err)

        })

    } catch (error) {
        console.log('error from route:', error);
        res.status(200).json({
            success: false,
            message: 'something went wrong '
        })
    }





})

//---login

router.post('/login', fileUpload({ createParentPath: true }), async (req, res) => {

    /*
    #swagger.parameters['email']= { type:'string'}
    #swagger.parameters['password']= { type:'string'} 
    
     */
    const data: any = req.body

    login(data).then((resp) => {
        if ((resp as any).success == true) {
            res.status(200).header({ token: (resp as any).token, "Access-Control-Expose-Headers": 'token' }).json({ data: (resp as any).user, success: true, message: 'login successful' })

        } else {
            res.status(200).json(resp)
        }

    }).catch((err) => {
        res.status(200).json(err)
    })


})

//  send reset password link in email

router.post('/reset-password-email', fileUpload({ createParentPath: true }), (req, res) => {
    let email = req.body.email
    console.log(email);
    // check data
    if (!email || email == undefined) {
        res.json({ success: false, message: 'email is empty' })
    } else {
        reset_password_email(email).then((result: any) => {
            if (result.success === false) {
                res.status(200).json(result)
            } else {
                res.status(200).json(result)
            }
        }).catch(err => {
            res.status(200).json(err)
        })
    }




})

// reset password
router.post('/reset-password', fileUpload({ createParentPath: true }), (req, res) => {
    /*
   #swagger.parameters['password']= { type:'string'}
   #swagger.parameters['token']= { type:'string'}
   #swagger.parameters['re_password']= { type:'string'}


    */
    const data = req.body
    if (!data || data === undefined || data === null) {
        res.status(200).json({
            success: false,
            message: 'password not found'
        })
    }
    reset_password(data).then((resp: any) => {
        if (resp.success == false) {
            res.status(200).json(resp)
        } else {
            res.status(200).json(resp)

        }
    }).catch(error => {
        res.status(200).json(error)
    })

})

//--activate account

router.post('/activate-account', (req, res) => {

    const token = req.body.token
    console.log(token);


    activate_account(token).then((resp: any) => {
        res.status(200).json(resp)

    }).catch(err => {
        res.status(200).json(err)
    })



})

//add event

router.post('/add-event', verifyLogin, fileUpload({ createParentPath: true }), (req, res) => {
    /* #swagger.parameters['documents']= { }*/
    const form_data = req.body
    const data = {
        event_title: form_data.event_title,
        event_title_ar: form_data.event_title_ar,
        budget: form_data.budget,
        type: form_data.event_type,
        location: form_data.location,
        from_date: form_data.from_date,
        submission_date: Date.now(),
        to_date: form_data.to_date,
        number_of_attendees: form_data.number_of_attendees,
        fees: form_data.fees,
        category: form_data.category

    }

    console.log('form data :', data);
    const files = (req as any).files?.documents && (req as any).files.documents
    const img = (req as any).files?.img
    // check body
    if (!data || data === null || data === undefined) {
        res.status(200).json({
            success: false,
            message: 'data not found'
        })
    }
    console.log('user id :', (req as any).user_id);
    const user_id = (req as any).user_id
    add_event(data, files, user_id,img).then((resp) => {
        res.status(200).json(resp)
    }).catch(err => {
        res.status(200).json(err)
    })


})

// project_listing

router.post('/list-projects', verifyLogin, fileUpload({ createParentPath: true }), (req: any, res) => {
    /*
    #swagger.parameters['limit']= { type:'string'}
    #swagger.parameters['page']= { type:'string'}
    #swagger.parameters['condition']= { type:'string'}
     #swagger.desc 
    */
    const user = req.user_id
    console.log({ user });

    const data = req.body
    console.log({ data });

    //initilize condition
    let condition :any= { $or: [
        {status:'ACTIVE'},
        {status:'QUEUE'}

      ]}  // active: for active projects ,queue: for queue projects ,my: for my projects
    // select conditions
    
    
    const queryData = {
        limit: data.limit,
        page: data.page,
        condition,
    }
    console.log(data);
    console.log(condition);

    if (data.limit < 1 || data.page < 1) {
        res.status(200).json({
            success: false,
            message: 'input error'
        })
    } else {
        // list projects function
        list_projects(queryData).then((resp: any) => {
            console.log('projects :', resp);
            if (resp.success === false) {
                res.status(200).json(resp)
            } else {
                res.status(200).json({
                    success: true,
                    message: 'data are collected',
                    data: resp
                })
            }


        }).catch(err => {
            res.status(200).json(err)
        })
    }
})

// find project by Id
router.post('/project-details', verifyLogin, fileUpload({ createParentPath: true }), (req :any, res:any) => {
    const id = req.body.id //project id
    console.log('id', id);
const userId :any=req.user_id
console.log({userId});

    project_details(id, true,userId).then((resp: any) => {
        if (resp.success === false) {
            res.status(200).json(resp)
        } else {
            return res.status(200).json(resp)

        }

    }).catch(err => {
        return res.status(200).json(err)

    })
})

// listing events
router.post('/list-events', verifyLogin, fileUpload({ createParentPath: true }), (req: any, res) => {
    const data = req.body
    const user = req.user_id
    console.log({ user });

    const queryData = {
        limit: data.limit,
        page: data.page,
        condition: { added_sponsor: user }
    }
    if (data.limit < 1 || data.page < 1) {
        res.status(200).json({
            success: false,
            message: 'input error'
        })
    } else {
        // list projects function
        list_events(queryData).then((resp: any) => {
            console.log('events :', resp);
            if (resp.success === false) {
                res.status(200).json(resp)
            } else {
                console.log('sponsor events', resp, 'user id :', user);

                res.status(200).json({
                    success: true,
                    message: 'data are collected',
                    data: resp
                })
            }


        }).catch(err => {
            res.status(200).json(err)
        })
    }
})

// find event by Id
router.post('/event-details', verifyLogin, fileUpload({ createParentPath: true }), (req, res) => {
    const id = req.body.id
    console.log('id', id);

    event_details(id).then((resp: any) => {
        if (resp.success === false) {
            res.status(200).json(resp)
        } else {
            return res.status(200).json(resp)

        }

    }).catch(err => {
        return res.status(200).json(err)

    })
})
// view document 
router.post('/document-view', verifyLogin, fileUpload({ createParentPath: true }), (req, res) => {
    const data = req.body
    console.log({ data });

    console.log(path.join(__dirname, '../../'));


    const file = path.join(__dirname, "../../uploads/" + data.file)
    res.sendFile(file, (err, resp) => {
        if (err) {
            console.log({ err });
            res.status(200).json({ message: 'file not found' })

        } else {
            console.log({ resp });

        }
    })


})
router.post('/delete-document')
// add sponsor-ships


router.post('/add-sponsorship', verifyLogin, fileUpload({ createParentPath: true }), addSponsorShip)
router.post('/list-quotation', verifyLogin, fileUpload({ createParentPath: true }), listQuotation)
router.post('/confirm-bid', verifyLogin, fileUpload({ createParentPath: true }), confirmBid)
router.post('/remove-sponsorship', verifyLogin, fileUpload({ createParentPath: true }), removeBid)
router.post('/send-activateLink', fileUpload({ createParentPath: true }), (req, res) => {
    const data = req.body
    console.log(data.role, data.id);

    if (!data || data == null || data === undefined) {
        res.status(200).json({
            success: false,
            message: 'invalid request'
        })
    }

    sendActivateMail(data).then((result) => {
        res.status(200).json(result)
    }).catch(error => {
        res.status(200).json(error)
    })
})


router.post('/profile',verifyLogin,userProfile)
router.post('/update-data',verifyLogin,fileUpload({ createParentPath: true }),userUpdate)

router.post('/startChat',verifyLogin,fileUpload({ createParentPath: true }),startChat)
router.post('/fetChatData',verifyLogin,fileUpload({ createParentPath: true }),getChatsData)

router.post('/editSponsor',verifyLogin,fileUpload({ createParentPath: true }),editSponsor)

router.post('/viewCount',verifyLogin,fileUpload({ createParentPath: true }),viewCount)

router.post('/getNotify',verifyLogin,fileUpload({ createParentPath: true }),getNotification)
router.post('/change-password',verifyLogin,fileUpload({ createParentPath: true }),changePassword) 
router.post('/closeEvent', verifyLogin, fileUpload({ createParentPath: true }), closeEvent)

router.post('/notifIndication', verifyLogin, fileUpload({ createParentPath: true }), getNotifIndication)

//---------
export default router