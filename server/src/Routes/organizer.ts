
//modules
import { Router ,static as st} from "express";
import fileUpload from "express-fileupload"

import jwt from 'jsonwebtoken'
//local modules


import { registration, login, activate_account, add_project, reset_password, reset_password_email, sendActivateMail, userUpdate, getNotification, changePassword, expireDateNotif } from '../Helpers/organizer_helper'


import { secretKey } from "../config/variables";
import { acceptBid, acceptQueue, endSponsor, list_projects, project_details, removeBidByapplicant } from "../Helpers/project_helper";
import { addQuotation, closeEvent, event_details, listQuotation, list_events, viewCount } from "../Helpers/event_helper";
import path from "path";
import { userProfile } from "../Helpers/organizer_helper";
import { getChatsData, startChat } from "../Helpers/chatHelper";
import { organizerSchema } from "../models/organizer";



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
const verifyLogin = (req, res, next) => {
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
            console.log('role :', value.data.role);
          // check the user is blocked by the admin

            // get user data from database
            const userId :string= value.data.id
            const userData :any = await organizerSchema.findOne({ _id: userId }).select('blocked').lean()
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

router.post('/register', fileUpload({ createParentPath: true }), async (req, res) => {

    const data: any = req.body
    console.log('data got at server');
    /*#swagger.parameters['type']= { type:'number',} 
    #swagger.parameters['company_name']= {type:'string'}
     #swagger.parameters['address']= { type:'number',} 
    #swagger.parameters['email']= { type:'string'}
     #swagger.parameters['password']= { type:'number',} 
    #swagger.parameters['re_password']= { type:'string'}
     #swagger.parameters['mobile']= { type:'number',} 
    #swagger.parameters['contact_person_name']= { type:'string'}
     #swagger.parameters['first_name']= { type:'number',} 
    #swagger.parameters['last_name']= { type:'string'}
    #swagger.parameters['documents']= { type:'string'} 
    #swagger.parameters['interested_categories']= { type:'string'} 

    
    */

    //check organizer individual or corporate
    const isIndividual: boolean = Number(data.type) === 0 ? true : false


    try {
        const file = (req as any).files?.documents && (req as any).files.documents
        console.log('file', file);

        registration(data, isIndividual, file).then(response => {


            res.status(200).json(response)



        }).catch(err => {

            //send msg to client
            res.status(200).json(err)
        })
    } catch (error) {
        console.log('error from route:', error);
        res.status(200).json({
            success: false,
            message: 'internal server error '
        })
    }

})

//---login

router.post('/login', fileUpload({ createParentPath: true }), async (req, res) => {
    /* 
            #swagger.parameters['email']= { type:'string'}
             #swagger.parameters['password']= { type:'string',} 
    
        */
    const data: any = req.body

    login(data).then(async(resp:any) => {
        if ((resp as any).success == true) {

            const expireDateReminder=await expireDateNotif(data.email)
            res.status(200).header({ token: (resp as any).token, "Access-Control-Expose-Headers": 'token' }).json({ data: (resp as any).user,expireDateReminder, success: true, message: 'login succesfull' })

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
    }
    reset_password_email(email).then((result: any) => {
        if (result.success === false) {
            res.status(200).json(result)
        } else {
            res.status(200).json(result)
        }
    }).catch(err => {
        res.status(200).json(err)
    })



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


// add project
router.post('/add-project', verifyLogin, fileUpload({ createParentPath: true }), (req, res) => {
    /*
   #swagger.parameters['project_name']= { type:'string'}
   #swagger.parameters['project_name_ar']= { type:'string'}
   #swagger.parameters['category']= { type:'string'}
   #swagger.parameters['budget']= { type:'number'}
   #swagger.parameters['fees']= { type:'number'}
   #swagger.parameters['documents']= { }

   */
    const data = req.body
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
    //add project function
    add_project(data, files, user_id,img).then(async (resp) => {

        res.status(200).json(resp)
    })


})

// project_listing

router.post('/list-projects', verifyLogin, fileUpload({ createParentPath: true }), (req: any, res: any) => {
    /*
    #swagger.parameters['limit']= { type:'string'}
    #swagger.parameters['page']= { type:'string'}
    */
   
    const user = req.user_id
    console.log({ user });

    const data = req.body
    const queryData = {
        limit: data.limit,
        page: data.page,
        condition: { added_organizer: user }
    }
    console.log(data);
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
router.post('/project-details', verifyLogin, fileUpload({ createParentPath: true }), (req, res) => {
    const id = req.body.id
    console.log('id', id);

    project_details(id, false).then((resp: any) => {
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


    console.log({ data });

    //initilize condition
    let condition = {}  // all:all events ,my: for my events
    // select conditions


    if (data.condition == 'my') {
        condition = { 'organizers.organizer_id': user }

    }
    else if (data.condition == 'all') {
        condition = {}

    }
    console.log('event fetching condition',condition);
    
    const queryData = {
        limit: data.limit,
        page: data.page,
        condition,
    }
    console.log(data);
    console.log(condition);
    console.log(data);
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
// add quotation for project


router.post('/add-quotation', verifyLogin, fileUpload({ createParentPath: true }), addQuotation)
router.post('/accept-bid', verifyLogin, fileUpload({ createParentPath: true }), acceptBid)
router.post('/remove-sponsorship', verifyLogin, fileUpload({ createParentPath: true }), removeBidByapplicant)
router.post('/accept-queue',verifyLogin,fileUpload({ createParentPath: true }),acceptQueue)

router.post('/send-activateLink',fileUpload({ createParentPath: true }), (req :any, res:any) => {
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

router.post('/viewCount',verifyLogin,fileUpload({ createParentPath: true }),viewCount)
router.post('/endSponsor',verifyLogin,fileUpload({ createParentPath: true }),endSponsor)
router.post('/getNotify',verifyLogin,fileUpload({ createParentPath: true }),getNotification)

router.post('/closeEvent', verifyLogin, fileUpload({ createParentPath: true }), closeEvent)


router.post('/change-password',verifyLogin,fileUpload({ createParentPath: true }),changePassword)

//---------
export default router