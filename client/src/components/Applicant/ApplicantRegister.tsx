/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable react/react-in-jsx-scope */
import { useState, useRef } from "react";



import { useForm ,Controller} from "react-hook-form";
import checkMarkImg from "../../images/checkMark.png";

import FileUpload from "../../components/FileExport/FileUpload/FileUpload";
import FileList from "../../components/FileExport/FileList/FileList";
import styles from "./applicationregister.module.css";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

const RegisterPage = () => {
  const [individualType, setIndividualType] = useState(true); //	true - individual, false - corporate
  const [checkMark1, setCheckMark1] = useState(false);
  const [checkMark2, setCheckMark2] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileAlreadyExist, setFileAlreadyExist] = useState(false);
  const [fileNameAlreadyExist, setFileNameAlradyExist] = useState([]);
  const [error, setError] = useState(null);

  // const [gg,dd]=useDataQuery({key:'/applicant/register'})
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    getValues,
    trigger,
    watch,
    reset,
	control,
  } = useForm();
  const password = useRef({});
  password.current = watch("password", "");
  console.log(password.current);
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2, isSubmitted: isSubmitted2 },
    getValues: getValues2,
    trigger: trigger2,
    reset: reset2,
	control:control2,
  } = useForm();
  const removeFile = (filename:any) => {
    setFiles((prev) => {
      return prev.filter((fl:any) => {
        return fl.name !== filename;
      });
    });
  };
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
  }
  const toggleCheck1 = () => {
    setCheckMark1((prev) => {
      return !prev;
    });
  };
  const toggleCheck2 = () => {
    setCheckMark2((prev) => {
      return !prev;
    });
  };
  const [errorStatus, setErrorStatus] = useState(false);
  const [activationStatus, setActivationStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
 
  const printErrors = () => {
    const errorTxt = [];
    // 	//	checkmark validation
    if (!checkMark1 && isSubmitted) {
      errorTxt.push("Please accept terms & conditions");
    }

    return errorTxt;
  };
  const CoperateErrors = () => {
    const errorTxt = [];
    if (!checkMark2 && isSubmitted2) {
      errorTxt.push("Please accept terms & conditions");
    }

    return errorTxt;
  };
  const [mail, setMail] = useState("");
  const [mobile, setMobile] = useState("");
 
 
  const individualFormSubmit = async (values:any) => {
    console.log("values", values);
    const individualData = new FormData();
    individualData.append("first_name", values.first_name);
    individualData.append("last_name", values.last_name);
    individualData.append("email", values.email);
    individualData.append("mobile", values.mobile);
    individualData.append("password", values.password);
    individualData.append("re_password", values.re_password);
    individualData.append("dob", values.dob);
    individualData.append("gender", values.gender);
    individualData.append("type", "0");
    const re_password = getValues("re_password").length;
    console.log("re_passwordddddddd", re_password);
    // console.log("passswordddddddd",getValue('re_password'));
   
   
      const individualmail = getValues("email");
     
      setMail(individualmail);
      setMobile(getValues("mobile"));
      axios.post("/applicant/register", individualData).then((data)=>{
        console.log(data);
        if(data?.data?.success){
          toast.success("successfully Registered")
          reset();
        }
        else{
          toast.error(data?.data?.message)
        }
      })

      };
  const corporateFormSubmit = async (values:any) => {
    console.log(values);
    const contactMail = getValues2("email");
    console.log("contactMail", contactMail);
    setMail(contactMail);
    setMobile(getValues2("mobile"));
    console.log(mobile);
    console.log("mail", mail);
    const coporateData = new FormData();
    coporateData.append("type", "1");
    coporateData.append("company_name", values.company_name);
    coporateData.append("contact_person_name", values.contact_person_name);
    coporateData.append("email", values.email);
    coporateData.append("address", values.address);
    coporateData.append("mobile", values.mobile);
    coporateData.append("password", values.password);
    coporateData.append("re_password", values.re_password);
    files.forEach((docs) => {
      console.log({ docs });
      coporateData.append("documents", docs);
    });
  
    axios.post("/applicant/register", coporateData).then((data)=>{
      console.log(data);
      if(data?.data?.success){
        toast.success("successfully Registered")
        reset();
        setFiles([])
      }
      else{
        toast.error(data?.data?.message)
      }
    })
  };
  
  return (
    <div>
     
        <div className={styles.section2}>
          <ToastContainer/>
          <div className={styles.hybridForm}>
            <h5 className={styles.formHeading}>Register As Applicant </h5>
            <div className={styles.tabType}>
              <div
                className={styles.tabTypeIndividual}
                style={{
                  backgroundColor: individualType ? "#9E8959" : "#D9D9D9",
                  color: individualType ? "#fff" : "#000",
                }}
                onClick={() => {
                  reset();
                  setError(null);
                  setIndividualType(true);
                }}
                onKeyDown={() => {
                  setIndividualType(true);
                }}
                tabIndex={0}
                role="button"
              >
                Individual
              </div>
              <div
                className={styles.tabTypeCorporate}
                style={{
                  backgroundColor: !individualType ? "#9E8959" : "#D9D9D9",
                  color: !individualType ? "#fff" : "#000",
                }}
                onClick={() => {
                  reset();
                  setError(null);
                  setIndividualType(false);
                }}
                onKeyDown={() => {
                  setIndividualType(false);
                }}
                tabIndex={0}
                role="button"
              >
                Corporate
              </div>
            </div>
            {individualType && (
              <div className={styles.individualForm}>
                <form
                  name="individualFormEntry"
                  className={styles.individualFormEntry}
                  onSubmit={handleSubmit(individualFormSubmit)}
                >
                  <div className={styles.formContent1}>
                    <div className={styles.formContentFlex1}>
                      <div className={styles.formContentWrapDiv1}>
                        <span>First Name</span>
                        <div className={styles.validateMessage}>
                          <input
                            type="text"
                            id="first_name"
                            {...register("first_name", {
                              required: true,
                              minLength: 3,
                            })}
                            onKeyUp={() => {
                              trigger("first_name");
                            }}
                          />
                          {errors.first_name &&
                            errors.first_name.type === "required" && (
                              <small className={styles.errorMessage}>
                                Name is Required
                              </small>
                            )}
                          {errors.first_name &&
                            errors.first_name.type === "minLength" && (
                              <small className={styles.errorMessage}>
                                You must provide at least 3 characters
                              </small>
                            )}
                        </div>
                      </div>
                      <div className={styles.formContentWrapDiv2}>
                        <span>Last Name</span>
                        <div className={styles.validateMessage}>
                          <input
                            type="text"
                            
                            {...register("last_name", { required: true })}
                            onKeyUp={() => {
                              trigger("last_name");
                            }}
                          />
                          {errors.last_name && (
                            <small className={styles.errorMessage}>
                              LastName is Required
                            </small>
                          )}
                        </div>
                      </div>
                      <div className={styles.formContentWrapDiv1}>
                        <span >Email</span>
                        <div className={styles.validateMessage}>
                          <input
                            type="email"
                            
                            {...register("email", {
                              required: true,
                              pattern:
                                /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                            })}
                            onKeyUp={() => {
                              trigger("email");
                            }}
                          />
                          {errors.email && (
                            <small className={styles.errorMessage}>
                              Invalid Email
                            </small>
                          )}
                        </div>
                      </div>
                      <div className={styles.formContentWrapDiv2}>
                        <span>Mobile</span>
                        <div className={styles.validateMessage}>
                        <input type="mobile" {...register("mobile", { required: true })} onKeyUp={() => { trigger('mobile') }} />
													
                            {/* khjk */}
                        
                        
						                 {errors.mobile && (
                              <small className={styles.errorMessage}>
                             Mobile number is required
                            </small>
                          )}

                          
                        </div>
                      </div>
                      <div className={styles.formContentWrapDiv1}>
                        <span >Password</span>
                        <div className={styles.validateMessage}>
                          <input
                            type="password"
                            
                            {...register("password", {
                              required: true,
                              minLength: 6,
                            })}
                            onKeyUp={() => {
                              trigger("password");
                            }}
                          />

                          {errors.password &&
                            errors.password.type === "required" && (
                              <small className={styles.errorMessage}>
                                Enter Password
                              </small>
                            )}
                          {errors.password &&
                            errors.password.type === "minLength" && (
                              <small className={styles.errorMessage}>
                                length must atleast 6 charactor
                              </small>
                            )}
                        </div>
                      </div>
                      <div className={styles.formContentWrapDiv2}>
                        <span>Confirm Password</span>
                        <div className={styles.validateMessage}>
                          <input
                            type="password"
                            
                            {...register(
                              "re_password",
                              { required: true }
                              //   { validate:(value)=>{ return (value===password.current?true:false)} }
                            )}
                            onKeyUp={() => {
                              trigger("re_password");
                            }}
                          />
                          {getValues("re_password") &&
                            getValues("password") !==
                              getValues("re_password") && (
                              <small className={styles.errorMessage}>
                                Password Not Match
                              </small>
                            )}
                        </div>
                      </div>
                      <div className={styles.formContentWrapDiv2}>
                        <span>Date Of Birth</span>
                        <div className={styles.validateMessage}>
                          <input
                            className={styles.dob}
                            type="date"
                            
                            {...register("dob")}
                            onKeyUp={() => {
                              trigger("dob");
                            }}
                          />
                         
                        </div>
                      </div>
                      <div className={styles.formContentWrapDiv1}>
                        <span>Gender</span>
                        <div className={styles.validateMessage}>
                          <select
                            className={styles.selector}
                            
                            {...register("gender")}
                            onKeyUp={() => {
                              trigger("gender");
                            }}
                          >
                            <option value="" disabled selected>
                              Select Gender
                            </option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                         
                        </div>
                      </div>
                    </div>
                  </div>
                  
                 
                  <input
                    type="submit"
                    className={styles.payAndPublish}
                    value="Register"
                  />
                 

                
                </form>
              </div>
            )}
            {!individualType && (
              <div className={styles.corporateForm}>
                
                <form
                  name="corportateFormEntry"
                  className={styles.corportateFormEntry}
                  onSubmit={handleSubmit2(corporateFormSubmit)}
                >
                  <div className={styles.formContent2}>
                    {/* <div className={styles.contactmain}>
													<div></div>
													<div className={styles.contactpersontitle}><p>Contact Person</p></div>
													</div> */}
                    <div className={styles.mainflex}>
                      <div className={styles.companySec}>
                        <div className={styles.textandlabel}>
                          <div className={styles.companySecValidate}>
                            <span
                              
                              className={styles.textspan}
                            >
                              Company Name
                            </span>
                            <input
                              type="text"
                              className={styles.companytext}
                              
                              {...register2("company_name", {
                                required: true,
                                minLength: 3,
                              })}
                              onKeyUp={() => {
                                trigger2("company_name");
                              }}
                            />
                            {errors2.company_name &&
                              errors2.company_name.type === "required" && (
                                <small className={styles.errorMessage}>
                                  Name is Required
                                </small>
                              )}
                            {errors2.company_name &&
                              errors2.company_name.type === "minLength" && (
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
                              
                              {...register2("address", {
                                required: true,
                                minLength: 5,
                              })}
                              onKeyUp={() => {
                                trigger2("address");
                              }}
                            />
                            {errors2.address &&
                              errors2.address.type === "required" && (
                                <small className={styles.errorMessage}>
                                  Address is Required
                                </small>
                              )}
                            {errors2.address &&
                              errors2.address.type === "minLength" && (
                                <small className={styles.errorMessage}>
                                  You must provide at least 5 characters
                                </small>
                              )}
                          </div>
                        </div>
                        <div className={styles.textandlabel}>
                          <div className={styles.companySecValidate}>
                            <span
                              
                              className={styles.textspan}
                            >
                              Password
                            </span>

                            <input
                              type="password"
                              className={styles.companytext}
                              
                              {...register2("password", {
                                required: true,
                                minLength: 6,
                              })}
                              onKeyUp={() => {
                                trigger2("password");
                              }}
                            />
                            {errors2.password &&
                              errors2.password.type === "required" && (
                                <small className={styles.errorMessage}>
                                  Password Required
                                </small>
                              )}
                            {errors2.password &&
                              errors2.password.type === "minLength" && (
                                <small className={styles.errorMessage}>
                                  length must atleast 6 charactor
                                </small>
                              )}
                          </div>
                        </div>
                        <div className={styles.textandlabel}>
                          <div className={styles.companySecValidate}>
                            <span
                              
                              className={styles.textspan}
                            >
                              Confirm Password
                            </span>

                            <input
                              type="password"
                              className={styles.companytext}
                              
                              {...register2("re_password", { required: true })}
                              onKeyUp={() => {
                                trigger2("re_password");
                              }}
                            />
                            {getValues2("re_password") &&
                              getValues2("password") !==
                                getValues2("re_password") && (
                                <small className={styles.errorMessage}>
                                  Password Not Match
                                </small>
                              )}
                          </div>
                        </div>
                        <div className={styles.textandlabel}>
                          <span  className={styles.textspan}>
                            Document
                          </span>
                          <div className={styles.companySecValidate}>
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
                          </div>{" "}
                        </div>
                      </div>
                      <h5
                        style={{
                          alignSelf: "start",
                          marginTop: "10px",
                          marginBottom: "10px",
                        }}
                        className={styles.contactPerson}
                      >
                        Contact Person
                      </h5>

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
                                required: true,
                                minLength: 3,
                              })}
                              onKeyUp={() => {
                                trigger2("contact_person_name");
                              }}
                            />
                            {errors2.contact_person_name &&
                              errors2.contact_person_name.type ===
                                "required" && (
                                <small className={styles.errorMessage}>
                                  Name is Required
                                </small>
                              )}
                            {errors2.contact_person_name &&
                              errors2.contact_person_name.type ===
                                "minLength" && (
                                <small className={styles.errorMessage}>
                                  You must provide at least 3 characters
                                </small>
                              )}
                          </div>
                        </div>
                        <div className={styles.textandlabel}>
                          <div className={styles.companySecValidate}>
                            <span  className={styles.textspan}>
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
                            <span  className={styles.textspan}>
                              Phone Number
                            </span>
                            <input type="mobile" className={styles.companytext} {...register("mobile", { required: true })} onKeyUp={() => { trigger2('mobile') }} />
													
							
{errors2.mobile && (
								<small className={styles.errorMessage}>
								Mobile number is required
								</small>
							  )} 
							
                                                     </div>
                        </div>
                      </div>
                    </div>
                   
                  </div>
                 
                  
                  <input
                    type="submit"
                    className={styles.payAndPublish}
                    value="Register"
                  />
                

                 
                </form>
              </div>
            )}
          </div>
        </div>
      

     
    </div>
  );
};
export default RegisterPage;
