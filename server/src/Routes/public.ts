import { Router, static as st } from "express";
import fileUpload from "express-fileupload"
import path from "path";
import { getBlogs, getContactInfo, getOurProject } from "../Helpers/admin_helper";
import { get_categories } from "../Helpers/common_helper";
import { getFaq, postInquiry, postQuestion, viewBlogs } from "../Helpers/public_helper";
import { bannerSchema } from "../models/banner";


//config
const router = Router()

router.use(
    "/get-ourProject",
    st(path.join(__dirname, '../../images/thumbnails')));
router.use(
    "/get-blogs",
    st(path.join(__dirname, '../../images/thumbnails')));
router.use(
    "/get-faq",
    st(path.join(__dirname, '../../images/thumbnails')));
router.use(
    "/view-blogs",
    st(path.join(__dirname, '../../images')));
// contact us page
router.post('/post-inquiry', fileUpload({ createParentPath: true }), postInquiry)
router.post('/get-contactInfo', fileUpload({ createParentPath: true }), getContactInfo)

// faq page
router.post('/post-question', fileUpload({ createParentPath: true }), postQuestion)
router.post('/get-faq', fileUpload({ createParentPath: true }), getFaq)

//get categories
router.post('/get-categories', fileUpload({ createParentPath: true }), (req, res) => {


    get_categories().then((resp: any) => {
        if (resp.success === false) {
            res.status(200).json(resp.message)
        } else {
            res.status(200).json(resp)
        }
    })
})
router.post('/listBanners', async (req, res) => {
    try {
        const response = await bannerSchema.find().sort({ _id: -1 }).lean();

        if (response.length === 0) {
            throw new Error("Banners are not found");
        }

        res.status(200).json({
            success: true,
            msg: "Banners are fetched successfully",
            banners: response
        });
    } catch (error:any) {
        res.status(500).json({
            success: false,
            msg: error.message || error
        });
    }
});
// our project
// get our project
router.post('/get-ourProject', fileUpload({ createParentPath: true }), getOurProject)

// get blogs
router.post('/get-blogs', fileUpload({ createParentPath: true }), getBlogs)

router.post('/view-blogs', fileUpload({ createParentPath: true }), viewBlogs)

export default router