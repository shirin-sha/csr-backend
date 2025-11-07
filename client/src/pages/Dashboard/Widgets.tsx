import React from "react";
import { Card, CardBody, Col, Row } from "reactstrap";

import { WidgetsData } from "../../common/data/dashboard";

//import countup
import CountUp from "react-countup";

//import Charts
import ReactApexChart from "react-apexcharts";

const Widgets = ({ options }: any) => {
  return (
    <React.Fragment>
      {(WidgetsData || []).map((widget: any, key: number) => (
        <Col xl={3} md={6} key={key}>
          <Card className="card-h-100"  style={{background:widget["colorChange"]  ? '#525251' :'#9E8959',color:'white',border:'0' }}>
            <CardBody>
              <Row className="align-items-center">
                <Col xs={6}>
                  <span style={{fontSize:'1rem',fontWeight:'bolder'}} className=" mb-3 lh-1 d-block text-truncate">
                    {widget["title"]}
                  </span>
                  <h4 className="mb-3">
                    {widget["isDoller"] === true ? "$" : ""}
                   
                  </h4>
                </Col>
                <Col xs={12} style={{display:'flex',justifyItems:'end'}}>
                <span style={{fontSize:'2.5rem',fontWeight:'bolder',marginLeft:'auto'}}  className="counter-value ">
                      <CountUp start={0} end={widget["price"]} duration={12} />
                      {widget["postFix"]}
                    </span>
                </Col>
               
              </Row>
              
            </CardBody>
          </Card>
        </Col>
      ))}
    </React.Fragment>
  );
};

export default Widgets;
