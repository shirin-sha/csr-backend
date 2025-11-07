/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosApi } from 'src/common/axiosConfig';

import { ToastContainer, toast } from 'react-toastify';
import { useHistory } from 'react-router';
// eslint-disable-next-line react/prop-types
function Organizer({ isOpen, onClose, data, userId }) {
  console.log(userId);

  
  let validationSchema;
  if (data.type === 0) {
    validationSchema = Yup.object().shape({
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      img: Yup.string().required('Image URL is required'),
      // Add other fields specific to data.type === 0
    });
  } else {
    validationSchema = Yup.object().shape({
      company_name: Yup.string().required('Company Name is required'),
      address: Yup.string().required('Address is required'),
      contact_person_name: Yup.string().required('Contact Person Name is required'),
      img: Yup.string().required('Image URL is required'),
      // Add other fields specific to data.type !== 0
    });
  }


  const history = useHistory()

  const initialValues = {
    // eslint-disable-next-line react/prop-types
    company_name: data?.company_name || '', // Use the data prop or an empty string as the initial value
    address: data?.address || '',
    contact_person_name: data?.contact_person_name || '',
    img: data?.img || '',
    first_name:data?. first_name||'',
    last_name:data?.last_name||'',
    type: data?.type
  };

  console.log("dataaaaa", data);

  const onSubmit = (values) => {

    console.log("clicked",values);
    // Send the updated data to your server for saving or updating
    const formData = new FormData();
    formData.append("first_name", values?.first_name);
    formData.append("last_name", values?.last_name);
    formData.append("company_name", values?.company_name);
    formData.append("address", values?.address);
    formData.append("contact_person_name", values?.contact_person_name);
    formData.append("img", values?.img);
    formData.append("type", parseInt(initialValues?.type, 10));
  
    console.log("Form Data:", formData); 
    axiosApi(`/admin/update-orginizer-data/${userId}`, formData)
      .then((res) => {
        console.log("Response:", res); 
        toast.success("successfully updated");
        setTimeout(() => {
          onClose();
          history.push('/organizers');
        }, 5000);
      })
      .catch((error) => {
        console.error("Error:", error); 
      });
  };
  
  

  console.log("Initial Values:", initialValues);
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit, 
    enableReinitialize:true,

  });

 
  
  return (
    <div className={`modal ${isOpen ? 'show' : ''}`} style={{ display: isOpen ? 'block' : 'none' }}>
      <ToastContainer />
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Organaizr  Information</h5>
            <button type="button" className="close" onClick={onClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="container mt-5">
              <div className="row justify-content-center">
                <div className="col-md-12">
                  <div className="card p-4">
                    <form onSubmit={formik.handleSubmit}>
                        {data.type===0?
                        <>
                        <div className="mb-3">
                        <label htmlFor="first_name" className="form-label">first Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="first_name"
                          name="first_name"
                          value={formik.values.first_name}
                          onChange={formik.handleChange}
                        />
                        {formik.touched.first_name && formik.errors.first_name && (
                          <p className="text-danger">{formik.errors.first_name}</p>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="last_name" className="form-label">last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="last_name"
                          name="last_name"
                          value={formik.values.last_name}
                          onChange={formik.handleChange}
                        />
                        {formik.touched.last_name && formik.errors.last_name && (
                          <p className="text-danger">{formik.errors.last_name}</p>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="img" className="form-label">Uplode Document</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="img"
                            name="img"
                            placeholder="Choose a file..."
                            value={formik.values.img.name || ''}
                            readOnly
                            style={{ borderRadius: '0.25rem 0 0 0.25rem', height: 'calc(1.5em + 0.75rem + 2px)' }}
                          />
                          <label className="input-group-btn" style={{ borderRadius: '0 0.25rem 0.25rem 0' }}>
                            <span className="btn btn-primary" style={{ height: '100%' }}>
                              Browse&hellip;
                              <input
                                type="file"
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={(event) => {
                                  formik.setFieldValue("img", event.currentTarget.files[0]);
                                }}
                              />
                            </span>
                          </label>
                        </div>
                        {formik.touched.img && formik.errors.img && (
                          <p className="text-danger">{formik.errors.img}</p>
                        )}
                      </div>
                        </>
                        :<>

                        <div className="mb-3">
                        <label htmlFor="company_name" className="form-label">Company Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="company_name"
                          name="company_name"
                          value={formik.values.company_name}
                          onChange={formik.handleChange}
                        />
                        {formik.touched.company_name && formik.errors.company_name && (
                          <p className="text-danger">{formik.errors.company_name}</p>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="address" className="form-label">Address</label>
                        <input
                          type="text"
                          className="form-control"
                          id="address"
                          name="address"
                          defaultValue={data?.address}
                          value={formik.values.address}
                          onChange={formik.handleChange}
                        />
                        {formik.touched.address && formik.errors.address && (
                          <p className="text-danger">{formik.errors.address}</p>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="contact_person_name" className="form-label">Contact Person Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="contact_person_name"
                          name="contact_person_name"
                          value={formik.values.contact_person_name}
                          onChange={formik.handleChange}
                        />
                        {formik.touched.contact_person_name && formik.errors.contact_person_name && (
                          <p className="text-danger">{formik.errors.contact_person_name}</p>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="img" className="form-label">Uplode Document</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="img"
                            name="img"
                            placeholder="Choose a file..."
                            value={formik.values.img.name || ''}
                            readOnly
                            style={{ borderRadius: '0.25rem 0 0 0.25rem', height: 'calc(1.5em + 0.75rem + 2px)' }}
                          />
                          <label className="input-group-btn" style={{ borderRadius: '0 0.25rem 0.25rem 0' }}>
                            <span className="btn btn-primary" style={{ height: '100%' }}>
                              Browse&hellip;
                              <input
                                type="file"
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={(event) => {
                                  formik.setFieldValue("img", event.currentTarget.files[0]);
                                }}
                              />
                            </span>
                          </label>
                        </div>
                        {formik.touched.img && formik.errors.img && (
                          <p className="text-danger">{formik.errors.img}</p>
                        )}
                      </div>
                        
                        </>
                        
                        }
                      




                      <div className="d-flex justify-content-between">
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={onClose}
                          style={{ marginLeft: "20px" }}
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Organizer;
