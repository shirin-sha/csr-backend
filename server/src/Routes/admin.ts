//modules
import { Request, Router, static as st } from "express";
import fileUpload from "express-fileupload"
import { any } from "joi";
import jwt from 'jsonwebtoken'
import { adminLogData, secretKey } from "../config/variables";
import { login, add_category, list_applicants, list_organizers, list_sponsors, find_applicant, find_organizer, find_sponsor, updateSponsorType, sendActivateMail, setExpireDate, blockUser, delete_category, changeFixedFee, changePercentageFee, getFees, getAdmins, register, getInquiries, addDiscount, expireProject, extendProject, postContactInfo, getContactInfo, getUserFaq, postFaq, postOurProject, getOurProject, postBlogs, getBlogs, editOurProject, editBlogs, removeFaq, categoryProject, deleteProject, deleteBlog, userProfileUpdateByAdmin, listLogs, SponserUpdateData, organizerUpdate, applicantUpdate } from '../Helpers/admin_helper'
import { get_categories } from "../Helpers/common_helper";
import { event_details, list_events } from "../Helpers/event_helper";
import { changeStatus, list_projects, project_details } from "../Helpers/project_helper";
import path, { join } from 'path'
import { getFaq, postQuestion } from "../Helpers/public_helper";
import { applicantSchema } from "../models/applicant";
import { bannerSchema } from "../models/banner";
import imageUpload from "../func/imageUpload";
import fs from "fs/promises"
import { logger } from "..";
import {adminSchema} from "../models/admin"
//config
const router = Router()

//middlewares
router.use(
    "/get-ourProject",
    st(path.join(__dirname, '../../images/thumbnails')));
router.use(
    "/get-blogs",
    st(path.join(__dirname, '../../images/thumbnails')));
router.use(
    "/get-faq",
    st(path.join(__dirname, '../../images/thumbnails')));

//---api
const verifyLogin =(authList=[0])=>{

    return (req, res, next) => {
        const token = req.headers.token;
        if (!token || typeof token !== 'string') {
            return res.status(401).json({
                auth: false,
                message: 'Authorization failed'
            });
        }
        jwt.verify(token, secretKey, (err, value) => {
            let role = value?.data?.role % 10 !== 0 ? 1 : value?.data.role
            if (value?.data?.role % 10 === 0 && authList) {
                let isAuthorized = authList.some((d) => parseInt(value?.data.role) === d)
               
                if (!isAuthorized) {
                    res.status(401).json({
                        auth: false,
                        message: `You don't have permission to access this service`
        
                    })
                }
            }
            if (err) {
                console.log(err.message);
                res.status(401).json({
                    auth: false,
                    message: 'Authorization failed'
    
                })
            } else {
                console.log('value', value);
                req.user_id = value.data.id
                req.role = value.data.role
                console.log('role :', value.data.role);
                next();
            }
        });
    };
} 
router.post('/register', fileUpload({ createParentPath: true }), register)
//login route
router.post('/login', fileUpload({ createParentPath: true }), (req:any, res) => {
    const data = req.body
    console.log(('admin login data:' + data.email, data.password));

    if (!data) {
        res.status(200).json({
            message: 'request failed'
        })
    }

    login(data).then((resp) => {
        if ((resp as any).success == true) {
            logger.info(adminLogData({
                adminId:req.user_id,
                message:"Admin login to the Portal",
                action:"Logged in "
                
            }))
            res.status(200).header({ token: (resp as any).token, "Access-Control-Expose-Headers": 'token' }).json({ data: (resp as any).data, success: true, message: 'login successful' })

        } else {
            res.status(200).json(resp)
        }
    }).catch((err) => {
        res.status(200).json(err)
    })

})


