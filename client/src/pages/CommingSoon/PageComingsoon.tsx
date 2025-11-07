/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Slider from "react-slick";

//Import Countdown
import Countdown from "react-countdown";

//import images
import bg1 from "../../assets/images/bg-1.jpg";
import bg2 from "../../assets/images/bg-2.jpg";
import bg3 from "../../assets/images/bg-3.jpg";
// import images
import logo from "../../assets/images/logoLoop.png";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";

const PagesComingsoon = () => {
  document.title = "Coming Soon | Loop -  Admin & Dashboard ";


  

  

  var slidesettings = {
    dots: true,
    speed: 300,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    dotsClass: "swiper-container preview-thumbsnav",
    customPaging: function (i: any) {
      return (
        <div className="swiper-slide">
          <img
            src={process.env.PUBLIC_URL + "/images/bg-" + (i + 1) + ".jpg"}
            alt=""
            className=" avatar-sm nav-img rounded-circle"
          />
        </div>
      );
    },
  };

  return (
    <React.Fragment>
      <div className="preview-img">
        <div className="swiper-container preview-thumb">
          <div className="swiper-wrapper">
       
          </div>
        </div>
      </div>
      <div className="coming-content min-vh-100 py-4 px-3 py-sm-5">
        <div className="bg-overlay bg-primary"></div>
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="text-center py-4 py-sm-5">
                <div className="mb-5">
                  <Link to="/dashboard">
                    <img src={logo} alt="logo" height="30" className="me-1" />
                    <span className="logo-txt text-white font-size-22">
                     Loop
                    </span>
                  </Link>
                </div>
                <h3 className="text-white mt-5">
                  This Page Not Available at now
                </h3>
                <p className="text-white-50 font-size-16">
                 Page Coming Soon
                </p>

              

                <form className="app-search mt-5 mx-auto">
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your email address"
                    />
                    <button className="btn btn-primary" type="button">
                      <i className="bx bx-paper-plane align-middle"></i>
                    </button>
                  </div>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PagesComingsoon;
