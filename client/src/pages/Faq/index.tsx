import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi } from "src/common/axiosConfig";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
// import { useHistory } from "react-router";
import { Link, useHistory } from "react-router-dom";
import Table from "src/components/Table";
import axios from "axios";
import FaqDropdown from "./Collapse";
import Icon from "@ailibs/feather-react-ts";
import {submit} from '../../common/confirmPopup'

function Faq() {
  const history = useHistory();
  document.title = "Inquiries ";
  const [data, setData] = useState([]);
  const [faqs, setFaqs] = useState([]);

  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState(0);
  const fetchIdRef = React.useRef(0);
  const [viewDetails, setViewDetails] = useState<any>({});
  const [openMOdal, setOpenModal] = useState(false);
  const [openFormMOdal, setOpenFormModal] = useState(false);

  const [formData, setFormData] = useState<any>({});
  const [alert, setAlert] = useState<any>();
useEffect(()=>{
  axiosApi('/admin/get-faq',{}).then((resp: any) => {
       
        console.log({ resp });

        if (resp.data.success === false) {
          setAlert(resp.data.message);
          console.log({ alert });
        } else if (resp.data.success === true) {
          setFaqs(resp.data.data)
          console.log({'faqs':resp});
          
        }
      })
      .catch((err) => {
        console.log(err);
      });
},[formData])

// delete faqs
const deleteFaq =(id:any)=>{
  axiosApi('/admin/remove-faq',{id}).then((resp:any)=>{
console.log('resp :',resp)
  })
}


  const onclickHandler = () => {
    //const form=new formData()
    const obj = {
      question: formData.question,
      answer: formData.answer,
    };
    setFormData({ ...obj });
    // form.append('heading',formData.heading)
    // form.append('description',formData.description)
    // form.append('submission_date',Date.now())
    // form.append('image',file)
    // console.log({form});

    axios
      .post("admin/post-faq", formData)
      .then((resp: any) => {
        console.log("added", formData);
        console.log({ resp });

        if (resp.data.success === false) {
          setAlert(resp.data.message);
          console.log({ alert });
        } else if (resp.data.success === true) {
          const arr: any = [...data];
          arr.push(formData);
          setData(arr);
          setOpenFormModal(!openFormMOdal);
          setAlert("");
          setFormData({});
        }
      })
      .catch((err) => {
        console.log(err);
      });
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
        Header: "Subject",
        accessor: "subject",
        Cell: (props: any) => {
          const viewData = props.row.original;
          console.log({ viewData });
          return (
            <p style={{ width: "100px", overflow: "hidden" }}>
              {viewData.subject}
            </p>
          );
        },
      },

      {
        Header: "Messages",
        accessor: "details",
        Cell: (props: any) => (
          <Button
            color="link"
            onClick={() => {
              const viewData = props.row.original;
              console.log({ viewData });
              setViewDetails(viewData);
              onclick(props.row.original._id);
            }}
          >
            View Messages
          </Button>
        ),
      },
    ],
    []
  );
  const onclick = (id: any) => {
    console.log("clicked");
    console.log("id from list :", id);

    setOpenModal(!openMOdal);
  };
  const fetchData = React.useCallback(({ pageSize, pageIndex }: any) => {
    console.log({ pageSize, pageIndex });

    const fetchId = ++fetchIdRef.current;
    setLoading(true);

    axiosApi("admin/get-userQuestions", {
      limit: pageSize,
      page: pageIndex + 1,
    }).then(async (resp: any) => {
      console.log({ resp });

      if (fetchId === fetchIdRef.current) {
        console.log("resp:", resp);
        console.log("page :", pageIndex + 1, "limit:", 10);
        console.log("count :", resp.data.count);

        const count: any = await resp.data.count;
        console.log({ count });

        console.log("count", count / pageSize);

        setData(resp.data.data);
        setPageCount(Math.ceil(count / pageSize));
      }
    });

    setLoading(false);
  }, []);
  const f = {
    qstn: "What does your agency do?",
    ans: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Congue proin habitant eleifend ultrices. Elementum purus dapibus. ",
  };
  return (
    <div className="page-content">
      <div className="container-fluid">
        <CardHeader>
          <Row>
            <CardTitle className="col-xl-10 mt-2">
              <h5>FAQ</h5>
            </CardTitle>
            <Button
              style={{ width: "6rem" }}
              onClick={() => setOpenFormModal(!openFormMOdal)}
              className="col-xl-2 "
            >
              Add
            </Button>
          </Row>
        </CardHeader>
        {/* body part ------ */}
        {/* FAQ listing   colapse*/}
       
          {faqs.map((faq:any,idx:any)=>{
        return ( <div key={faq._id} className="p-3" style={{width:'90%'}}> 
        <FaqDropdown onclick={()=>submit(()=>deleteFaq(faq._id),'Do you want to delete this faq')} qstn={faq.question} ans={faq.answer}></FaqDropdown>  </div>)
       
          })
          }
      
        <Table
          columns={columns}
          data={data}
          fetchData={fetchData}
          loading={loading}
          pageCount={pageCount}
        />
      </div>
      <Modal
        style={{ width: "602px !important", height: "676px" }}
        isOpen={openMOdal}
        backdrop={"static"}
      >
        <ModalHeader className="m-auto">View Details</ModalHeader>

        <ModalBody className=" p-4">
          <Row>
            <Col className="pb-2" md={6}>
              Name :
            </Col>
            <Col className="pb-2" md={6}>
              {viewDetails.name}
            </Col>
            <Col className="pb-2" md={6}>
              Email :
            </Col>
            <Col className="pb-2" md={6}>
              {viewDetails.email}
            </Col>
            <Col className="pb-2" md={3}>
              Subject :
            </Col>
            <Col className="pb-2" md={9}>
              <Card>
                <CardBody style={{ background: "#f5f5f0" }}>
                  {viewDetails.subject}
                </CardBody>
              </Card>
            </Col>
            <Col className="pb-2" md={3}>
              Message :
            </Col>
            <Col className="pb-2" md={9}>
              <Card>
                <CardBody style={{ background: "#f5f5f0" }}>
                  {viewDetails.message}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              setOpenModal(!openMOdal);
            }}
            color="danger"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        style={{ width: "602px !important", height: "676px" }}
        isOpen={openFormMOdal}
        backdrop={"static"}
      >
        <ModalHeader className="m-auto">FAQ</ModalHeader>

        <ModalBody className=" p-4">
          {alert && <Alert color="danger">{alert}</Alert>}
          <Row className="pb-2">
            <Col md={10}></Col>
          </Row>
          <Row className="pb-2">
            <Col md={10}>
              <Input
                value={formData.question}
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...formData };
                  obj.question= value;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
                name="question"
                placeholder="Question"
              />
            </Col>
          </Row>
          <Row className="pb-2">
            <Col md={10}>
              <Input
                value={formData.answer}
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...formData };
                  obj.answer = value;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
                name="answer"
                placeholder="answer"
              />
            </Col>
          </Row>
         
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              setOpenFormModal(!openFormMOdal);
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
Faq.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default Faq;
