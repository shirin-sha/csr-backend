import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./project.css";
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

function OurProject() {
  const history = useHistory();
  document.title = "Our Projects ";
  const [data, setData] = useState([]);
  const [openMOdal, setOpenModal] = useState(false);
  const [openEditMode, setOpenEditMode] = useState(false);

  const [alert, setAlert] = useState<any>();
  const [file, setFile] = useState<any>();
  const [editImage, setEditImage] = useState<any>();

  const [formData, setFormData] = useState<any>({});
  const [EditableData, setEditableData] = useState<any>({});
  console.log("eeeeeeeeeeee", EditableData);
  const [catName, setCatName] = useState<any>({});
  useEffect(() => {
    if (EditableData?.category?.length > 0) {
      setCatName(EditableData?.category[0].name);
      // setCatName()
    }
  }, [EditableData]);
  console.log("setCat", catName);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);
  // get current posts
  console.log("data", data);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = data.slice(indexOfFirstPost, indexOfLastPost);
  console.log("currentPosts", currentPosts);
  //
  // pagination

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(data.length / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);
  //
  const [next, setNext] = useState(currentPage);
  const nextpage = () => {
    setCurrentPage(currentPage + 1);
  };

  useEffect(() => {
    axiosApi("/admin/get-ourProject", {})
      .then((response: any) => {
        console.log("data : ", response.data);
        setData(response?.data?.data?.information);
      })
      .catch((err) => {
        console.log({ err });
      });
  }, [formData, EditableData]);

  const editButtonHandler = (data: any) => {
    setEditableData(data);
    setOpenEditMode(!openEditMode);
    setEditImage(data.img);
    console.table({ openEditMode, openMOdal });
  };

  const deleteButtonHandler = (id: any) => {
    console.log("delete clicked");
    console.log("dd", id);
    axiosApi("/admin/ourProject-delete", { id }).then((resp: any) => {
      console.log("resp", { resp });
      console.log("sucess", resp.data.success);

      if (resp.data.success == true) {
        data.splice(
          data.findIndex(({ _id }) => _id == id),
          1
        );
        console.log("dataslice", data);
        window.location.reload();
        // const deletedata=data.find(({_id }) => _id === id)
        // console.log("deletedata",deletedata);
        // deletedata.pop()
      } else {
        console.log("not true");
      }
    });
  };

  console.log("EditableDataEditableData", EditableData);
  console.log("category", EditableData?.category);

  const onclickHandler = () => {
    const newFormData = new FormData();
    console.log("images name", formData.image);
    console.log("form data got ", formData);
    if (
      formData === null ||
      !formData.image ||
      formData.heading === undefined ||
      formData.description === undefined ||
      !formData.category ||
      formData.category.length == 0
    ) {
      setAlert("All fields are required");
    } else {
      console.log("form data got all ");

      newFormData.append("heading", formData.heading);
      newFormData.append("description", formData.description);
      newFormData.append("image", formData.image);
      newFormData.append("category", formData.category);

      console.log("formdata: ", { ...newFormData });

      axios
        .post("admin/post-ourProject", newFormData)
        .then((resp: any) => {
          console.log({ file });

          console.log("added", formData);
          console.log("addproject", { resp });

          if (resp.data.success === false) {
            console.log("false");

            setAlert(resp.data.message);
            console.log({ alert });
          } else if (resp.data.success === true) {
            console.log("true");

            const arr: any = [...data];
            arr.push(formData);
            setData(arr);
            setOpenModal(!openMOdal);
            setAlert("");
            setFormData({});
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  console.log("ffffffffffffff", formData);

  const updateHandler = () => {
    const newFormData = new FormData();

    newFormData.append("heading", EditableData.heading);
    newFormData.append("description", EditableData.description);
    newFormData.append("image", EditableData.image);
    newFormData.append("_id", EditableData._id);
    newFormData.append("prevImg", editImage);
    newFormData.append("category", EditableData.category);
    console.log("eeeeedformdata: ", EditableData);

    axios
      .post("admin/edit-ourProject", newFormData)
      .then((resp: any) => {
        console.log({ file });

        console.log("edit", { resp });

        if (resp.data.success === false) {
          setAlert(resp.data.message);
          console.log({ alert });
        } else if (resp.data.success === true) {
          const arr: any = [...data];

          setOpenEditMode(!openEditMode);
          setAlert("");
          setEditableData({});
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const cancelFunc = () => {
    setOpenModal(!openMOdal);

    setFormData(null);
  };
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    axios
      .post("/public/get-categories")
      .then((response: any) => {
        console.log("categorydata : ", response.data);
        setCategories(response.data.categories);
      })
      .catch((err) => {
        console.log({ err });
      });
  }, []);

  return (
    <div className="page-content">
      <div className="container-fluid">
        <CardHeader>
          <Row>
            <CardTitle className="col-xl-10 mt-2">
              <h5>Our Projects</h5>
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
            {currentPosts &&
              currentPosts.map((d: any, idx: any) => (
                <Card
                  key={d._id}
                  className="col-md-4 col-sm-2 m-2"
                  style={{ width: "300px" }}
                >
                  <CardImg
                    top
                    width="100%"
                    height={"210px"}
                    src={`/admin/get-ourProject/${d.img}`}
                    // src={`http://localhost:8000/admin/get-ourProject/${d.img}`}

                    alt="Card image cap"
                    // className="img-fluid"
                  />

                  <CardBody>
                    <CardTitle style={{ fontWeight: "bold" }}>
                      {d.heading}
                    </CardTitle>
                    <CardText
                      style={{ maxHeight: "100px", overflow: "hidden" }}
                    >
                      {d.description}
                    </CardText>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <Button onClick={() => editButtonHandler(d)}>Edit</Button>
                      <div>
                        {" "}
                        <Button
                          onClick={() =>
                            submit(
                              () => deleteButtonHandler(d._id),
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
      <div className="pagination">
        {pageNumbers.map((number) => (
          <span key={number}>
            <a
              className={currentPage == number ? "active" : ""}
              onClick={() => paginate(number)}
            >
              {number}
            </a>
          </span>
        ))}
        {currentPosts.length == 6 && <a onClick={nextpage}>&raquo;</a>}
      </div>
      <Modal
        style={{ width: "602px !important", height: "676px" }}
        isOpen={openMOdal}
        backdrop={"static"}
      >
        <ModalHeader className="m-auto">Add Project</ModalHeader>

        <ModalBody className=" p-4">
          {alert && <Alert color="danger">{alert}</Alert>}
          <Row className="pb-2">
            <Col md={10}>
              <Input
                type="file"
                accept="image/x-png,image/gif,image/jpeg"
                onInput={(e) => {
                  console.log("file inputed");

                  const file: any = (e as any).currentTarget.files[0];
                  const obj = { ...formData };
                  obj.image = file;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
                name="image"
                placeholder="Upload Image"
              />
            </Col>
          </Row>
          <Row className="pb-2">
            <Col md={10}>
              <Input
                value={formData.heading}
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...formData };
                  obj.heading = value;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
                name="heading"
                placeholder="Heading"
              />
            </Col>
          </Row>
          <Row className="pb-2">
            <Col md={10}>
              <Input
                value={formData.description}
                name="description"
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...formData };
                  obj.description = value;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
                placeholder="Description"
                type="textarea"
              />
            </Col>
          </Row>
          <Row className="pb-2">
            <Col md={10}>
              <Input
                type="select"
                value={formData.category}
                name="category"
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...formData };
                  obj.category = value;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
              >
                <option value="" key="">
                  select a category
                </option>
                {categories?.map((cat: any) => {
                  console.log("project category", cat);

                  return (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  );
                })}
              </Input>
              {/* <select className=projectcat>
              <option value="" key="">select a category</option>
              {
										categories?.map((cat :any) => {
											return (<option key={cat._id} value={cat._id}>{cat.name}</option>)

										})
									}
								</select> */}
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

      {/* edit button */}

      <Modal
        style={{ width: "602px !important", height: "676px" }}
        isOpen={openEditMode}
        backdrop={"static"}
      >
        <ModalHeader className="m-auto">Edit Project</ModalHeader>

        <ModalBody className=" p-4">
          {alert && <Alert color="danger">{alert}</Alert>}
          <Row className="pb-2">
            <Col md={10}>
              {/* <img  height={'100px'} src={`/admin/get-ourProject/${editImage}`} alt="" /> */}
              <Input
                type="file"
                width={"200px"}
                height={"300px"}
                accept="image/x-png,image/gif,image/jpeg"
                onInput={(e) => {
                  console.log("file Inputted");

                  const file: any = (e as any).currentTarget.files[0];
                  const obj = { ...EditableData };
                  obj.image = file;
                  console.log({ obj });

                  setEditableData({ ...obj });
                }}
                name="image"
                placeholder="Upload Image"
              />
            </Col>
          </Row>
          <Row className="pb-2">
            <Col md={10}>
              <Input
                defaultValue={EditableData.heading}
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...EditableData };
                  obj.heading = value;
                  console.log({ obj });

                  setEditableData({ ...obj });
                }}
                name="heading"
                placeholder="Heading"
              />
            </Col>
          </Row>
          <Row className="pb-2">
            <Col md={10}>
              <Input
                defaultValue={EditableData.description}
                name="description"
                height={"maxHeight"}
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...EditableData };
                  obj.description = value;
                  console.log({ obj });

                  setEditableData({ ...obj });
                }}
                placeholder="Description"
                type="textarea"
              />
            </Col>
          </Row>
          <Row className="pb-2">
            <Col md={10}>
              <Input
                type="select"
                name="category"
                defaultValue={catName}
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...EditableData };
                  obj.category = value;
                  console.log({ obj });

                  setEditableData({ ...obj });
                }}
              >
                <option value="" key="">
                  {catName ? catName : "select category"}
                </option>
                {categories?.map((cat: any) => {
                  console.log("project category", cat);

                  return (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  );
                })}
              </Input>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              setOpenEditMode(!openEditMode);
              // setAlert(false);
              setFormData({});
              console.table({ openEditMode, openMOdal });
            }}
            color="danger"
          >
            Cancel
          </Button>
          <Button onClick={updateHandler}>Add</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
OurProject.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default OurProject;
