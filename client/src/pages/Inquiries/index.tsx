import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi } from "src/common/axiosConfig";
import {
  Button,
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
// import { useHistory } from "react-router";
import { Link, useHistory } from "react-router-dom";
import Table from "src/components/Table";

function Inquiries() {
  const history = useHistory();
  document.title = "Inquiries ";
  const [data, setData] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState(0);
  const fetchIdRef = React.useRef(0);
  const [viewDetails, setViewDetails] = useState<any>({});
  const [openMOdal, setOpenModal] = useState(false);

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Mobile No",
        accessor: "mobile",
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

    axiosApi("admin/get-inquiries", {
      limit: pageSize,
      page: pageIndex + 1,
    }).then(async (resp: any) => {
      console.log({ resp });

      if (fetchId === fetchIdRef.current) {
        console.log("resp:", resp);
        console.log("page :", pageIndex + 1, "limit:", 10);
        console.log("count :", resp.data.count);

        const count: any = (await resp.data.count) || 0;
        console.log({ count });

        console.log("count", count / pageSize);

        setData(resp.data.inquiries);
        setPageCount(Math.ceil(count / pageSize));
      }
    });

    setLoading(false);
  }, []);

  return (
    <div className="page-content">
      <div className="container-fluid">
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
            <Col className="pb-2" md={6}>
              Mobile No :
            </Col>
            <Col className="pb-2" md={6}>
              {viewDetails.mobile}
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
    </div>
  );
}
Inquiries.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default Inquiries;
