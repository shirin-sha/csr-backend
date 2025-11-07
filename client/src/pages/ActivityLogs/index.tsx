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
import axios from "axios";
// import dayjs from "dayjs";
// import tz from 'dayjs/plugin/timezone'

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";


function ActivityLogs() {
  const history = useHistory();
  document.title = "Inquiries ";
  const [data, setData] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState(0);
  const fetchIdRef = React.useRef(0);
  const [viewDetails, setViewDetails] = useState<any>({});
  const [openMOdal, setOpenModal] = useState(false);
  dayjs.extend(timezone);
  dayjs.extend(utc);
  dayjs.tz.setDefault("Asia/Kuwait");

  const columns = React.useMemo(
    () => [
      {
        Header: "Date",
        accessor: "timestamp",
        Cell: (props: any) => {
          const viewData = props.row.original;
          console.log({ viewData });
          return <p>{dayjs(viewData?.timestamp).format("DD/MM/YYYY")}</p>;
        },
      },
      {
        Header: "Time",
        accessor: "",
        Cell: (props: any) => {
          const viewData = props.row.original;
          console.log({ viewData });
          return <p>{dayjs(viewData?.timestamp).tz("Asia/Kuwait").format("HH:mm")}</p>;
        },
      },

      {
        Header: "Admin Name",
        accessor: "adminId",
        Cell: (props: any) => {
          const viewData = props.row.original;
          console.log({ viewData });
          return <p>{viewData?.adminInfo?.name}</p>;
        },
      },
      {
        Header: "Activity",
        accessor: "action",
        Cell: (props: any) => {
          const viewData = props.row.original;
          console.log({ viewData });
          return <p>{viewData?.meta?.action}</p>;
        },
      },
      {
        Header: "Activity Details",
        accessor: "message",
        // Cell: (props: any) => {
        //   const viewData = props.row.original;
        //   console.log({ viewData });
        // },
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
    // axiosApi("http://localhost:8000/admin/listLogs", {
    //   limit: pageSize,
    //   page: pageIndex + 1,
    // })
    axiosApi(
      `/admin/listLogs?limit=${pageSize}&page=${
        pageIndex + 1
      }`,
      null
    ).then(async (resp: any) => {
      console.log({ resp  },"listlog");

      if (fetchId === fetchIdRef.current) {
        console.log("resp:", resp);
        console.log("page :", pageIndex + 1, "limit:", 10);
        console.log("count :", resp.data.count);

        const count: any = (await resp.data.length ) || 0;
        console.log({ count });

        console.log("count", count / pageSize);

       console.log("listlog Data",resp.data.logs);

        setData(resp.data.logs);
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
ActivityLogs.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default ActivityLogs;
