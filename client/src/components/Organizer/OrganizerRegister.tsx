/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable react/react-in-jsx-scope */
import {useState,useEffect} from "react"
import { axiosApi } from "../../../src/common/axiosConfig"
import { useForm,Controller } from 'react-hook-form'


import checkMarkImg from '../../images/checkMark.png'

import FileUpload from '../../components/FileExport/FileUpload/FileUpload'
import FileList from '../../components/FileExport/FileList/FileList'
import styles from './organizerregister.module.css'
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify';

const RegisterPage = () => {
	const [individualType, setIndividualType] = useState(true) //	true - individual, false - corporate
	const [checkMark1, setCheckMark1] = useState(false)
	const [checkMark2, setCheckMark2] = useState(false)
	const [files, setFiles] = useState([])
	const [fileAlreadyExist, setFileAlreadyExist] = useState(false)
	const [fileNameAlreadyExist, setFileNameAlradyExist] = useState([])
	const [error, setError] = useState(null)
	const [phonenumber,setPhoneNumber]=useState()
	const [phonenumber1,setPhoneNumber1]=useState()
    const [category,setCategory]=useState([])
	

	const {
		register, handleSubmit, formState: { errors, isSubmitted }, getValues, trigger, reset,control
	} = useForm()
	const {
		register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2, isSubmitted: isSubmitted2 }, getValues: getValues2, trigger: trigger2, reset: reset2,control:control2,
	} = useForm()

	
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
		setCheckMark1((prev) => { return (!prev) })
	}
	const toggleCheck2 = () => {
		setCheckMark2((prev) => { return (!prev) })
	}
	const [errorStatus, setErrorStatus] = useState(false)
	const [activationStatus, setActivationStatus] = useState(false)
	const [successStatus, setSuccessStatus] = useState(false)
    useEffect(()=>{
        console.log("click");
        
          axiosApi("public/get-categories", {}).then((data:any)=>{
            console.log(data);
            setCategory(data?.data?.categories)
          })
        },[])
	const printErrors = () => {
		const errorTxt = []
		//	checkmark validation
		if (!checkMark1 && isSubmitted) {
			errorTxt.push('Please accept terms & conditions')
		}

		return errorTxt
	}
	const CoperateErrors = () => {
		const errorTxt = []
		if (!checkMark2 && isSubmitted2) {
			errorTxt.push('Please accept terms & conditions')
		}

		return errorTxt
	}
	const [mail, setMail] = useState('')
	const individualFormSubmit = async (values:any) => {
		console.log({ values });
		// new
		const individualData=new FormData()
		individualData.append('first_name',values.first_name)
		individualData.append('last_name',values.last_name)
		individualData.append('email',values.email)
		individualData.append('mobile',values.mobile)
		individualData.append('password',values.password)
		individualData.append('re_password',values.re_password)
		individualData.append('type',"0")
        axios.post("/organizer/register", individualData).then((data)=>{
            console.log(data);
            if(data?.data?.success){
				toast.success("successfully registered")
              reset();
            }
			else {
				toast.error(data?.data?.message)
			}
          })
		
		
	}
	const corporateFormSubmit = async (values:any) => {
		console.log({ values })
		const contactMail = getValues2('email')
		console.log('contactMail', contactMail)
		setMail(contactMail)
		console.log('mail', mail)
		const coporateData = new FormData()
		coporateData.append('company_name', values.company_name)
		coporateData.append('contact_person_name', values.contact_person_name)
		coporateData.append('email', values.email)
		coporateData.append('address', values.address)
		coporateData.append('mobile', values.mobile)
		coporateData.append('password', values.password)
		coporateData.append('re_password', values.re_password)
		coporateData.append('type', "1")
		coporateData.append("interested_categories", values.interested_categories);
		files.forEach((docs) => {
			console.log({ docs });
			coporateData.append('documents', docs)
		})
	
        axios.post("/organizer/register", coporateData).then((data)=>{
            console.log(data);
            if(data?.data?.success){
				toast.success("successfully registered")
              reset2();
            }
			else{
				toast.error(data?.data?.message)
			}
          })
		
		

	}
	// instead of react forms, should be changed
	return (
		<div>
				<div className={styles.section2}>
		<ToastContainer/>
					<div className={styles.hybridForm}>
						<div style={{ padding: '20px',textAlign:'center' }}><h3>Register As Event Organizer </h3></div>
						<div className={styles.tabType}>
							<div
								className={styles.tabTypeIndividual}
								style={
									{
										backgroundColor: individualType ? '#9E8959' : '#D9D9D9',
										color: individualType ? '#fff' : '#000'
									}
								}
								onClick={() => { reset(); setError(null); setIndividualType(true) }}
								onKeyDown={() => { setIndividualType(true) }}
								tabIndex={0}
								role="button"
							>
								Individual
							</div>
							<div
								className={styles.tabTypeCorporate}
								style={
									{
										backgroundColor: !individualType ? '#9E8959' : '#D9D9D9',
										color: !individualType ? '#fff' : '#000'
									}
								}
								onClick={() => { reset(); setError(null); setIndividualType(false) }}
								onKeyDown={() => { setIndividualType(false) }}
								tabIndex={0}
								role="button"
							>
								Corporate
							</div>

						</div>
						{
							individualType && (
								<div className={styles.individualForm}>

									<form name="individualFormEntry" className={styles.individualFormEntry} onSubmit={handleSubmit(individualFormSubmit)}>
										<div className={styles.formContent1}>
											<div className={styles.formContentFlex1}>
												<div className={styles.formContentWrapDiv1}>
													<span >
														First Name
													</span>
													<div className={styles.validateMessage}>
														<input type="text" id="first_name" {...register("first_name", { required: true, minLength:3})} onKeyUp={() => { trigger('first_name') }} />
														{errors.first_name && errors.first_name.type==='required' &&(<small className={styles.errorMessage}>Name is Required</small>)}
														{errors.first_name && errors.first_name.type==='minLength' && (
                            <small className={styles.errorMessage}>
                              You must provide at least 3 characters
                            </small>
                          )}

													</div>
												</div>
												<div className={styles.formContentWrapDiv2}>
													<span>Last Name</span>
													<div className={styles.validateMessage}>
														<input type="text" {...register("last_name", { required: true })} onKeyUp={() => { trigger('last_name') }} />
														{errors.last_name && (<small className={styles.errorMessage}>LastName is Required</small>)}
													</div></div>
												<div className={styles.formContentWrapDiv1}>
													<span >Email</span>
													<div className={styles.validateMessage}>
														<input type="email" {...register("email", { required: true, pattern: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ })} onKeyUp={() => { trigger('email') }} />
														{errors.email && (<small className={styles.errorMessage}>Invalid Email</small>)}
													</div></div>
                                                    <div className={styles.formContentWrapDiv1}>
													<span >Mobile</span>
													<div className={styles.validateMessage}>
														<input type="mobile" {...register("mobile", { required: true })} onKeyUp={() => { trigger('mobile') }} />
														{errors.mobile && (<small className={styles.errorMessage}>Invalid Email</small>)}
													</div></div>
												<div className={styles.formContentWrapDiv1}>
													<span>Password</span>

													<div className={styles.validateMessage}>
														<input type="password" 
															{...register("password", { required: true,minLength:6 })} onKeyUp={() => { trigger('password') }} />

														{errors.password && errors.password.type ==='required'&&(<small className={styles.errorMessage}>Enter Password</small>)}
														{errors.password && errors.password.type==='minLength' && (
                            <small className={styles.errorMessage}>
                               length  must atleast 6 charactor
                            </small>
                          )}
													</div>
												</div>
												<div className={styles.formContentWrapDiv2}>
													<span>Confirm Password</span>
													<div className={styles.validateMessage}>
														<input type="password" 
															{...register("re_password", { required: true },

															)} onKeyUp={() => { trigger('re_password') }} />
														{getValues('re_password') && (getValues('password') !== getValues('re_password') && (<small className={styles.errorMessage}>Password Not Match</small>))}
													</div>
												</div>

												<div className={styles.formContentWrapDiv2}>
													<div className={styles.validateMessage}>
														<span >Interested Category</span>
														<select className={styles.categoryinput} 
															{...register("interested_categories", { required: true })}
															onKeyUp={() => {
																trigger("interested_categories");
															}} >
															<option value="" disabled selected>Select Category</option>
															{
																category?.map((cat:any) => {
																	return (<option key={cat._id} value={cat._id}>{cat.name}</option>)

																})
															}
														</select>
														{errors.interested_categories && (<small className={styles.errorMessage}>Select Category</small>)}
													</div>
												</div>

											</div>

										</div>
										
										
										<input type="submit" className={styles.payAndPublish} value="Register" />
										
									</form>
								</div>
							)
						}
						{
							!individualType && (
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
															<span className={styles.textspan}>Company Name</span>

															<input type="text" className={styles.companytext} {...register2("company_name", { required: true,minLength:3 })} onKeyUp={() => { trigger2('company_name') }} />
															{errors2.company_name && errors2.company_name.type==='required' &&(<small className={styles.errorMessage}>Name is Required</small>)}
															{errors2.company_name && errors2.company_name.type==='minLength' && (
                            <small className={styles.errorMessage}>
                              You must provide at least 3 characters
                            </small>
                          )}
														</div></div>
													<div className={styles.textandlabel}>
														<div className={styles.companySecValidate}>
															<span  className={styles.textspan}>Address</span>

															<input className={styles.companytext}  {...register2("address", { required: true,minLength:5 })} onKeyUp={() => { trigger2('address') }} />
															{errors2.address && errors2.address.type==='required'&&  (<small className={styles.errorMessage}>Address is Required</small>)}
															{errors2.address && errors2.address.type==='minLength' && (<small className={styles.errorMessage}>You must provide at least 5 characters</small>)}

														</div></div>
													<div className={styles.textandlabel}>
														<span  className={styles.textspan}>Document</span>
														<div className={styles.companySecValidate}>
															<div className={styles.fileSelection}>
																<FileUpload
																	files={files}
																	setFiles={setFiles}
																	removeFile={removeFile}
																	uploadHandler={uploadHandler}
																/>
																<FileList files={files} removeFile={removeFile} {...register2("file")} />
															</div>
															{files.length === 0 && isSubmitted2 && (<small className={styles.errorMessage}>Files is required </small>)}</div>
													</div>
												</div>
												<h5 style={{ 'alignSelf': 'start', 'marginTop': '10px', marginBottom: '10px' }} className={styles.contactPeson}>Contact Person</h5>

												<div className={styles.companySec}>
													<div className={styles.textandlabel}>
														<div className={styles.companySecValidate}>
															<span className={styles.textspan}>Name</span>

															<input
																type="text" className={styles.companytext}

															
																{...register2("contact_person_name", { required: true,minLength:3 })} onKeyUp={() => { trigger2('contact_person_name') }} />
															{errors2.contact_person_name && errors2.contact_person_name.type==='required' && (<small className={styles.errorMessage}>Name is Required</small>)}
															{errors2.contact_person_name && errors2.contact_person_name.type==='minLength' && (
                            <small className={styles.errorMessage}>
                              You must provide at least 3 characters
                            </small>
                          )}
														</div>
													</div>

													<div className={styles.textandlabel}>
														<div className={styles.companySecValidate}>
															<span className={styles.textspan}>Email</span>
															<input
																type="text"
																className={styles.companytext}
															
																{...register2("email", { required: true, pattern: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ })} onKeyUp={() => { trigger2('email') }} />
															{errors2.email && (<small className={styles.errorMessage}>Email Required</small>)}
														</div>
													</div>
                                                    <div className={styles.textandlabel}>
														<div className={styles.companySecValidate}>
															<span className={styles.textspan}>Phone Number</span>
															<input
																type="text"
																className={styles.companytext}
															
																{...register2("mobile", { required: true })} onKeyUp={() => { trigger2('mobile') }} />
															{errors2.mobile && (<small className={styles.errorMessage}>Number Required</small>)}
														</div>
													</div>
													
													<div className={styles.textandlabel}>
														<div className={styles.companySecValidate}>
															<span  className={styles.textspan}>
																Interested Category
															</span>
															<select
																className={styles.categoryinput}
																placeholder="Select Category"
															
																{...register2("interested_categories", { required: true })}
																onKeyUp={() => {
																	trigger2("interested_categories");
																}}
															><option value="" disabled selected>Select Category</option>
																{
																	category?.map((cat:any) => {
																		return (<option key={cat._id} value={cat._id}>{cat.name}</option>)

																	})
																}
															</select>
															{errors2.interested_categories && (
																<small className={styles.errorMessage}>
																	Select Category
																</small>
															)}
														</div>
													</div>

												</div>
												<div className={styles.companySec}>
													<div className={styles.textandlabel}>
														<div className={styles.companySecValidate}>
															<span className={styles.textspan}>Password</span>
															<input type="password" className={styles.companytext}  {...register2("password", { required: true,minLength:6 })} onKeyUp={() => { trigger2('password') }} />
															{errors2.password && errors2.password.type==='required' && (<small className={styles.errorMessage}>Password Required</small>)}
															{errors2.password && errors2.password.type==='minLength' && (
                            <small className={styles.errorMessage}>
                               length  must atleast 6 charactor
                            </small>
                          )}
														</div>
													</div>

													<div className={styles.textandlabel}>
														<div className={styles.companySecValidate}>
															<span className={styles.textspan}>Confirm Password</span>
															<input type="password" className={styles.companytext}  {...register2("re_password", { required: true })} onKeyUp={() => { trigger2('re_password') }} />
															{getValues2('re_password') && (getValues2('password') !== getValues2('re_password') && (<small className={styles.errorMessage}>Password Not Match</small>))}

														</div>
													</div>

												</div>
											</div>
										
										</div>
										
										
										<input type="submit" className={styles.payAndPublish} value="Register" />
									
										
									</form>
								</div>
							)
						}
					</div>
				</div>

			



		</div>

	)
}
export default RegisterPage


