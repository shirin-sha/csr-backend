import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi } from "src/common/axiosConfig";
import { Button, ButtonGroup, Row } from "reactstrap";

import { Link, useHistory } from "react-router-dom";
import Table from "src/components/Table";

function Projects() {
  const [rSelected, setRSelected] = useState<any>(1);
  const history = useHistory();
  document.title = "Data Tables ";
  const [data, setData] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState(0);
  const fetchIdRef = React.useRef(0);
  const [condition, setCondition] = useState<any>({});
  //const [count, setCount] = useState<any>();

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Name In Arabic",
        accessor: "name_ar",
      },

      {
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "Budget",
        accessor: "budget",
      },
      {
        Header: "Sponsor Count",
        accessor: "sponsor_count",
      },

      {
        Header: "Action",
        accessor: "details",
        Cell: (props: any) => (
          <Button color="link" onClick={() => onclick(props.row.original._id)}>
            View Details
          </Button>
        ),
      },
    ],
    []
  );

  const onclick = (id: any) => {
    console.log("clicked");
    console.log("id from list :", id);

    history.push({ pathname: "/project-details", state: id });
  };
  const changeTable = async (value: any) => {
    setRSelected(value);
    if (value === 2) {
      await setCondition({
        $or: [
          { status: "INACTIVE" },
          { status: "EXPIRED" },
          { status: "ARCHIVE" },
        ],
      });
    }
    if (value === 1) {
      setCondition({});
    }
    if (value === 3) {
      setCondition({ $or: [{ status: "CLOSED" }, { status: "QUEUE" }] });
    }
    console.log({ rSelected });
  };
  const fetchData = React.useCallback(
    async ({ pageSize, pageIndex }: any) => {
      console.log({ pageSize, pageIndex });

      const fetchId = ++fetchIdRef.current;

      await axiosApi("admin/list-projects", {
        condition,
        limit: pageSize,
        page: pageIndex + 1,
      }).then(async (resp: any) => {
        if (resp.data.success === false) {
          setData([]);
          setPageCount(1);
        }
        setLoading(true);
        if (fetchId === fetchIdRef.current) {
          console.log("resp:", resp);
          console.log("page :", pageIndex + 1, "limit:", 2);
          if (resp.data.data) {
            const count = await resp.data.data.count;
            console.log("count", count / pageSize);
            await setData(resp.data.data.projects);
            setPageCount(Math.ceil(count / pageSize || 1));
            setPageCount(Math.ceil(count / pageSize));
            console.log({ pageCount });
            console.log(
              "len:",
              data.length,
              "count:",
              count,
              "page size:",
              pageSize
            );
          } else {
            const count = 0;
            setData([]);
            setPageCount(0);
          }
         

    
        }
      });

      setLoading(false);
    },
    [condition]
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Row style={{ padding: "10px" }}>
          <ButtonGroup>
            <Button
              outline
              onClick={() => {
                changeTable(1);
              }}
              active={rSelected === 1}
            >
              All Projects
            </Button>
            <Button
              outline
              onClick={() => {
                changeTable(2);
              }}
              active={rSelected === 2}
            >
              Inactive Projects
            </Button>
            <Button
              outline
              onClick={() => {
                changeTable(3);
              }}
              active={rSelected === 3}
            >
              Amount Exceeded Project
            </Button>
          </ButtonGroup>
        </Row>

        <Table
          columns={columns}
          data={data}
          fetchData={fetchData}
          loading={loading}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
}
Projects.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default Projects;
