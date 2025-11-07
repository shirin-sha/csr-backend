/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi, axiosDoc } from "src/common/axiosConfig";
import {
  Card,
  CardBody,
  CardHeader,
  ButtonGroup,
  Col,
  Row,
  CardTitle,
  Alert,
  Button,
  Label,
  Input,
} from "reactstrap";
import { useLocation, withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { Icon } from "leaflet";
import Table from "src/components/Table";
import SimpleTable from "src/components/SimpleTable";
import { submit } from "src/common/confirmPopup";
import DeleteModal from "src/components/Common/DeleteModal";
import { notif } from "src/common/PopupNotification";
import { date } from "yup";
import dayjs from "dayjs";

// import { confirm } from "react-confirm-box";

function ProjectDetails() {
  const location = useLocation();
  const [data, setData] = useState<any>({});
  document.title = "User Details ";
  const [documents, setDocuments] = useState<any>([]);
  const [submitionDate, setSubmitionDate] = useState<any>();
  const [categories, setCategories] = useState<any>([]);
  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState(0);
  const [sponsorships, setSponsorShips] = useState<any>([]);
  const fetchIdRef = React.useRef(0);
  const [status, setStatus] = useState<any>();
  const [expireDate, setExpireDate] = useState<any>();
  const [extendDate, setExtendDate] = useState<any>();

  // const [msgData, setMsgData] = useState<any>(0);

  //let cat = categories[0];
  // user effect
  useEffect(() => {
    const id = location.state;
    console.log("new page");

    axiosApi("/admin/project-details", { id: id }).then((resp: any) => {
      console.log(resp.data.data);
      setData(resp.data.data);
      setDocuments(resp.data.data.documents);
      setCategories(resp.data.data.category);
      setStatus(resp.data.data.status);

      console.log("response", resp.data.data);
      const sponsorsArray = resp.data.data.sponsorships;
      setSponsorShips([...sponsorsArray]);

      const newdate = new Date(
        resp.data.data.submission_date
      ).toLocaleDateString();
      setSubmitionDate(newdate);
      if (resp.data.data.expire_date !== null) {
        const newexpiredate = new Date(
          resp.data.data.expire_date
        ).toLocaleDateString();
        setExpireDate(newexpiredate);
      }
      if (resp.data.data.extend_date !== null) {
        const newextendDate = new Date(
          resp.data.data.extend_date
        ).toLocaleDateString();
        setExtendDate(newextendDate);
      }
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

  const columns = React.useMemo(
    () => [
      {
        Header: "Sponsor Name",
        accessor: "sponsor_id",
        Cell: (props: any) => {
          const value = props.row.original;
          console.log(`props: `, value);
          return value.sponsor_id.company_name;
        },
      },
      {
        Header: "Sponsor Amount",
        accessor: "amount",
      },

      {
        Header: "",
        accessor: "edit",
        Cell: (props: any) => <Button color="link">Edit</Button>,
      },
      {
        Header: "",
        accessor: "delete",
        Cell: (props: any) => <Button color="link">Delete</Button>,
      },
    ],
    []
  );

  const changeStatus = () => {
    console.log("first status", status);

    let msgData = {};
    if (status === "INACTIVE") {
      setStatus("ACTIVE");
      msgData = {
        status: "ACTIVE",
        id: data._id,
      };
    }
    if (status === "ACTIVE") {
      setStatus("INACTIVE");
      msgData = {
        status: "INACTIVE",
        id: data._id,
      };
    }
    console.log("after clicked :", status);

    console.log({ msgData });

    axiosApi("/admin/change-status", msgData)
      .then((resp) => {
        notif("project status changed");
        console.log({ resp });
      })
      .catch((error) => {
        console.error(error);
        notif(" Something wrong happen");
      });
  };

  const expireProject = (isExpired: any, status: any) => {
    const newexpiredate = moment().format()

    console.log({ newexpiredate });
    const newDate = dayjs(newexpiredate).format("DD/MM/YYYY");

    console.log({ newDate });
    setExpireDate(newDate);

    const postData = {
      project_id: data._id,
      date: newexpiredate,
      expired: isExpired,
      status,
    };
    axiosApi("admin/expire-project", postData)
      .then((resp: any) => {
        console.log({ resp });
        if (resp.data.success == false) {
          notif(" This project cant expire");
        } else {
          notif("This Project  is Expired");
          setStatus("EXPIRED");
        }
      })
      .catch((reqErr) => {
        notif(" This project cant expire");
        console.log({ reqErr });
      });
  };
  const extendProject = async () => {
    const newExtendDate = moment().add(2, "M").format();

    console.log({ newExtendDate });
    const newDate = dayjs(newExtendDate).format("DD/MM/YYYY");

    console.log({ newDate });
    setExtendDate(newDate);

    const postData = {
      project_id: data._id,
      date: newExtendDate,
      extended: true,
      status: "ACTIVE",
    };
    axiosApi("admin/extend-project", postData)
      .then((resp: any) => {
        console.log({ resp });
        if (resp.data.success === false) {
          notif(" This project cant extend");
        } else {
          notif("This Project  is Extended");
          setStatus("ACTIVE");
        }
      })
      .catch((reqErr) => {
        notif(" This project cant extend");
        console.log({ reqErr });
      });
  };
  return (
    <div className="page-content">
      <div className="container-fluid">
        <Card>
          <CardHeader>
            <CardTitle className="mb-0 " style={{ fontWeight: "bold" }}>
              Project Details
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div>
              <div className="pb-3">
                <Row>
                  <Col xl={2}>
                    <div>
                      <h5 className="font-size-15">Name :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{data.name}</p>
                </Row>
              </div>
              <div className="pb-3">
                <Row>
                  <Col xl={2}>
                    <div>
                      <h5 className="font-size-15">Name In Arabic:</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{data.name_ar}</p>
                </Row>
              </div>
              {/* <div className="pb-3">
                <Row>
                  <Col xl={2}>
                    <div>
                      <h5 className="font-size-15">Status :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{status}</p>
                </Row>
              </div> */}
              {categories && (
                <div className="pb-3">
                  <Row>
                    <Col xl={2}>
                      <div>
                        <h5 className="font-size-15">Categories:</h5>
                      </div>
                    </Col>
                    <Col>
                      {categories.map((d: any, idx: any) => (
                        <p key={idx}>{d.name}</p>
                      ))}
                    </Col>
                  </Row>
                </div>
              )}
              <div className="pb-3">
                <Row>
                  <Col xl={2}>
                    <div>
                      <h5 className="font-size-15">Budget :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{data.budget}</p>
                </Row>
              </div>
              <div className="pb-3">
                <Row>
                  <Col xl={2}>
                    <div>
                      <h5 className="font-size-15">Submission Date :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{submitionDate}</p>
                </Row>
              </div>
              <div className="pb-3">
                <Row>
                  <Col xl={3}>
                    <div>
                      <h5 className="font-size-15">Total Sponsor Amount :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{data.sponsor_amount}</p>
                </Row>
              </div>
              <div className="pb-3">
                <Row>
                  <Col xl={3}>
                    <div>
                      <h5 className="font-size-15">Total Sponsor Count :</h5>
                    </div>
                  </Col>
                  <p className="col-xl">{data.sponsor_count}</p>
                </Row>
              </div>
            </div>
            {
              <div className="pb-3">
                <Row>
                  <Col xl={2}>
                    <div>
                      <h5 className="font-size-15">Status :</h5>
                    </div>
                  </Col>

                  <p className="col-xl-2">{status}</p>
                  {status === "EXPIRED" && (
                    <p className="col-xl-2">
                      {expireDate} <br />
                      <span style={{ fontSize: ".7rem", color: "red" }}>
                        Expire Date
                      </span>{" "}
                    </p>
                  )}
                  {status === "ACTIVE" && extendDate && (
                    <p className="col-xl-2">
                      {extendDate} <br />
                      <span style={{ fontSize: ".7rem", color: "green" }}>
                        Extended Date
                      </span>{" "}
                    </p>
                  )}
                  {(status === "ACTIVE" || status === "INACTIVE") && (
                    <Col xl={2} sm={2}>
                      {status === "ACTIVE" ||
                      status === "CLOSED" ||
                      status === "QUEUE" ? (
                        <Button
                          color="danger"
                          onClick={() =>
                            submit(
                              changeStatus,
                              "Do you want to change project status?"
                            )
                          }
                        >
                          Inactivate
                        </Button>
                      ) : (
                        <Button
                          color="success"
                          onClick={() =>
                            submit(
                              changeStatus,
                              "Do you want to change project status?"
                            )
                          }
                        >
                          Activate
                        </Button>
                      )}
                    </Col>
                  )}
                  {status === "INACTIVE" && (
                    <Col xl={3}>
                      <Row>
                        <ButtonGroup>
                          <Button
                            className="col-6"
                            style={{
                              width: "70px",
                              paddingLeft: "10px",
                            }}
                            color="danger"
                            onClick={() =>
                              submit(
                                () => expireProject(true, "EXPIRED"),
                                `Do you want to expire this project ${data.name}?`
                              )
                            }
                          >
                            Expire
                          </Button>
                          <Button
                            className="col-6"
                            style={{
                              width: "70px",
                              paddingLeft: "10px",
                            }}
                            onClick={() =>
                              submit(
                                extendProject,
                                "Do yo want to extend this project"
                              )
                            }
                          >
                            Extend
                          </Button>
                        </ButtonGroup>
                      </Row>
                    </Col>
                  )}
                  {documents.length !== 0 && (
                    <Card className="mt-3">
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
                </Row>
              </div>
            }
          </CardBody>
        </Card>
        {sponsorships.length !== 0 && (
          <Card>
            <CardHeader>
              <CardTitle style={{ fontWeight: "bold" }}>
                {" "}
                Sponsorships
              </CardTitle>
            </CardHeader>
            <CardBody>
              <SimpleTable
                columns={columns}
                data={sponsorships}
                loading={loading}
                pageCount={pageCount}
              />
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ProjectDetails;
