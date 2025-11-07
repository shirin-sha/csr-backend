import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import FileUpload from "src/components/FileExport/FileUpload/FileUpload";
import FileList from "src/components/FileExport/FileList/FileList";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi } from "src/common/axiosConfig";

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,

  CardImg,
  CardImgOverlay,
  CardSubtitle,
  CardText,
  CardTitle,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
// import { useHistory } from "react-router";
import { Link, useHistory } from "react-router-dom";
import Table from "src/components/Table";
import { useFormik } from "formik";
import axios from "axios";
import { submit } from "src/common/confirmPopup";
import login from "src/store/auth/login/reducer";
import Categories from "../BuisnessCategories";
import styles from "./adduser.module.css";
import { useForm, Controller } from "react-hook-form";
import SponsorRegister from "../../components/Sponsor/SponsorRegister";
import OrganizerRegister from "../../components/Organizer/OrganizerRegister"
import ApplicantRegister from "../../components/Applicant/ApplicantRegister"
import { ToastContainer, toast } from 'react-toastify';
function AddUser() {
  const history = useHistory();
  document.title = "Banners ";
  const [data, setData] = useState([]);
  const [openMOdal, setOpenModal] = useState(false);
const [applicant,setApplicant]=useState(true)
const [sponsor,setSponsor]=useState(false)
const [organizer,setOrganizer]=useState(false)
  const [alert, setAlert] = useState<any>();
const [category,setCategory]=useState([])
const [mail, setMail] = useState("");
  const [formData, setFormData] = useState<any>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    getValues,
    setValue,
    trigger,
    watch,
    reset,
    control,
  } = useForm();
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2, isSubmitted: isSubmitted2 },
    getValues: getValues2,
    trigger: trigger2,
    reset: reset2,
    control: control2,
  } = useForm();
  const {
    register: register3,
    handleSubmit: handleSubmit3,
    formState: { errors: errors3, isSubmitted: isSubmitted3 },
    getValues: getValues3,
    trigger: trigger3,
    reset: reset3,
    control: control3,
  } = useForm();
  const [individualType, setIndividualType] = useState(true); 
 
useEffect(()=>{
console.log("click");

  axiosApi("public/get-categories", {}).then((data:any)=>{
    console.log(data);
    setCategory(data?.data?.categories)
  })
},[])


// applicant

// coperate


  return (
    <div className="page-content">
      <div className="container-fluid">
        <ToastContainer/>
        <CardHeader>
          <Row>
            <CardTitle className="col-xl-10 mt-2">
              <h5>Register User</h5>
            </CardTitle>
          </Row>
        </CardHeader>

        <Row>
          <Card>
            <CardBody>
              <div className={styles.btns}>
                <Button onClick={()=>{setSponsor(false);setApplicant(true);setOrganizer(false)}}>Register Applicant</Button>
                <Button style={{ marginLeft: "10px", marginRight: "10px" }} onClick={()=>{setApplicant(false);setSponsor(true);setOrganizer(false)}}>
                  Register Sponser
                </Button>
                <Button
               onClick={()=>{setSponsor(false);setApplicant(false);setOrganizer(true)}}
                >
                  Register Event Organizer
                </Button>
              </div>
             {applicant && <ApplicantRegister/>
            
              }
              {sponsor && <SponsorRegister/>}
              {organizer && <OrganizerRegister/>}
             
            </CardBody>
          </Card>
        </Row>
      </div>
    </div>
  );
}
AddUser.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default AddUser;
