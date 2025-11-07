/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";

//import Breadcrumbs
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Row,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
  Alert,
} from "reactstrap";
import SimpleTable from "src/components/SimpleTable";
import { useFormik } from "formik";
import { axiosApi } from "src/common/axiosConfig";
import { add } from "lodash";
import * as Yup from 'yup'
import { ToastContainer, toast } from 'react-toastify';
import {submit} from "src/common/confirmPopup"
const AddAdmin = () => {
  document.title = "Add Admins ";
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState(0);
  const [openMOdal, setOpenModal] = useState(false);
  const [alert, setAlert] = useState<any>();
  
  const listadmin=()=>{
    axiosApi("admin/get-admins", {}).then((response: any) => {
      console.log({ response });
      setData(response.data.data);
    });
  }
  useEffect(() => {
    listadmin();
  }, []);

  const deleteAdmin=(id:any)=>{
console.log("id",id);
axiosApi("admin/deleteAdmin",{id}).then((data:any)=>{
  console.log(data);
  if(data?.data?.success){
    toast.success("successfully Deleted")
    listadmin();
  }
  else{
    toast.error(data?.data?.msg)
  }
})
  }
  const registerSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required'),
    password: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    role:Yup.number()
  })

  const resetForm = () => {
    formik.setValues({
      name: "",
      password: "",
      role: 0,
      email: "",
    });
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      password: "",
      email: "",
      role: 0,
    },
  
    onSubmit: (values) => {
  
      axiosApi("admin/register", values)
        .then((resp: any) => {
          console.log("added", values);
          console.log({ resp });

          if (resp.data.success === false) {
            setAlert(resp.data.message);
            console.log({ alert });
          } else if (resp.data.success === true) {
            const newArray = [...data];
            newArray.push(resp.data.data[0]);
            setData(newArray);
            setAlert(false);
            setOpenModal(!openMOdal);
            formik.setValues({
              name: "",
              password: "",
              role: 0,
              email: "",
            });
            listadmin();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  });
  const roles: any = {
    0: "Super Admin",
    10: "Applicant Master",
    20: "Sponsor Master",
    30: "Event Organizer Master",
    40: "Project Master",
  };
  
  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Email",
        accessor: "email",
      },

      {
        Header: "Role",
        accessor: "role",
        Cell: (props: any) => {
          const admin = props.row.original;
console.log(admin);

          return roles[admin.role];
        },
      },
      {
        Header:"Action",
        accessor:"delete",
        Cell:(props:any)=>{
          const admin=props.row.original;
          return(
            <Button
            onClick={() =>
              submit(
                () => deleteAdmin(admin?._id),
                "Are You Sure to Delete the Project ?"
              )
            }
          >
            Delete
          </Button>
//             <Button onClick={()=>
//               submit(
//                 () => deleteAdmin(admin?._id)},
//                 "Are You Sure to Delete the Project ?"
//               )
//             >
// delete
//             </Button>
          )
        }
      }
     
    ],
    []
  );
  return (
    <React.Fragment>
      <div className="page-content">
      <ToastContainer/> 
        <Container fluid>
          <CardHeader>
            <Row>
              <CardTitle className="col-xl-10 mt-2">
                <h5>Add Admin</h5>
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
          <Card style={{ paddingLeft: "3rem", paddingRight: "3rem" }}>
            <CardBody>
              <SimpleTable
                columns={columns}
                data={data}
                loading={loading}
                pageCount={pageCount}
              />
            </CardBody>
            <Modal
              style={{ width: "602px !important", height: "676px" }}
              isOpen={openMOdal}
              backdrop={"static"}
              onClosed={() => {
                resetForm(); // Reset the form values when the modal is closed
                setAlert(false);
              }}
            >
              <ModalHeader className="m-auto">Add Admin</ModalHeader>
              <Form onSubmit={formik.handleSubmit}>
                <ModalBody className=" p-4">
                  {alert &&<Alert color="danger">{alert }</Alert>}
                  <Row className="pb-2">
                    <Col className="pl-3" md={3}>
                      <Label htmlFor="name" className="mt-2 ">
                        Name
                      </Label>
                    </Col>
                    <Col md={8}>
                      <Input
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        name="name"
                        placeholder="Name"
                      />
                    </Col>
                  </Row>
                  <Row className="pb-2">
                    <Col className="pl-3" md={3}>
                      <Label htmlFor="email" className="mt-2 ">
                        Email
                      </Label>
                    </Col>
                    <Col md={8}>
                      <Input
                        value={formik.values.email}
                        name="email"
                        onChange={formik.handleChange}
                        placeholder="Email"
                        type="email"
                      />
                    </Col>
                  </Row>
                  <Row className="pb-2">
                    <Col className="pl-3" md={3}>
                      <Label htmlFor="password" className="mt-2 ">
                        Password
                      </Label>
                    </Col>
                    <Col md={8}>
                      <Input
                        value={formik.values.password}
                        name="password"
                        onChange={formik.handleChange}
                        placeholder="*****"
                        type="password"
                      />
                    </Col>
                  </Row>
                  <Row className="pb-2">
                    <Col className="pl-3" md={3}>
                      <Label htmlFor="role" className="mt-2 ">
                        Role
                      </Label>
                    </Col>
                    <Col md={8}>
                      <Input
                        name="role"
                        onChange={formik.handleChange}
                        type="select"
                        // value={"Applicant Master"}
                      >
                        <option value={0}>Super Admin</option>
                        <option value={10}>Applicant Master</option>
                        <option value={20}>Sponsor Master</option>
                        <option value={30}>Event organizer Master</option>
                        <option value={40}>Project Master</option>
                      </Input>
                    </Col>
                  </Row>
                </ModalBody>
                <ModalFooter>
                  <Button
                    onClick={() => {
                      setOpenModal(!openMOdal);
                      setAlert(false);
                    }}
                    color="danger"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add</Button>
                </ModalFooter>
              </Form>
            </Modal>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AddAdmin;