router.post('/addBanner',verifyLogin([0]), fileUpload({ createParentPath: true }), async (req:any, res) => {
    try {
        console.log('addBanner headers:', req.headers);
        console.log('addBanner body keys:', Object.keys(req.body || {}));
        console.log('addBanner files:', Object.keys(req.files || {}));
        await fs.appendFile(path.join(__dirname, '../../debug.log'), `addBanner ${new Date().toISOString()} headers=${JSON.stringify(req.headers)} bodyKeys=${JSON.stringify(Object.keys(req.body || {}))} fileKeys=${JSON.stringify(Object.keys(req.files || {}))}\n`);
        if (await bannerSchema.count() > 5) {
            throw new Error("Maximum number of banners are exceeded");
        }

        const args = req.body; // Assuming the request body contains the necessary arguments
        console.log({ args });

        const img = req.files?.img
        console.log({ img });

        const uploadRes: any = await imageUpload(img)

        args.imageUrl = uploadRes
        console.log({alt:args.alt});
        
        const response = await new bannerSchema({
            ...args
        }).save();
        console.log({ response });

        res.status(200).json({
            success: true,
            msg: "Banner is added successfully"
        });

        if(response as any){
            logger.info(adminLogData({
                adminId:req.user_id,
                message:"Banner added ",
                action:"Banner adedd"
                
            }))

        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            msg: error.message || error
        });
    }
});


router.post('/deleteBanner/',verifyLogin(),fileUpload({ createParentPath: true }), async (req:any, res) => {
    try {



        const { id } = req.body;
        console.log("ss", id);

        if (!id) {
            throw new Error("Id is not found");
        }

        const response = await bannerSchema.findByIdAndDelete({ _id: id });

        if (!response) {
            throw new Error("Banner is not found");
        }

        // Assuming response.imageUrl contains the file path of the image to delete
        const imagePath = join(__dirname, "../../images/", response.imageUrl);

        // Delete the image file
        await fs.unlink(imagePath).catch(err => {
            console.log({ err });

        })

        if(response as any){
            logger.info(adminLogData({
                adminId:req.user_id,
                message:"Banner deleted by the admin",
                action:"Deleted Banner ",
            }))

        }

        res.status(200).json({
            success: true,
            msg: "Banner is deleted successfully"
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            msg: error.message || error
        });
    }
});

// delete admin
router.post('/deleteAdmin',verifyLogin(),async(req:any,res)=>{
    try{
        console.log("logged",req.body);
        
        const  id  = req.body;
        console.log("ss", id?.id  );

        if (!id) {
            throw new Error("Id is not found");
        }
        const response = await adminSchema.findByIdAndDelete({ _id: id?.id });
        if (!response) {
            throw new Error("Admin is not found");
        }
        else{
            console.log("deleted");
            
        res.status(200).json({
            success: true,
            msg: "Admin is deleted successfully"
        })}

        
        logger.info(adminLogData({
            adminId:req.user_id,
            message:"User deleted a Admin",
            action:"User deleted a Admin",
        }))
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            msg: error.message || error
        });
    }
})
// add category route

router.post('/add-category', verifyLogin(), fileUpload({ createParentPath: true }), (req:any, res) => {
    const cat = req.body.category
    console.log(cat);

    // check body
    if (cat === null || !cat || cat === undefined) {
        console.log('error');

       
        res.status(200).json({
            success: false,
            message: 'data not found'
        })

        logger.info(adminLogData({
            adminId:req.user_id,
            message:"User trying to add category",
            action:"User trying to add category",
        }))

        
    } else {
        // add to db
        add_category(cat).then((resp: any) => {
            res.status(200).json({
                data: resp,
                message: resp[0].name + '  category added to database',
                success: true
            })

            logger.info(adminLogData({
                adminId:req.user_id,
                message:"Category added to database",
                action:"Category added to database",
            }))

            
            
        }).catch(err => {
            res.status(200).json(err)
        })
    }



})

//delete category
router.post('/dlt-category', verifyLogin(), fileUpload({ createParentPath: true }), (req:any, res) => {
    const cat = req.body.id
    console.log(cat);

    // check body
    if (cat === null || !cat || cat === undefined) {
        console.log('error');

        res.status(200).json({
            success: false,
            message: 'data not found'
        })

        logger.info(adminLogData({
            adminId:req.user_id,
            message:"User trying to add category",
            action:"User trying to add category",
        }))
    } else {
        // delete to db
        delete_category(cat).then((resp: any) => {
            res.status(200).json({
                data: resp,
                message: '  category deleted in database',
                success: true
            })

            logger.info(adminLogData({
                adminId:req.user_id,
                message:"Category deleted by the admin",
            action:"Category Deleted "
                
            }))
        }).catch(err => {
            res.status(200).json(err)
        })
    }



})

