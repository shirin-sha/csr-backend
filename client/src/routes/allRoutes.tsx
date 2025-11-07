import React from "react";
import { Redirect } from "react-router-dom";

//Dashboard
import Dashboard from "../pages/Dashboard";
import Applicants from "../pages/Applicants";

//Authentication pages
import Login from "src/pages/Authentication/Login";
import Logout from "src/pages/Authentication/Logout";
import Register from "src/pages/Authentication/Register";
import ForgetPassword from "src/pages/Authentication/ForgetPassword";
import userProfile from "src/pages/Authentication/user-profile";
import Organizers from "src/pages/Organizers";
import Sponsors from "src/pages/Sponsors";
import ApplicantDetails from "src/pages/ApplicantDetails";
import OrganizerDetails from "src/pages/OrganizerDetails";
import SponsorDetails from "src/pages/SponsorDetails";
import Categories from "src/pages/BuisnessCategories";
import Projects from "src/pages/Projects";
import ProjectDetails from "src/pages/ProjectDetails";
import PriceMatix from "src/pages/PriceMatrix";
import PagesComingsoon from "src/pages/CommingSoon/PageComingsoon";
import AddAdmin from "src/pages/AddAdmin/AddAdmin";
import Inquiries from "src/pages/Inquiries";
import contactUs from "src/pages/contactUs";
import OurProject from "src/pages/OurProject";
import Blogs from "src/pages/Blogs";
import Faq from "src/pages/Faq";
import newsBlogs from "src/pages/NewsBlogs";
import Banners from "src/pages/Banners";
import ActivityLogs from "src/pages/ActivityLogs";
import AddUser from "src/pages/AddUser";







interface RouteProps {
  path: string;
  component: any;
  exact?: boolean;
}

const userRoutes: Array<RouteProps> = [
  //User Profile
  { path: "/profile", component: userProfile },

  //dashboard
  { path: "/dashboard", component: Dashboard },
  //{ path: "/applicants", component: Applicants },
  { path: "/applicants", component: Applicants },
  { path: "/organizers", component: Organizers },
  { path: "/sponsors", component: Sponsors },
  { path: "/applicant-details", component: ApplicantDetails },
  { path: "/organizer-details", component: OrganizerDetails },
  { path: "/sponsor-details", component: SponsorDetails },
  { path: "/categories", component: Categories },
  { path: "/projects", component: Projects },
  { path: "/project-details", component: ProjectDetails },
  { path: "/price-matrix", component: PriceMatix },
  { path: "/page-coming", component: PagesComingsoon },
  { path: "/add-admin", component: AddAdmin },
  { path: "/inquiries", component: Inquiries },
  { path: "/logs", component: ActivityLogs },
  { path: "/banners", component: Banners },
  { path: "/contact-us", component: contactUs },
  { path: "/our-project", component: OurProject },
  { path: "/blogs", component: Blogs },
  { path: "/faq", component: Faq },
  { path: "/news-blogs", component: newsBlogs },
  { path: "/add-user", component: AddUser },

  // this route should be at the end of all other routes
  { path: "/", exact: true, component: () => <Redirect to="/dashboard" /> },
];

const authRoutes: Array<RouteProps> = [
  //Authentication pages
  { path: "/login", component: Login },
  { path: "/logout", component: Logout },
  { path: "/register", component: Register },
  { path: "/recoverpw", component: ForgetPassword },
];

export { userRoutes, authRoutes };
