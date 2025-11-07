/* eslint-disable react/react-in-jsx-scope */

import { useForm,Controller } from "react-hook-form";
import { ButtonToggle } from "reactstrap";
import checkMarkImg from "../../images/checkMark.png";
import { useState,useEffect } from "react";
import FileUpload from "../../components/FileExport/FileUpload/FileUpload";
import FileList from "../../components/FileExport/FileList/FileList";
import { axiosApi } from "../../../src/common/axiosConfig"
import styles from "./sponsorRegister.module.css"
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

const sponsorRegister = () => {
  const [checkMark2, setCheckMark2] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileAlreadyExist, setFileAlreadyExist] = useState(false);
  const [fileNameAlreadyExist, setFileNameAlradyExist] = useState([]);
  const [category,setCategory]=useState([])
	const[error,setError]=useState(null)
const [phonenumber,setPhoneNumber]=useState()
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2, isSubmitted: isSubmitted2 },
    getValues: getValues2,
    trigger: trigger2,reset,control,
  } = useForm();
 
 
 
 
  const removeFile = (filename:any) => {
    setFiles((prev) => {
      return prev.filter((fl:any) => {
        return fl.name !== filename;
      });
    });
  };
  console.log("phonenumber",phonenumber);
  const uploadHandler = (event:any) => {
    setFileNameAlradyExist([]);
    const file = Array.from(event.target.files);
  
    if (!file) return;
    // check if file already exist
    const alreadyIncludedFileNames = files.map((fls:any) => {
      return fls.name;
    });
    file.map((fl:any) => {
      if (alreadyIncludedFileNames.includes(fl.name)) {
        setFileNameAlradyExist((prev:any[]) => {
          return [...prev, fl.name] as any;
        });
        setFileAlreadyExist(true);
      } else {
        setFiles((prev:any[]) => {
          return [...prev, fl] as any;
        });
      }
    });
    console.log("file got");
  };
  
  const toggleCheck2 = () => {
    setCheckMark2((prev) => {
      return !prev;
    });
  };
  const [errorStatus, setErrorStatus] = useState(false);
  const [activationStatus, setActivationStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
 
  useEffect(()=>{
    console.log("click");
    
      axiosApi("public/get-categories", {}).then((data:any)=>{
        console.log(data);
        setCategory(data?.data?.categories)
      })
    },[])
  const CoperateErrors = () => {
    const errorTxt = [];
    if (!checkMark2 && isSubmitted2) {
      errorTxt.push("Please accept terms & conditions");
    }
    
    // if (errors2.company_name?.type === 'required' || errors2.address?.type === 'required' || errors2.mobile?.type === 'required' || errors2.email?.type === 'required' || errors2.documents?.type === 'required' || errors2.password?.type === 'required' || errors2.contact_person_name?.type === 'required' || errors2.re_password?.type === 'required') {
    // 	errorTxt.push('All fields are required')
    // }
    // if (errors2.email?.type === 'pattern') {
    // 	errorTxt.push('Email is incorrect')
    // }
    // if (errors2.mobile?.type === 'pattern') {
    // 	errorTxt.push('Phone number is incorrect')
    // }
    // if (getValues2('password') !== getValues2('re_password')) {
    // 	errorTxt.push('Passwords do not match')
    // }
    return errorTxt;
  };
  const [mail, setMail] = useState("");

  const corporateFormSubmit = async (values:any) => {
    console.log({ values });
    const contactMail = getValues2("email");
    console.log("contactMail", contactMail);
    setMail(contactMail);
    console.log("mail", mail);
    const coporateData = new FormData();
    console.log({ files });

    coporateData.append("company_name", values.company_name);
    coporateData.append("contact_person_name", values.contact_person_name);
    coporateData.append("email", values.email);
    coporateData.append("address", values.address);
    coporateData.append("mobile", values.mobile);
    coporateData.append("password", values.password);
    coporateData.append("re_password", values.re_password);
    coporateData.append("interested_categories", values.category);


    files.forEach((docs) => {
      console.log({ docs });
      coporateData.append("documents", docs);
    });
    axios.post("/sponsor/register", coporateData).then((data)=>{
    console.log(data);
    if(data?.data?.success){
      toast.success("successfully updated")
      reset();
    }
    else{
      toast.error(data?.data?.message)
    }
  })
  
  };
  // instead of react forms, should be changed
  return (
    <div>
    
        <div className={styles.section2}>
        <ToastContainer/>
          <div className={styles.hybridForm}>

            <h4 className={styles.formTitle}>Register As Sponsor</h4>


            <div className={styles.corporateForm}>
              <form
                name="corportateFormEntry"
                className={styles.corportateFormEntry}
                onSubmit={handleSubmit2(corporateFormSubmit)}
              >
                <div className={styles.formContent2}>
                  <div className={styles.mainflex}>
                    <div className={styles.companySec}>

                      <div className={styles.textandlabel}>

                        <div className={styles.companySecValidate}>
                          <span  className={styles.textspan}>
                            Company Name
                          </span>
                          <input
                            type="text"
                            className={styles.companytext}
                          
                            {...register2("company_name", { required: true,minLength:3 })}
                            onKeyUp={() => {
                              trigger2("company_name");
                            }}
                          />
                          {errors2.company_name && errors2.company_name.type==='required' && (
                            <small className={styles.errorMessage}>
                              Name is Required
                            </small>
                          )}
                          {errors2.company_name && errors2.company_name.type==='minLength' && (
                            <small className={styles.errorMessage}>
                              You must provide at least 3 characters
                            </small>
                          )}
                        </div>
                      </div>
                      <div className={styles.textandlabel}>

                        <div className={styles.companySecValidate}>
                          <span className={styles.textspan}>
                            Address
                          </span>
                          <input
                            className={styles.companytext}
                         
                            {...register2("address", { required: true })}
                            onKeyUp={() => {
                              trigger2("address");
                            }}
                          />
                          {errors2.address && (
                            <small className={styles.errorMessage}>
                              Address is Required
                            </small>
                          )}
                        </div>
                      </div>
                      <div className={styles.textandlabel}>

                        <div className={styles.companySecValidate}>
                          <span  className={styles.textspan}>
                            Category
                          </span>
                          <select
                            className={styles.inputtext}
                          
                          
                            {...register2("category", { required: true })}
                            onKeyUp={() => {
                              trigger2("category");
                            }}
                          >
                            <option value={''} selected disabled hidden>Select Category</option>
                            {
                              category?.map((cat:any) => {
                                
                                return (<option key={cat._id} value={cat._id}>{cat.name}</option>)

                              })
                            }
                          </select>
                          {errors2.category && (
                            <small className={styles.errorMessage}>
                              Select Category
                            </small>
                          )}
                        </div>
                      </div>
                      <div className={styles.textandlabel}>

                        <div className={styles.companySecValidate}>
                          <span className={styles.textspan}>
                            Document
                          </span>
                          <div className={styles.fileSelection}>
                            <FileUpload
                              files={files}
                              setFiles={setFiles}
                              removeFile={removeFile}
                              uploadHandler={uploadHandler}
                            />
                            <FileList
                              files={files}
                              removeFile={removeFile}
                              {...register2("file")}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <h5 style={{'alignSelf':'start','marginTop':'10px',marginBottom:'10px',paddingLeft:"10px"}}>Contact Person</h5>

                    <div className={styles.companySec}>

                      <div className={styles.textandlabel}>
                        <div className={styles.companySecValidate}>
                          <span  className={styles.textspan}>
                            Name
                          </span>
                          <input
                            type="text"
                            className={styles.companytext}

                        
                            {...register2("contact_person_name", {
                              required: true,minLength:3
                            })}
                            onKeyUp={() => {
                              trigger2("contact_person_name");
                            }}
                          />
                          {errors2.contact_person_name && errors2.contact_person_name.type==='required' && (
                            <small className={styles.errorMessage}>
                              Name is Required
                            </small>
                          )}
                           {errors2.contact_person_name && errors2.contact_person_name.type==='minLength' && (
                            <small className={styles.errorMessage}>
                              You must provide at least 3 characters
                            </small>
                          )}
                        </div>
                      </div>

                      <div className={styles.textandlabel}>
                        <div className={styles.companySecValidate}>
                          <span className={styles.textspan}>
                            Email
                          </span>
                          <input
                            type="text"

                            className={styles.companytext}
                   
                            {...register2("email", {
                              required: true,
                              pattern:
                                /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                            })}
                            onKeyUp={() => {
                              trigger2("email");
                            }}
                          />
                          {errors2.email && (
                            <small className={styles.errorMessage}>
                              Email Required
                            </small>
                          )}
                        </div>
                      </div>
                      <div className={styles.textandlabel}>
                        <div className={styles.companySecValidate}>
                          <span className={styles.textspan}>
                          Phone Number
                          </span>
                          <input
                            type="text"

                            className={styles.companytext}
                   
                            {...register2("mobile", {
                              required: true,
                            
                            })}
                            onKeyUp={() => {
                              trigger2("mobile");
                            }}
                          />
                          {errors2.mobile && (
                            <small className={styles.errorMessage}>
                              Phone Number Required
                            </small>
                          )}
                        </div>
                      </div>

                     
                      <div className={styles.companySec}>
                        <div className={styles.textandlabel}>
                        <div className={styles.companySecValidate}>
                          <label className={styles.textspan}>Password</label>
                          <input
                            type="password"
                            className={styles.companytext}

                        
                            {...register2("password", { required: true ,minLength:6 })}
                            onKeyUp={() => {
                              trigger2("password");
                            }}
                          />
                          {errors2.password && errors2.password.type ==='required'&&(
                            <small className={styles.errorMessage}>
                              Password Required
                            </small>
                          )}
                          {errors2.password && errors2.password.type==='minLength' && (
                            <small className={styles.errorMessage}>
                               length  must atleast 6 charactor
                            </small>
                          )}
                        </div>
                        </div>

                        <div className={styles.textandlabel}>
                        <div className={styles.companySecValidate}>
                          <label className={styles.textspan} style={{width:"60%"}}>Confirm Password</label>
                          <input
                            type="password"
                            className={styles.companytext}

                         
                            {...register2("re_password", { required: true })}
                            onKeyUp={() => {
                              trigger2("re_password");
                            }}
                          />
                          {getValues2("re_password")&& getValues2("password") !==
                            getValues2("re_password") && (
                              <small className={styles.errorMessage}>
                                Password Not Match
                              </small>
                            )}
                        </div>
                        </div>

                      </div>

                    </div>
                  </div>
                  {/* dsfdgf */}
                  {/* <div>

											</div> */}
                </div>
             
                
                <input
                  type="submit"
                  className={styles.payAndPublish}
                  value="Register"
                />
{ <div className={styles.errorMessageSubmit}> <span>{error}</span></div>}
               
              </form>
            </div>
          </div>
        </div>
     


     
    </div>
  );
};
export default sponsorRegister;