// list applicants

router.post('/list-applicants', fileUpload({ createParentPath: true }), (req:any, res) => {
    const data = req.body
    console.log(data);
    if (data.limit < 1 || data.page < 1) {
        res.status(200).json({
            success: false,
            message: 'input error'
        })
    } else {
        // list applicant function
        list_applicants(data).then((resp: any) => {
            console.log('applicants :', resp);
            if (resp.success === false) {
                res.status(200).json(resp)
            } else {
                logger.info(adminLogData({
                    adminId:req.user_id,
                    message:"applicants are listed ",
                    action:"applicants are listed" 
                }))

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

// list organizers
router.post('/list-organizers', verifyLogin([0,30]), fileUpload({ createParentPath: true }), (req:any, res) => {
    const data = req.body
    console.log(data);
    if (data.limit < 1 || data.page < 1) {
        res.status(200).json({
            success: false,
            message: 'input error'
        })
    } else {
        // list organizer function
        list_organizers(data).then((resp: any) => {
            console.log('organizers :', resp);
            if (resp.success === false) {
                res.status(200).json(resp)
            } else {
                res.status(200).json({
                    success: true,
                    message: 'data are collected',
                    data: resp
                })
            }

            logger.info(adminLogData({
                adminId:req.user_id,
                message:"Organizers datas collected",
                action:"Organizers founded organization list "
            }))

        }).catch(err => {
            res.status(200).json(err)
        })
    }




})


//list sponsors
router.post('/list-sponsors', verifyLogin([0,20]), fileUpload({ createParentPath: true }), (req:any, res) => {
    const data = req.body
    console.log(data);
    if (data.limit < 1 || data.page < 1) {
        res.status(200).json({
            success: false,
            message: 'input error'
        })
    } else {
        // list sponsor function
        list_sponsors(data).then((resp: any) => {
            console.log('sponsors:', resp);
            if (resp.success === false) {
                res.status(200).json(resp)
            } else {
                res.status(200).json({
                    success: true,
                    message: 'data are collected',
                    data: resp
                })
                logger.info(adminLogData({
                    adminId:req.user_id,
                    message:"list founded  sponsers",
                    action:"list founded sponsers"
                    
                }))
            }


        }).catch(err => {
            res.status(200).json(err)
        })
    }




})

// find applicant byID
router.post('/applicant-details', verifyLogin([0,10]), fileUpload({ createParentPath: true }), (req:any, res) => {
    const id = req.body.id
    console.log('id', id);

    find_applicant(id).then((resp: any) => {
        if (resp.success === false) {
            res.status(200).json(resp)
        } else {
            res.status(200).json(resp)
            logger.info(adminLogData({
                adminId:req.user_id,
                message:"User Find applicant Details",
                action:"User Find applicant Details"  
            }))

        }
    }).catch(err => {
        res.status(200).json(err)
    })
})

// find organizer byID
router.post('/organizer-details', verifyLogin([0,30]), fileUpload({ createParentPath: true }), (req:any, res) => {
    const id = req.body.id
    console.log('id', id);

    find_organizer(id).then((resp: any) => {
        if (resp.success === false) {
            res.status(200).json(resp)
        } else {
            logger.info(adminLogData({
                adminId:req.user_id,
                message:"single organizer viewed ",
                action:"single organizer viewed "  
            }))
            res.status(200).json(resp)

        }
    }).catch(err => {
        res.status(200).json(err)
    })
})


// find sponsor byID
router.post('/sponsor-details', verifyLogin([0,20]), fileUpload({ createParentPath: true }), (req:any, res) => {
    const id = req.body.id
    console.log('id', id);

    find_sponsor(id).then((resp: any) => {
        if (resp.success === false) {
            res.status(200).json(resp)
        } else {

            logger.info(adminLogData({
                adminId:req.user_id,
                message:"single sponser viewed ",
                action:"single sponser viewed "  
            }))
            return res.status(200).json(resp)

        }

    }).catch(err => {
        return res.status(200).json(err)

    })
})

// listing project
router.post('/list-projects', verifyLogin([0,40]), fileUpload({ createParentPath: true }), (req:any, res) => {
    const data = req.body
    console.log(data.condition);
    if (data.limit < 1 || data.page < 1) {
        res.status(400).json({
            success: false,
            message: 'input error'
        })
    } else {
        // list projects function
        list_projects(data).then((resp: any) => {
            console.log('projects:', resp);
            if (resp.success === false) {
                res.status(200).json(resp)
            } else {

                logger.info(adminLogData({
                    adminId:req.user_id,
                    message:"Project list viewed ",
                    action:"Project list viewed "  
                }))
                
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
router.post('/project-details', verifyLogin([0,40]), fileUpload({ createParentPath: true }), (req:any, res) => {
    const id = req.body.id
    console.log('id', id);

    project_details(id, false).then((resp: any) => {
        if (resp.success === false) {
            res.status(200).json(resp)
        } else {
            res.status(200).json(resp)
            
            logger.info(adminLogData({
                adminId:req.user_id,
                message:"Single Project viewed ",
                action:"Single Project viewed "  
            }))
        }

    }).catch(err => {
        return res.status(200).json(err)

    })
})

// listing events
router.post('/list-events', verifyLogin([0,30]), fileUpload({ createParentPath: true }), (req:any, res) => {
    const data = req.body
    console.log(data);
    if (data.limit < 1 || data.page < 1) {
        res.status(200).json({
            success: false,
            message: 'input error'
        })
    } else {
        // list projects function
        list_events(data).then((resp: any) => {
            console.log('events :', resp);
            if (resp.success === false) {
                res.status(200).json(resp)
            } else {
                res.status(200).json({
                    success: true,
                    message: 'data are collected',
                    data: resp
                })

                logger.info(adminLogData({
                    adminId:req.user_id,
                    message:"event list viewed ",
                    action:"event list viewed "  
                }))
            }
        }).catch(err => {
            res.status(200).json(err)
        })
    }
})

// find event by Id
router.post('/event-details', verifyLogin([0,30]), fileUpload({ createParentPath: true }), (req:any, res) => {
    const id = req.body.id
    console.log('id', id);
  
    event_details(id).then((resp: any) => {
        if (resp.success === false) {
            res.status(200).json(resp)
        } else {
             res.status(200).json(resp)
             logger.info(adminLogData({
                adminId:req.user_id,
                message:"Event details viewed ",
                action:"Event details viewed "  
            }))
            
        }

    }).catch(err => {
        return res.status(200).json(err)

    })
})


//fetch categories
router.post('/get-categories', verifyLogin([0]), (req:any, res) => {
    get_categories().then((resp: any) => {
        if (resp.success === false) {
            res.status(200).json(resp.message)
        } else {
            res.status(200).json(resp)
            logger.info(adminLogData({
                adminId:req.user_id,
                message:"Categories viewed ",
                action:"Categories viewed "  
            }))
            
        }
    })
})

// sponsor type update
router.post('/sponsorType-update', verifyLogin([0]), (req:any, res) => {

    const data = req.body
    console.log(data.type, data.id);
    if (!data || data === null || data === undefined) {
        res.status(200).json({
            success: false,
            message: 'invalid request'
        })

        logger.info(adminLogData({
            adminId:req.user_id,
            message:"User trying to update sponsor",
            action:"User trying to update sponsor"  
        }))
    }
    updateSponsorType(data).then(resp => {
        res.status(200).json({ resp })
        logger.info(adminLogData({
            adminId:req.user_id,
            message:"Updated Sponsor Details",
            action:"Updated Sponsor"  
        }))
    }).catch(err => {
        res.status(200).json(err)
    })


})
// sponsor account activate link
router.post('/send-activateLink', verifyLogin([0]), (req:any, res) => {
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

//set expire date to oragnizer

router.post('/set-expireDate', verifyLogin([0]), (req, res) => {
    const data = req.body
    console.log(data.id, data.date);

    if (!data || data === null || data === undefined) {
        res.status(200).json({
            success: false,
            message: 'invalid request'
        })
    }
    setExpireDate(data).then(result => {
        res.status(200).json(result)
    }).catch(err => {
        res.status(200).json(err)
    })

})

// send documents
router.post('/document-view', verifyLogin([0]), fileUpload({ createParentPath: true }), (req, res) => {
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


// block user
router.post('/block-user', verifyLogin([0]), (req:any, res) => {
    const data = req.body  // userid ,role applicant=1 ,organizer=2 ,sponsor =3
    console.log(data.id, data.role);

    if (data === null || data === undefined) {
        res.status(200).json({ message: 'request not valid', success: false })
        
        logger.info(adminLogData({
            adminId:req.user_id,
            message:"Invalid User",
            action:"invalid request In Block User"  
        }))
    }
    blockUser(data).then(result => {
        res.status(200).json(result)
        logger.info(adminLogData({
            adminId:req.user_id,
            message:"Admin has blocked user",
            action:"User Blocked",
        }))
    }).catch(err => {
        res.status(200).json(err)
    })

})

// change status
router.post('/change-status', verifyLogin([0]), changeStatus)

// fixedFees-change
router.post('/change-fixedfees', verifyLogin([0]), fileUpload({ createParentPath: true }), changeFixedFee)

// percentageFees-change
router.post('/change-percentagefees', verifyLogin([0]), fileUpload({ createParentPath: true }), changePercentageFee)

//get fees api
router.post('/get-fees', verifyLogin([0]), getFees)

//get admins
router.post('/get-admins', verifyLogin([0]), fileUpload({ createParentPath: true }), getAdmins)

//get inquiries
router.post('/get-inquiries', verifyLogin([0,10,20,30,40]), fileUpload({ createParentPath: true }), getInquiries)

//add discount
router.post('/add-discount', verifyLogin([0,10,20,30,40]), fileUpload({ createParentPath: true }), addDiscount)

// expire project
router.post('/expire-project', verifyLogin([0,40]), fileUpload({ createParentPath: true }), expireProject)


//extend project
router.post('/extend-project', verifyLogin([0,40]), fileUpload({ createParentPath: true }), extendProject)

// add contact-info
router.post('/post-contactInfo', verifyLogin([0]), fileUpload({ createParentPath: true }), postContactInfo)

// get contact-info
router.post('/get-contactInfo', fileUpload({ createParentPath: true }), getContactInfo)

//get userQuestions
router.post('/get-userQuestions', fileUpload({ createParentPath: true }), getUserFaq)

// post  faq
router.post('/post-faq', fileUpload({ createParentPath: true }), postFaq)

// get faq
router.post('/get-faq', fileUpload({ createParentPath: true }), getFaq)
// get faq
router.post('/remove-faq', fileUpload({ createParentPath: true }), removeFaq)
////our project
// post ourProject
router.post('/post-ourProject', fileUpload({ createParentPath: true }), postOurProject)
//edit our project
router.post('/edit-ourProject', fileUpload({ createParentPath: true }), editOurProject)
// get our project

console.log(__dirname);

router.post('/get-ourProject', fileUpload({ createParentPath: true }), getOurProject)
router.post('/get-categoryProject', fileUpload({ createParentPath: true }), categoryProject)

// blogs and news
// add blogs or news
router.post('/post-blogs', fileUpload({ createParentPath: true }), postBlogs)
//edit blogs
router.post('/edit-blogs', fileUpload({ createParentPath: true }), editBlogs)

// get blogs
router.post('/get-blogs', fileUpload({ createParentPath: true }), getBlogs)
//---------
// frontend getblogs
// delete ourproject
router.post('/ourProject-delete', fileUpload({ createParentPath: true }), deleteProject)
// delete blogs
router.post('/blog-delete', fileUpload({ createParentPath: true }), deleteBlog)
router.post('/update-user-data',verifyLogin(),fileUpload({ createParentPath: true }),userProfileUpdateByAdmin)
router.post('/listLogs',fileUpload({ createParentPath: true }),listLogs)
router.post('/update-sponser-data/:id',verifyLogin([0,20]),fileUpload({ createParentPath: true }),SponserUpdateData)
router.post('/update-orginizer-data/:id',verifyLogin([0,30]),fileUpload({ createParentPath: true }),organizerUpdate)
router.post('/update-applicant-data/:id',verifyLogin([0,10]),fileUpload({ createParentPath: true }),applicantUpdate)
export default router