import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../OurProject/project.css";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi } from "src/common/axiosConfig";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardImg,
  CardImgOverlay,
  CardSubtitle,
  CardText,
  CardTitle,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
// import { useHistory } from "react-router";
import { Link, useHistory } from "react-router-dom";
import Table from "src/components/Table";
import { useFormik } from "formik";
import axios from "axios";
import { submit } from "src/common/confirmPopup";
import login from "src/store/auth/login/reducer";
import Categories from "../BuisnessCategories";

function Banners() {
  const history = useHistory();
  document.title = "Banners ";
  const [data, setData] = useState([]);
  const [openMOdal, setOpenModal] = useState(false);

  const [alert, setAlert] = useState<any>();

  const [formData, setFormData] = useState<any>(null);
  const listBannerimage = () => {
    axiosApi("public/listBanners", {})
      .then((response: any) => {
        console.log("data : ", response.data);
        setData(response?.data?.banners);
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  useEffect(() => {
    listBannerimage();
  }, []);
  console.log(data);

  const onclickHandler = () => {
    const newFormData = new FormData();
    if (!formData) {
      setAlert("All fields are required");
      return;
    }
    newFormData.append("img", formData);
    newFormData.append("alt", "banner");

    console.log("formdata: ", formData);

    axiosApi("admin/addBanner", newFormData)
      .then((resp: any) => {
        console.log("12dd", resp);

        if (resp.data.success === false) {
          setAlert(resp.data.message);
          console.log({ alert });
        } else if (resp.data.success === true) {
          const arr: any = [...data];
          arr.push(formData);
          setData(arr);
          setOpenModal(!openMOdal);
          setAlert("");
          setFormData({});
          listBannerimage();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteButtonHandler = (id: any) => {
    console.log("delete clicked", id);
    axiosApi("/admin/deleteBanner/", { id }).then((data) => {
      console.log(data);
      listBannerimage();
    });
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <CardHeader>
          <Row>
            <CardTitle className="col-xl-10 mt-2">
              <h5>Banners</h5>
            </CardTitle>
            <Button
              style={{ width: "6rem" }}
              onClick={() => setOpenModal(!openMOdal)}
              className="col-xl-2 "
            >
              Add
            </Button>
          </Row>
        </CardHeader>
        <div className="container-fluid">
          <Row>
            {data &&
              data.map((item: any, idx: any) => (
                <Card
                  key={item._id}
                  className="col-md-4 col-sm-2 m-2"
                  style={{ width: "300px" }}
                >
                  <CardImg
                    top
                    width="100%"
                    height={"210px"}
                    src={`/admin/get-ourProject/${item.imageUrl}`}
                    alt={item?.alt}
                  />

                  <CardBody>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <div>
                        {" "}
                        <Button
                          onClick={() =>
                            submit(
                              () => deleteButtonHandler(item?._id),
                              "Are You Sure to Delete the Project ?"
                            )
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
          </Row>
        </div>
      </div>
      {/* pagination */}

      <Modal
        style={{ width: "602px !important", height: "676px" }}
        isOpen={openMOdal}
        backdrop={"static"}
      >
        <ModalHeader className="m-auto">Add Banner</ModalHeader>

        <ModalBody className=" p-4">
          {alert && <Alert color="danger">{alert}</Alert>}
          <Row className="pb-2">
            <Col md={10}>
              <Input
                type="file"
                accept="image/x-png,image/gif,image/jpeg"
                multiple={false}
                onChange={(e) => {
                  const file: any = (e as any).currentTarget.files[0];
                  console.log("filex44", file);

                  setFormData(file);
                }}
                name="img"
                placeholder="Upload Image"
              />
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              setOpenModal(!openMOdal);
              setFormData({});
              setAlert(false);
            }}
            color="danger"
          >
            Cancel
          </Button>
          <Button onClick={onclickHandler}>Add</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
Banners.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default Banners;
