/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable react/jsx-key */
import React, { useEffect, useRef, useState } from "react";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi, axiosDoc } from "src/common/axiosConfig";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  CardTitle,
  Alert,
  Input,
  Label,
  Button,
  DropdownToggle,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Link, useLocation, withRouter } from "react-router-dom";
import axios from "axios";
import { submit } from "src/common/confirmPopup";
import Index from "../editSponserDetails";

function SponsorDetails() {
  document.title = "User Details ";

  const location = useLocation();
  const [userData, setUserData] = useState<any>({});
  let [categories, setCategories] = useState<any>([]);

  const [discountRate, setDiscountRate] = useState<any>();
  const [userType, setUsertype] = useState<any>(0);
  const [approved, setApproved] = useState<any>();
  const [documents, setDocuments] = useState<any>([]);
  const [block, setBlock] = useState<any>(false);

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

  let cat = categories[0];

  useEffect(() => {
    const id = location.state;
    console.log("new page");

    axiosApi("/admin/sponsor-details", { id: id }).then((resp: any) => {
      console.log(resp);
      setUserData(resp.data.data);

      setCategories(resp.data.data.interested_categories);
      setApproved(resp.data.data.admin_approval);
      setDocuments(resp.data.data.documents);
      setBlock(resp.data.data.blocked);

      console.log("cat", resp.data.data.interested_categories);
    });
  }, []);
  const grandDiscount = () => {
    console.log("clicked");

    const postData = {
      rate: discountRate,
      date: Date.now(),
      discount_for_sponsor: location.state,
      type: 1,
    };
    axiosApi("/admin/add-discount", postData)
      .then((resp) => {
        console.log({ resp });
      })
      .catch((httpErr) => {
        console.log({ httpErr });
      });
  };
  const onclick = async () => {
    
      console.log({ userType });
      axiosApi("/admin/sponsorType-update", {
        type: userType,
        id: userData._id,
        admin_approval: true,
      })
        .then(async (resp) => {
          console.log(resp);
          await activateAccount();
        })
        .catch((err) => {
          console.log({ err });
        });
      return;
    
  };

  const activateAccount = () => {
    const data = {
      id: userData._id,
      email: userData.email,
      role: 2,
     
    };
    setApproved(true);
    axiosApi("/admin/send-activateLink", data).then((response) => {
      console.log({ response });
    });
  };

  const openInNewTab = (file: any) => {
    console.log({ file });

    axiosDoc(file)
      .then((response: any) => {
        console.log({ response });

        var urlCreator = window.URL || window.webkitURL;
        const docUrl = urlCreator.createObjectURL(response.data);
        window.open(docUrl, "_blank", "noopener,noreferrer");
      })
      .catch((err) => {
        console.log({ err });
      });
  };
  const blockUser = (value: any) => {
    console.log("before clicked", block);

    setBlock(value);
    console.log("after clicked", block);

    const data = {
      id: userData._id,
      role: 3,
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
          <CardHeader>
            <CardTitle className="mb-0 " style={{ fontWeight: "100px" }}>
              {userData.company_name}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div>
              <div className="pb-3">
                <Row>
                  <Col xl={3}>
                    <div>
                      <h5 className="font-size-15">Company Name :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{userData.company_name}</p>
                </Row>
              </div>
              <div className="pb-3">
                <Row>
                  <Col xl={3}>
                    <div>
                      <h5 className="font-size-15">Sponsor Type :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">
                    {userType === 0 ? "Conventional" : "Islamic"}
                  </p>
                </Row>
              </div>
              <div className="pb-3">
                <Row>
                  <Col xl={3}>
                    <div>
                      <h5 className="font-size-15">Email :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{userData.email}</p>
                </Row>
              </div>
              <div className="pb-3">
                <Row>
                  <Col xl={3}>
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
                    <Col xl={3}>
                      <div>
                        <h5 className="font-size-15">Address :</h5>
                      </div>
                    </Col>
                    <p className="col-xl">{userData.address}</p>
                  </Row>
                </div>
              )}
              {cat && (
                <div className="pb-3">
                  <Row>
                    <Col xl={3}>
                      <div>
                        <h5 className="font-size-15">Interested Categories:</h5>
                      </div>
                    </Col>
                    <Col>
                      {categories.map((d: any) => (
                        <p>{d.name}</p>
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
              {!approved && !userData.activated && (
                <Card>
                  <CardBody>
                    <div className="pb-3">
                      <Row>
                        <Col xl={3}>
                          <div>
                            <h5 className="font-size-15">Account Type :</h5>
                          </div>
                        </Col>

                        <Col>
                          <Label>
                            <Input
                              type="radio"
                              onClick={() => setUsertype(0)}
                              name="accountType"
                              value={0}
                              defaultChecked
                            />{" "}
                            Conventional
                          </Label>
                          <br />
                          <Label>
                            <Input
                              type="radio"
                              onClick={() => setUsertype(1)}
                              name="accountType"
                              value={1}
                            />{" "}
                            Islamic
                          </Label>
                          <br />
                        </Col>
                      </Row>
                    </div>
                  </CardBody>
                </Card>
              )}
             
              {!userData.activated && (
             
                <Button onClick={()=>submit(()=>onclick(),'Are you sure want to sent the activation link ?')}>
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
                      <Button onClick={()=>submit(()=> blockUser(true),'Are You Sure to Block This Account')}  color="danger">
                        Block user
                      </Button>
                    ) : (
                      <Button onClick={()=>submit(()=> blockUser(false),'Are You Sure to Unblock This Account')} color="info">
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

        <Index isOpen={isEditModalOpen} onClose={closeEditModal}  data={sponserData} userId={dataId} />
      </div>
      
      
    </div>
  );
}

export default SponsorDetails;
