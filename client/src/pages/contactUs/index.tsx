import React, { useEffect, useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";

//Import Breadcrumb
import { axiosApi, axiosDoc } from "src/common/axiosConfig";
import {
  Card,
  CardBody,
  Row,
  Button,
  Input,
  ListGroup,
  ListGroupItem,
  ButtonGroup,
  Alert,
} from "reactstrap";
import { submit } from "src/common/confirmPopup";

function contactUs() {
  const [data, setData] = useState<any>({});
  const [tempData, setTempData] = useState<any>({});

  const [isEditEmail, setIsEditEmail] = useState<boolean>(false);
  const [isEditMobile, setIsEditMobile] = useState<boolean>(false);
  const [isEditLocation, setIsEditLocation] = useState<boolean>(false);

  const [alert, setAlert] = useState<any>("");

  useLayoutEffect(() => {
    axiosApi("/admin/get-contactInfo", {})
      .then((response: any) => {
        console.log({ response });
        setData(response.data.data);
        console.log(response.data.data);
        setTempData(response.data.data);
      })
      .catch((err) => {
        setAlert(err.data.message);
      });
  }, []);
  const changeData = (type: any) => {
    console.log("changed");
    const bodyData = { ...data };

    if (type === 0) {
      setIsEditEmail(!isEditEmail);
    } else if (type === 1) {
      bodyData.contact_mobile;
      setIsEditMobile(!isEditMobile);
    } else if (type === 2) {
      bodyData.contact_location;
      setIsEditLocation(!isEditLocation);
    }
    axiosApi("admin/post-contactInfo", data)
      .then((resp) => {
        console.log({ resp });
        setData(bodyData);
      })
      .catch((err: any) => {
        console.log({ err });
      });
  };
  const closeFunc = (type: any) => {
    if (type === 0) {
      
      const value = tempData.contact_email
      const obj = { ...data };
      obj.contact_email = value;
      setData(obj);
      setIsEditEmail(!isEditEmail);
    } else if (type === 1) {
      const value = tempData.contact_mobile
      const obj = { ...data };
      obj.contact_mobile = value;
      setData(obj);
   

      setIsEditMobile(!isEditMobile);
    } else if (type === 2) {
      const value = tempData.contact_location
      const obj = { ...data };
      obj.contact_location = value;
      setData(obj);

      setIsEditLocation(!isEditLocation);
    }
  };
  return (
    <div className="page-content">
      <div className="container-fluid">
        <Card>
          {alert && <Alert color="danger">{alert}</Alert>}
          <CardBody>
            <Row>
              <ButtonGroup className="col-xl-5 col-md-12">
                <Input
                  placeholder="Email"
                  disabled={!isEditEmail}
                  value={data.contact_email}
                  onChange={(e) => {
                    const value = e.target.value;
                    const obj = { ...data };
                    obj.contact_email = value;
                    setData(obj);
                  }}
                ></Input>
                {!isEditEmail ? (
                  <Button
                    style={{ width: "90px" }}
                    onClick={() => setIsEditEmail(!isEditEmail)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    style={{ width: "90px" }}
                    onClick={() =>
                      submit(
                        () => {
                          changeData(0);
                        },
                        "Do you want to change contact email address",
                        () => closeFunc(0)
                      )
                    }
                  >
                    Submit
                  </Button>
                )}
              </ButtonGroup>
            </Row>
          </CardBody>
          <CardBody>
            <Row>
              <ButtonGroup className="col-xl-5 col-md-12">
                <Input
                  placeholder="Mobile"
                  disabled={!isEditMobile}
                  type='tel'
                  value={data.contact_mobile}
                  onChange={(e) => {
                    const value = e.target.value;
                    const obj = { ...data };
                    obj.contact_mobile = value;
                    setData(obj);
                  }}
                ></Input>
                {!isEditMobile ? (
                  <Button
                    style={{ width: "90px" }}
                    onClick={() => setIsEditMobile(!isEditMobile)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    style={{ width: "90px" }}
                    onClick={() =>
                      submit(
                        () => changeData(1),
                        "Do you want to change contact mobile number",
                        () => closeFunc(1)
                      )
                    }
                  >
                    Submit
                  </Button>
                )}
              </ButtonGroup>
            </Row>
          </CardBody>
          <CardBody>
            <Row>
              <ButtonGroup className="col-xl-5 col-md-12">
                <Input
                  placeholder="Location"
                  disabled={!isEditLocation}
                  value={data.contact_location}
                  onChange={(e) => {
                    const value = e.target.value;
                    const obj = { ...data };
                    obj.contact_location = value;
                    setData(obj);
                  }}
                />
                {!isEditLocation ? (
                  <Button
                    style={{ width: "90px" }}
                    onClick={() => setIsEditLocation(!isEditLocation)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    style={{ width: "90px" }}
                    onClick={() =>
                      submit(
                        () => changeData(2),
                        "Do you want to change contact Location",
                        () => closeFunc(2)
                      )
                    }
                  >
                    Submit
                  </Button>
                )}
              </ButtonGroup>
            </Row>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default contactUs;
