import React, { useEffect, useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
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

function PriceMatix() {
  const [isEditFees, setIsEditFees] = useState<boolean>(false);
  const [isEditFeesPercentage, setIsEditFeesPercentage] =
    useState<boolean>(false);
  const [fixedFees, setfixedFees] = useState<any>(0);
  const [percentageFees, setPercentageFees] = useState<any>(0);
  const [data, setData] = useState<any>({});

  const [alert, setAlert] = useState<any>("");

  useLayoutEffect(() => {
    axiosApi("/admin/get-fees", {})
      .then((response: any) => {
        console.log({ response });
        setfixedFees(response.data.data[0].fixedFees);
        setPercentageFees(response.data.data[0].percentageFees);
        setData(response.data.data[0]);
        if (response.data.success === false) {
          setAlert(response.data.message);
        } else {
          setAlert(false);
        }
      })
      .catch((err) => {
        setAlert(err.data.message);
      });
  }, []);
  const changeFixedFees = () => {
    console.log({ fixedFees });
    //const confirm=window.confirm('Do you want to change Fixed Fees')

    axiosApi("/admin/change-fixedfees", { fixed_fee: fixedFees })
      .then((result: any) => {
        if (result.data.success === false) {
          setAlert(result.data.message);
        } else {
          setAlert(false);
        }

        console.log(result);
      })
      .catch((error) => {
        setAlert(error.data.message);
      });
  };
  const changePercentageFees = () => {
    console.log({ percentageFees });
    // const confirm=window.confirm('Do you want to change Percentage Fees')

    axiosApi("/admin/change-percentagefees", { percentage_fee: percentageFees })
      .then((result: any) => {
        if (result.data.success === false) {
          setAlert(result.data.message);
        } else {
          setAlert(false);
          console.log(result);
        }
      })
      .catch((error) => {
        setAlert(error.data.message);
      });
  };
  return (
    <div className="page-content">
      <div className="container-fluid">
      
        <Card>
          <CardBody>
            {alert && <Alert color="danger">{alert}</Alert>}
            <CardBody>
              <Row>
                <p className="col-xl-2 col-md-3">Fixed Fees (KWD) :</p>
                <ButtonGroup className="col-xl-5 col-md-12">
                  <Input
                    disabled={!isEditFees}
                    onChange={(e) => setfixedFees(e.target.value)}
                    value={fixedFees}
                  ></Input>
                  {!isEditFees ? (
                    <Button style={{width:'90px'}} onClick={() => setIsEditFees(true)}>Edit</Button>
                  ) : (
                    <Button
                    style={{width:'90px'}} 
                      onClick={() => {
                      submit(
                          () => changeFixedFees(),
                          "Are you sure to change Fixed fees",()=>setfixedFees(data.fixedFees)
                        )
                        setIsEditFees(false);
                      }}
 
                     
                    >
                      Submit
                    </Button>
                  )}
                </ButtonGroup>
              </Row>
            </CardBody>
            <CardBody>
              <Row>
                <p className="col-xl-2 col-md-3">Percentage Fees (%):</p>
                <ButtonGroup className="col-xl-5 col-md-12">
                  <Input
                    onChange={(e) => setPercentageFees(e.target.value)}
                    disabled={!isEditFeesPercentage}
                    value={percentageFees}
                  />
                  {!isEditFeesPercentage ? (
                    <Button style={{width:'90px'}}  onClick={() => setIsEditFeesPercentage(true)}>
                      Edit
                    </Button>
                  ) : (
                    <Button
                    style={{width:'90px'}} 
                      onClick={() => {
                        submit(
                           changePercentageFees,
                          "Are you sure to change Percentage fees",()=>setPercentageFees(data.percentageFees)
                        );

                        setIsEditFeesPercentage(false);
                      }}
                    
                    >
                      Submit
                    </Button>
                  )}
                </ButtonGroup>
              </Row>
            </CardBody>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default PriceMatix;
