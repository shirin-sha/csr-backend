/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";


import { Link ,useHistory} from "react-router-dom"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi } from "src/common/axiosConfig";
import {
  Button,
} from "reactstrap";
import Table from "src/components/Table";
import Index from "../editSponserDetails";


function Sponsors() {
  document.title = "Data Tables ";
  const [data, setData] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState(0);
  const [activeStatus, setActiveStatus] = React.useState<any>(); 
  const [enableFiltration,setEnableFiltration]=useState<any>(1)
  const [typeStatus, setTypeStatus] = React.useState<any>();
 

  interface conditionInterface {
    activated?: any;
    type?: any;
  }
  const [condition, setCondition] = useState<conditionInterface>({});
  const fetchIdRef = React.useRef(0);
const history=useHistory()
  const columns = React.useMemo(
    () => [
      {
        Header: "Sponsor Type",
        accessor: "type",
        Cell: (props: any) => {
          const value = props.row.original;
          return value.type === 0 ? "Conventional" : "Islamic";
        },
      },
      {
        Header: "Name",
        accessor: "company_name",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Mobile",
        accessor: "mobile",
      },
      {
        Header: "Account Activation",
        accessor: "activated",
        Cell: (props) => {
          const value = props.row.original;
          if (value.activated === null) {
            return (<p style={{color:'red'}}>Not Activated</p>);
          }
          return new Date(value.activated).toLocaleDateString();
        },
      },
      {
        Header: "Action",
        accessor: "details",
        Cell: (props) => (
          <>
            <Button color="link" onClick={() => onclick(props.row.original._id)}>View Details</Button>
           
          </>
        )
        ,
      },
      {
        Header: "",
        accessor: "block",
        Cell: (props)=> {
          const value = props.row.original;
          console.log('value:',value);
          
          if (value.blocked === true) {
            return (<p style={{color:'red'}}>Blocked</p>);
          }
          return '';
        },
      },
    ],
    []
  );
  const onclick=(id:any)=>{
    console.log('clicked');
    console.log('id from list :',id);
    
    history.push({pathname:'/sponsor-details',state:id})
   }
  const fetchData = React.useCallback(({ pageSize, pageIndex }: any) => {
    console.log({ pageSize, pageIndex });

    const fetchId = ++fetchIdRef.current;
    setLoading(true);

    axiosApi("admin/list-sponsors", {
      limit: pageSize,
      page: pageIndex + 1,
      condition
    }).then((resp: any) => {
      if (fetchId === fetchIdRef.current) {
        console.log("resp:", resp);
        console.log("page :", pageIndex + 1, "limit:", 10);
        if (resp.data.data) {
          const count = resp.data.data.count;
          console.log("count", count / pageSize);
          setData(resp.data.data.sponsors);
          setPageCount(Math.ceil(count / pageSize || 1));
        } else {
          const count = 0;
          setData([]);
          setPageCount(0);
        }
      
      }
    });

    setLoading(false);
  }, [condition]);

  return (
    <div className="page-content">
      <div className="container-fluid">
       
        <Table
          columns={columns}
          data={data}
          fetchData={fetchData}
          loading={loading}
          pageCount={pageCount}
          condition={condition}
          setCondition={setCondition}
          activeStatus={activeStatus}         
          setActiveStatus={setActiveStatus}
          enableFiltration={enableFiltration}
          setTypeStatus={setTypeStatus}
           typeStatus={typeStatus}
         
        />
      </div>
    </div>
  );
}
Sponsors.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default Sponsors;
