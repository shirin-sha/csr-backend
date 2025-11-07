//modules
import { Router, static as st } from "express";
import fileUpload from "express-fileupload";
import { any, string } from "joi";
import jwt from "jsonwebtoken";
//local modules
import {
  registration,
  login,
  activate_account,
  add_project,
  add_event,
  reset_password_email,
  reset_password,
  userProfile,
  userUpdate,
  sendActivateMail,
  getNotification,
  changePassword,
} from "../Helpers/applicant_helper";
import { secretKey } from "../config/variables";
import {
  acceptBid,
  acceptQueue,
  confirmBid,
  endSponsor,
  list_projects,
  project_details,
  removeBidByapplicant,
} from "../Helpers/project_helper";
// closeEvent;
import {
  closeEvent,
  event_details,
  listQuotation,
  list_events,
  viewCount,
} from "../Helpers/event_helper";
import path from "path";
import { startChat, getChatsData } from "../Helpers/chatHelper";
import { applicantSchema } from "../models/applicant";

//config
const router = Router();
router.use(
  "/project-details",
  st(path.join(__dirname, "../../images/thumbnails"))
);
router.use(
  "/event-details",
  st(path.join(__dirname, "../../images/thumbnails"))
);
router.use(
  "/list-projects",
  st(path.join(__dirname, "../../images/thumbnails"))
);
router.use("/list-events", st(path.join(__dirname, "../../images/thumbnails")));
router.use("/profile", st(path.join(__dirname, "../../images/thumbnails")));
router.use("/update-data", st(path.join(__dirname, "../../images/thumbnails")));

// apis
const verifyLogin = (req, res, next) => {
  const token = req.headers.token;
  console.log("tk", token);
  jwt.verify(token, secretKey, async (err, value) => {
    if (err) {
      console.log(err.message);
      res.status(401).send("Authorization error");
    } else {
      console.log("value", value);
      req.user_id = value.data.id;
      req.role = value.data.role;
      console.log("role :", value.data.role);

      // check the user is blocked by the admin

      // get user data from database
      const userId: string = value.data.id;
      const userData: any = await applicantSchema
        .findOne({ _id: userId })
        .select("blocked")
        .lean();
      console.log("user data for block", { userData });

      if (userData?.blocked) {
        console.log("account is blocked");
        res.status(401).send("Account is blocked by admin");
      } else {
        next();
      }
    }
  });
};
//--- registration

router.post(
  "/register",
  fileUpload({ createParentPath: true }),
  async (req, res) => {
    /* 
        #swagger.parameters['']= { type:'number',} 
        #swagger.parameters['company_name']= {type:'string'}
         #swagger.parameters['address']= { type:'string',} 
        #swagger.parameters['email']= { type:'string'}
         #swagger.parameters['password']= { type:'string',} 
        #swagger.parameters['re_password']= { type:'string'}
         #swagger.parameters['mobile']= { type:'number',} 
        #swagger.parameters['contact_person_name']= { type:'string'}
         #swagger.parameters['first_name']= { type:'string',} 
        #swagger.parameters['last_name']= { type:'string'}
         #swagger.parameters['gender']= { type:'string',} 
        #swagger.parameters['dob']= {type:'date'}
        #swagger.parameters['documents']= { type:'string'}

    */
    const data: any = req.body;
    console.log("data got at server", data);

    //check applicant individual or corperate
    const isIndividual: boolean = Number(data.type) === 0 ? true : false;
    console.log("is individual:  ,", isIndividual);

    try {
      const file =
        (req as any).files?.documents && (req as any).files.documents;
      console.log("files :", req.files);

      registration(data, isIndividual, file)
        .then((response) => {
          //provide activating link--x

          res.status(200).json(response);
        })
        .catch((err) => {
          res.status(200).json(err);
        });
    } catch (error) {
      console.log("error from route:", error);
      res.status(200).json({
        success: false,
        message: error,
      });
    }
  }
);

//---login

