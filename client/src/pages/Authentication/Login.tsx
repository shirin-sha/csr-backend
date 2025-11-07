import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Row,
  Col,
  Alert,
  Container,
  Form,
  Input,
  FormFeedback,
  Label,
} from "reactstrap";


//redux
import { useSelector, useDispatch } from "react-redux";

import { withRouter, Link } from "react-router-dom";

// Formik validation
import * as Yup from "yup";
import { useFormik, validateYupSchema, yupToFormErrors } from "formik";

// actions
import {
  apiError,
  loginSuccess,
  loginUser,
  logoutUserSuccess,
  socialLogin,
} from "../../store/actions";

// import images
import logo from "../../assets/images/logoLoop.png";

//Import config
import config from "../../config";
import CarouselPage from "../Authentication/CarouselPage";
import axios from "axios";
import { put } from "src/helpers/api_helper";
import { json } from "stream/consumers";
import { axiosApi } from "src/common/axiosConfig";
import { DivOverlay } from "leaflet";

const Login = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      name: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Your Name"),
      password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {

      axiosApi("/admin/login", {
        name: values.name,
        password: values.password,
      }).then(async (resp :any) => {
        console.log(resp ) ;
        if (resp.data.success === false) {
          console.log("error:", resp);
          dispatch(apiError(resp.data.message));
        } else {
          console.log(resp.data.data);
          
          localStorage.setItem("token", resp.headers.token);
          localStorage.setItem("userData", resp.data.data.name);
         localStorage.setItem("role",resp?.data?.data?.role)
          history.push("/dashboard");
        }
      });
    },
  });
 const { error } = useSelector((state: any) => ({
    error: state.login.error,
  }));

  document.title = "Login";

  return (
    <React.Fragment>
      <div className="auth-page">
        <Container fluid className="p-0">
          <Row className="g-0">
            <Col lg={4} md={5} className="col-xxl-3">
              <div className="auth-full-page-content d-flex p-sm-5 p-4">
                <div className="w-100">
                  <div className="d-flex flex-column h-100">
                    <div className="mb-4 mb-md-5 text-center">
                      <Link to="/dashboard" className="d-block auth-logo">
                        <div style={{marginTop:'4rem'}}>
                        <img  src={logo} alt="" height="40" />{" "}
                        {/* <span className="logo-txt">Loop</span> */}
                        </div>
                   
                      </Link>
                    </div>
                    <div className="auth-content my-auto">
                      <div className="text-center mb-5">
                        <h5 className="">Welcome Back !</h5>
                        <p className="text-muted mt-2">
                          Sign in to continue to Loop.
                        </p>
                      </div>
                      <Form
                        className="custom-form mt-4 pt-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}
                      >
                        {error ? <Alert color="danger">{error}</Alert> : null}
                        <div className="mb-3">
                          <Label className="form-label">User Name</Label>
                          <Input
                            name="name"
                            className="form-control"
                            placeholder="Enter User Name"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.name || ""}
                            invalid={
                              validation.touched.name && validation.errors.name
                                ? true
                                : false
                            }
                          />
                          {validation.touched.name && validation.errors.name ? (
                            <FormFeedback type="invalid">
                              {validation.errors.name}
                            </FormFeedback>
                          ) : null}
                        </div>

                        <div className="mb-3">
                          <Label className="form-label">Password</Label>
                          <Input
                            name="password"
                            value={validation.values.password || ""}
                            type="password"
                            placeholder="Enter password"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.password &&
                              validation.errors.password
                                ? true
                                : false
                            }
                          />
                          {validation.touched.password &&
                          validation.errors.password ? (
                            <FormFeedback type="invalid">
                              {validation.errors.password}
                            </FormFeedback>
                          ) : null}
                        </div>

                        <div className="row mb-4">
                          <div className="col">
                            <div className="mt-3 d-grid">
                              <button
                                className="btn btn-primary btn-block"
                                type="submit"
                              >
                                Log In
                              </button>
                            </div>
                          </div>
                        </div>
                      </Form>
                    </div>
                    <div className="mt-4 mt-md-5 text-center">
                   
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <CarouselPage />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(Login);
