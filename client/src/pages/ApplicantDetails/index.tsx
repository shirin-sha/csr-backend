/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi, axiosDoc } from "src/common/axiosConfig";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Alert,
  Button,
  Input,
} from "reactstrap";
import { useLocation, withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { Icon } from "leaflet";
import { type } from "os";
import { submit } from "src/common/confirmPopup";
import { notif } from "src/common/PopupNotification";
import Applicants from "../edittApplicants";
// import { confirm } from "react-confirm-box";

function ApplicantDetails() {
  const location = useLocation();
  const [userData, setUserData] = useState<any>({});
  document.title = "User Details ";
  const [documents, setDocuments] = useState<any>([]);
  const [block, setBlock] = useState<any>(false);
  const [dob, setDob] = useState();
  const [discountRate, setDiscountRate] = useState<any>();
  const [discountType, setDiscountType] = useState<any>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sponserData,setSponserData] = useState({})
  const [dataId, setDataId] = useState<any>()
  const openEditModal = () => {
    setIsEditModalOpen(true);
    setSponserData(userData)
    setDataId(location.state)
  };

  console.log(sponserData,"sponsereeeee");

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    
  };  

  // user effect
  useEffect(() => {
    const id = location.state;
    console.log("new page");

    axiosApi("/admin/applicant-details", { id: id }).then((resp: any) => {
      console.log(resp.data.data);
      setUserData(resp.data.data);

      setDocuments(resp.data.data.documents);
      setBlock(resp.data.data.blocked);
      const date: any = resp.data.data.dob;
      const stringDate: any = new Date(date).toLocaleDateString();
      setDob(stringDate);
    });
  }, []);

  // document view
  const openInNewTab = (file: any) => {
    console.log({ file });

    axiosDoc(file)
      .then((response: any) => {
        console.log({ response });

        const urlCreator = window.URL || window.webkitURL;
        const docUrl = urlCreator.createObjectURL(response.data);
        window.open(docUrl, "_blank", "noopener,noreferrer");
      })
      .catch((err) => {
        console.log({ err });
      });
  };
  // grad discount
  const grandDiscount = () => {
    console.log("clicked");

    const postData = {
      rate: discountRate,
      date: Date.now(),
      discount_for_applicant: location.state,
      type: discountType,
    };
    axiosApi("/admin/add-discount", postData)
      .then((resp) => {
        console.log({ resp });
        notif("Discount Rate on Event Quatation is Granded  successfully");
      })
      .catch((httpErr) => {
        console.log({ httpErr });
      });
  };
  // block user
  const blockUser = (value: any) => {
    console.log("before clicked", block);

    setBlock(value);
    console.log("after clicked", block);

    const data = {
      id: userData._id,
      role: 1,
      value,
    };
    axiosApi("/admin/block-user", data).then((result) => {
      console.log({ result });
    });
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        {block && <Alert color="danger">Account is Blocked </Alert>}
        {!userData.activated && (
          <Alert color="info">Account is Not Activated</Alert>
        )}
        <Card>
          <CardBody>
            <div>
              <div className="pb-3">
                <Row>
                  <Col xl={userData.contact_person_name ? 3 : 2}>
                    <div>
                      <h5 className="font-size-15">
                        {userData.type === 1 ? `Company Name :` : `Name :`}
                      </h5>
                    </div>
                  </Col>
                  <p className="col-xl">
                    {userData.company_name ||
                      userData.first_name + " " + userData.last_name}
                  </p>
                </Row>
              </div>
              <div className="pb-3">
                <Row>
                  <Col xl={userData.contact_person_name ? 3 : 2}>
                    <div>
                      <h5 className="font-size-15">Applicant Type :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">
                    {userData.type === 0 ? "Individual" : "Corporate"}
                  </p>
                </Row>
              </div>
              <div className="pb-3">
                <Row>
                  <Col xl={userData.contact_person_name ? 3 : 2}>
                    <div>
                      <h5 className="font-size-15">Email :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{userData.email}</p>
                </Row>
              </div>
              <div className="pb-3">
                <Row>
                  <Col xl={userData.contact_person_name ? 3 : 2}>
                    <div>
                      <h5 className="font-size-15">Mobile :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{userData.mobile}</p>
                </Row>
              </div>
              {userData.address && (
                <div className="pb-3">
                  <Row>
                    <Col xl={userData.contact_person_name ? 3 : 2}>
                      <div>
                        <h5 className="font-size-15">Address :</h5>
                      </div>
                    </Col>
                    <p className="col-xl">{userData.address}</p>
                  </Row>
                </div>
              )}
              {userData.dob && (
                <div className="pb-3">
                  <Row>
                    <Col xl={2}>
                      <div>
                        <h5 className="font-size-15">Date of Birth :</h5>
                      </div>
                    </Col>
                    <p className="col-xl">{dob}</p>
                  </Row>
                </div>
              )}
              {userData.gender && (
                <div className="pb-3">
                  <Row>
                    <Col xl={2}>
                      <div>
                        <h5 className="font-size-15">Gender :</h5>
                      </div>
                    </Col>
                    <p className="col-xl">{userData.gender}</p>
                  </Row>
                </div>
              )}
              {userData.contact_person_name && (
                <div className="pb-3">
                  <Row>
                    <Col xl={3}>
                      <div>
                        <h5 className="font-size-15">Contact Person Name :</h5>
                      </div>
                    </Col>
                    <Col xl={2}>
                      <p className="col-xl"> {userData.contact_person_name}</p>
                    </Col>
                  </Row>
                </div>
              )}
              {!block && userData.activated && (
                <div className="pb-3">
                  <Row>
                    <Col xl={2}>
                      <div>
                        <h5 className="font-size-15">Discount rate :</h5>
                      </div>
                    </Col>
                    <Col xl={2}>
                      <Input
                        formNoValidate={false}
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                        type="select"
                      >
                        <option value={0}>Project Sponsor</option>
                        <option value={1}>Event Organizer</option>
                      </Input>
                    </Col>
                    <Col xl={2}>
                      <Input
                        placeholder="Discount Rate (%)"
                        onChange={(e: any) => {
                          if (
                            e.target.value === undefined ||
                            e.target.value === null ||
                            e.target.value < 0
                          ) {
                            e.target.value = 0;
                            setDiscountRate(0);
                          }
                          if (e.target.value > 100) {
                            console.log("rate is only less than 100");
                            e.target.value = 100;
                            setDiscountRate(100);
                          } else {
                            setDiscountRate(e.target.value);
                          }
                        }}
                        min={1}
                        max={100}
                        type="number"
                      ></Input>
                    </Col>
                    <Col xl={2}>
                      <Button
                        onClick={() =>
                          submit(
                            grandDiscount,
                            "Do you want to grand Discount for this user"
                          )
                        }
                      >
                        {" "}
                        Grand
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}
              {documents.length !== 0 && (
                <Card>
                  <CardBody>
                    <Row>
                      <Col xl={3}>
                        <div>
                          <h5 className="font-size-15">Documents :</h5>
                        </div>
                      </Col>
                      <Col>
                        {documents.map((d: any, idx: any) => (
                          <Row>
                            <Col xl={2}>
                              <p> Document :{idx + 1}</p>
                            </Col>
                            <Col xl={2}>
                              <Button
                                onClick={() => {
                                  openInNewTab(d.file_name);
                                }}
                                style={{
                                  height: "30px",
                                  display: "flex",
                                  justifyItems: "center",
                                  alignItems: "center",
                                }}
                              >
                                View
                              </Button>
                            </Col>
                          </Row>
                        ))}
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              )}
              {userData.activated && (
                <Row>
                  <Col
                    style={{ display: "flex", flexDirection: "row-reverse" }}
                    xl={12}
                  >
                    {!block ? (
                      <Button
                        onClick={() =>
                          submit(
                            () => blockUser(true),
                            "Are You Sure to Block This Account"
                          )
                        }
                        color="danger"
                      >
                        Block user
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          submit(
                            () => blockUser(false),
                            "Are You Sure to Unblock This Account"
                          )
                        }
                        color="info"
                      >
                        Unblock user
                      </Button>
                    )}
                  </Col>
                </Row>
              )}
            </div>
            <Button  type="submit" style={{marginLeft:"20px"}} onClick={() => openEditModal()}>Edit details</Button> 
          </CardBody>
        </Card>
        <Applicants isOpen={isEditModalOpen} onClose={closeEditModal}  data={sponserData} userId={dataId} />
      </div>
    </div>
  );
}

export default ApplicantDetails;