router.post(
  "/login",
  fileUpload({ createParentPath: true }),
  async (req, res) => {
    /* 
           #swagger.parameters['email']= { type:'string'}
            #swagger.parameters['password']= { type:'string',} 
   
       */
    const data: any = req.body;

    login(data)
      .then((resp) => {
        console.log("response from function");

        console.log("after funcionality response", resp);

        if ((resp as any).success == true) {
          res
            .status(200)
            .header({
              token: (resp as any).token,
              "Access-Control-Expose-Headers": "token",
            })
            .json({
              data: (resp as any).user,
              success: true,
              message: "login successful",
            });
        } else {
          res.status(200).json(resp);
        }
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }
);

//  send reset password link in email

router.post(
  "/reset-password-email",
  fileUpload({ createParentPath: true }),
  (req, res) => {
    let email = req.body.email;
    console.log(email);
    // check data
    if (!email || email == undefined) {
      res.json({ success: false, message: "email is empty" });
    }
    reset_password_email(email)
      .then((result: any) => {
        if (result.success === false) {
          res.status(200).json(result);
        } else {
          res.status(200).json(result);
        }
      })
      .catch((err) => {
        res.status(200).json(err);
      });
  }
);

// reset password
router.post(
  "/reset-password",
  fileUpload({ createParentPath: true }),
  (req, res) => {
    /*
    #swagger.parameters['password']= { type:'string'}
    #swagger.parameters['token']= { type:'string'}
    #swagger.parameters['re_password']= { type:'string'}


     */
    const data = req.body;
    console.log({ data });

    if (!data || data === undefined || data === null) {
      res.status(200).json({
        success: false,
        message: "password not found",
      });
    }
    reset_password(data)
      .then((resp: any) => {
        if (resp.success === false) {
          console.log("password not found");

          res.status(200).json(resp);
        } else {
          res.status(200).json(resp);
        }
      })
      .catch((error) => {
        res.status(200).json(error);
      });
  }
);

//--activate account

router.post("/activate-account", (req, res) => {
  const token = req.body.token;
  console.log(token);

  activate_account(token)
    .then((resp: any) => {
      res.status(200).json(resp);
    })
    .catch((err) => {
      res.status(200).json(err);
    });
});

// add project
router.post(
  "/add-project",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  (req, res) => {
    /*
    #swagger.parameters['project_name']= { type:'string'}
    #swagger.parameters['project_name_ar']= { type:'string'}
    #swagger.parameters['category']= { type:'string'}
    #swagger.parameters['budget']= { type:'number'}
    #swagger.parameters['fees']= { type:'number'}
    #swagger.parameters['documents']= { }
    */
    const data = req.body;
    console.log("form data :", data);
    const files = (req as any).files?.documents && (req as any).files.documents;
    const img = (req as any).files?.img;
    // check body
    if (!data || data === null || data === undefined) {
      res.status(200).json({
        success: false,
        message: "data not found",
      });
    } else {
      console.log("user id :", (req as any).user_id);
      const user_id = (req as any).user_id;
      //add project function
      add_project(data, files, user_id, img)
        .then(async (resp) => {
          res.status(200).json(resp);
        })
        .catch((err) => {
          res.status(200).json(err);
        });
    }
  }
);

//add event

router.post(
  "/add-event",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  (req, res) => {
    /* #swagger.parameters['documents']= { }*/

    const form_data = req.body;
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
      category: form_data.category,
    };

    console.log("form data :", data);
    const files = (req as any).files?.documents && (req as any).files.documents;
    const img = (req as any).files?.img;
    console.log("eventimg", img);
    // check body
    if (!data || data === null || data === undefined) {
      res.status(200).json({
        success: false,
        message: "data not found",
      });
    }
    console.log("user id :", (req as any).user_id);
    const user_id = (req as any).user_id;
    add_event(data, files, user_id, img)
      .then((resp) => {
        res.status(200).json(resp);
      })
      .catch((err) => {
        res.status(200).json(err);
      });
  }
);

// project_listing

router.post(
  "/list-projects",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  (req: any, res: any) => {
    /*
        #swagger.parameters['limit']= { type:'string'}
        #swagger.parameters['page']= { type:'string'}
       
        */
    const user = req.user_id;
    console.log({ user });
    if (!user) {
      res.status(200).json({
        success: false,
        message: "Account not found",
      });
    }
    const data = req.body;
    const queryData = {
      limit: data.limit,
      page: data.page,
      condition: { added_applicant: user },
    };
    console.log(data);
    if (data.limit < 1 || data.page < 1) {
      res.status(200).json({
        success: false,
        message: "input error",
      });
    } else {
      // list projects function
      list_projects(queryData)
        .then((resp: any) => {
          console.log("listprojects :", resp);
          if (resp.success === false) {
            res.status(200).json(resp);
          } else {
            res.status(200).json({
              success: true,
              message: "data are collected",
              data: resp,
            });
          }
        })
        .catch((err) => {
          res.status(200).json(err);
        });
    }
  }
);

// find project by Id
router.post(
  "/project-details",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  (req, res) => {
    const id = req.body.id;
    console.log("id", id);

    project_details(id, false)
      .then((resp: any) => {
        if (resp.success === false) {
          res.status(200).json(resp);
        } else {
          return res.status(200).json(resp);
        }
      })
      .catch((err) => {
        return res.status(200).json(err);
      });
  }
);

// listing events
router.post(
  "/list-events",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  (req: any, res) => {
    const data = req.body;
    const user = req.user_id;
    console.log({ user });
    if (!user) {
      res.status(200).json({
        success: false,
        message: "Account not found",
      });
    }
    const queryData = {
      limit: data.limit,
      page: data.page,
      condition: { added_applicant: user },
    };
    if (data.limit < 1 || data.page < 1) {
      res.status(200).json({
        success: false,
        message: "input error",
      });
    } else {
      // list event function
      list_events(queryData)
        .then((resp: any) => {
          console.log("events :", resp);
          if (resp.success === false) {
            res.status(200).json(resp);
          } else {
            res.status(200).json({
              success: true,
              message: "data are collected",
              data: resp,
            });
          }
        })
        .catch((err) => {
          res.status(200).json(err);
        });
    }
  }
);

// find event by Id
router.post(
  "/event-details",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  (req, res) => {
    const id = req.body.id;
    console.log("id", id);

    event_details(id)
      .then((resp: any) => {
        if (resp.success === false) {
          res.status(200).json(resp);
        } else {
          return res.status(200).json(resp);
        }
      })
      .catch((err) => {
        return res.status(200).json(err);
      });
  }
);

router.post(
  "/document-view",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  (req, res) => {
    const data = req.body;
    console.log({ data });

    console.log(path.join(__dirname, "../../"));

    const file = path.join(__dirname, "../../uploads/" + data.file);
    res.sendFile(file, (err, resp) => {
      if (err) {
        console.log({ err });
        res.status(200).json({ message: "file not found" });
      } else {
        console.log({ resp });
      }
    });
  }
);

router.post(
  "/list-quotation",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  listQuotation
);

router.post(
  "/accept-bid",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  acceptBid
);
router.post(
  "/remove-sponsorship",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  removeBidByapplicant
);

router.post(
  "/send-activateLink",
  fileUpload({ createParentPath: true }),
  (req: any, res) => {
    const data = req.body;
    console.log(data.role, data.id);

    if (!data || data == null || data === undefined) {
      res.status(200).json({
        success: false,
        message: "invalid request",
      });
    }
    console.log("data", { data });

    sendActivateMail(data)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        res.status(200).json(error);
      });
  }
);

router.post("/profile", verifyLogin, userProfile);
router.post(
  "/update-data",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  userUpdate
);
router.post(
  "/accept-queue",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  acceptQueue
);
router.post(
  "/getNotify",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  getNotification
);
router.post(
  "/fetChatData",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  getChatsData
);
router.post(
  "/endSponsor",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  endSponsor
);
router.post(
  "/startChat",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  startChat
);
router.post(
  "/change-password",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  changePassword
);
router.post(
  "/closeEvent",
  verifyLogin,
  fileUpload({ createParentPath: true }),
  closeEvent
);

//---------
export default router;
