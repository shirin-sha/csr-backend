import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import fileDownload from "js-file-download";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi, axiosDoc } from "src/common/axiosConfig";

// import * as dayjs from 'dayjs';
import { default as dayjs } from "dayjs";

import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  CardTitle,
  Alert,
  Button,
  Input,
} from "reactstrap";
import { useLocation, withRouter } from "react-router-dom";
import axios from "axios";
import { submit } from "src/common/confirmPopup";
import Sponsors from "../Sponsors";
import Organizer from "../editOrganaizer";

function OrganizerDetails() {
  const location = useLocation();
  const [userData, setUserData] = useState<any>({});
  document.title = "User Details ";
  const [categories, setCategories] = useState<any>([]);
  const [date, setDate] = useState<any>();
  const [today, setToday] = useState<any>();
  const [approved, setApproved] = useState<any>();
  const [documents, setDocuments] = useState<any>([]);
  const [discountRate, setDiscountRate] = useState<any>();
  const [block, setBlock] = useState<any>(false);
  const [dob, setDob] = useState();
  console.log("dateeeeeeeeeeeeeee,", date);
  const [valid, setValid] = useState<any>();
  console.log("valid", valid);
  const [errmsg, setErrMsg] = useState(false);
  const cat = categories[0];
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

  console.log("errrrrrr", errmsg);
  useEffect(() => {
    const id = location.state;
    console.log("new page organizer");

    axiosApi("/admin/organizer-details", { id: id })
      .then(async (resp: any) => {
        console.log("aaaaaaaaaa", resp.data.data);
        setUserData(resp.data.data);
        setToday(Date.now());
        setApproved(resp.data.data.admin_approval);
        setCategories(resp.data.data.interested_categories);
        setDocuments(resp.data.data.documents);
        setDate(resp.data.data.valid_upto);
        setBlock(resp.data.data.blocked);
        const date: any = resp.data.data.dob;
        const stringDate: any = new Date(date).toLocaleDateString();
        setDob(stringDate);
        setValid(resp.data.data.valid_upto);
      })
      .catch((err) => {
        console.log({ err });
      });
  }, []);
  const grandDiscount = () => {
    console.log("clicked");

    const postData = {
      rate: discountRate,
      date: Date.now(),
      discount_for_organizer: location.state,
      type: 0,
    };
    axiosApi("/admin/add-discount", postData)
      .then((resp) => {
        console.log("bbbbbb", { resp });
      })
      .catch((httpErr) => {
        console.log({ httpErr });
      });
  };

  const onclick = async () => {
    console.log("test");

    console.log({ documents });
    console.log("clicked");

    // const result = await window.confirm(
    //   "Are you Sure ,You want to send Activating link ? "
    // );
    // if (result) {
    const todayDate: any = new Date(today).toLocaleDateString();
    console.log("td", todayDate);
    setToday(todayDate);
    console.log("dateee");
    console.log("today", today);
    const data = {
      id: userData._id,
      date,
      admin_approval: true,
    };
    axiosApi("/admin/set-expireDate", data)
      .then(async (result) => {
        console.log("rrrrrrrrr", result);
        await activateAccount();
      })
      .catch((err) => {
        console.log({ err });
      });
    // } else {
    //   console.log("not approved");
    // }
  };
  const activateAccount = () => {
    const data = {
      id: userData._id,
      email: userData.email,
      role: 1,
    };
    setApproved(true);
    axiosApi("/admin/send-activateLink", data).then((response) => {
      setApproved(true);
      console.log("activvv", { response });
    });
  };
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
  const blockUser = (value: any) => {
    setBlock(value);
    console.log("after clicked", block);

    const data = {
      id: userData._id,
      role: 2,
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
                      <h5 className="font-size-15">Organizer Type :</h5>
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
              {cat && (
                <div className="pb-3">
                  <Row>
                    <Col xl={userData.contact_person_name ? 3 : 2}>
                      <div>
                        <h5 className="font-size-15">Interested Categories:</h5>
                      </div>
                    </Col>
                    <Col>
                      {userData.interested_categories.map((d: any) => (
                        <p key={d._id}>{d.name}</p>
                      ))}
                    </Col>
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
                    <Col xl={3}>
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
                          <Row key={idx}>
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
              {/* {!approved && !userData.activated && ( */}

              <Card>
                <CardBody>
                  <Row>
                    <Col xl={3}>
                      <div>
                        <h5 className="font-size-15">Expire Date :</h5>
                      </div>
                    </Col>
                    <Col xl={2}>
                      {!approved && !userData.activated ? (
                        <Input
                          type="date"
                          onChange={
                            (e) => {
                              setDate(e.target.value);
                              console.log("date", date, e.target.value);
                            }
                            //
                          }
                          min={today}
                          required
                        />
                      ) : (
                        <p>{dayjs(date ||userData.valid_upto).format("DD/MM/YYYY")}</p>
                        //  {'2022-10-33'}
                        //  {dayjs((userData.valid_upto).toISOString().split('T')[0]).format("DD/MM/YYYY")}
                      )}
                    </Col>
                    {errmsg && !userData.activated && !userData.valid_upto && (
                      <Col xl={3}>
                        <p style={{ paddingTop: "10px", color: "red" }}>
                          Please Enter Expire Date
                        </p>
                      </Col>
                    )}
                  </Row>
                </CardBody>
              </Card>
              {/* )} */}
              {!userData.activated && (
                <Button
                  onClick={() => {
                    console.log("trueeeeee");
                    if (date == undefined) {
                      setErrMsg(true);
                    } else {
                      submit(
                        () => onclick(),
                        "Are you sure want to sent the activation link ?"
                      ),
                        setErrMsg(false);
                    }
                  }}
                >
                  {approved
                    ? "Resend Activating Link"
                    : "Submit And Send Activating Link"}
                </Button>
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
                            "Are You Sure to unblock This Account"
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

<Button  type="submit" style={{marginLeft:"20px"}} onClick={() => openEditModal()}>Edit details</Button> 
            </div>
          </CardBody>
        </Card>
        <Organizer isOpen={isEditModalOpen} onClose={closeEditModal}  data={sponserData} userId={dataId} />
      </div>
    </div>
  );
}

export default OrganizerDetails;
