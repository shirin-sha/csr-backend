/* eslint-disable @typescript-eslint/ban-types */
import React from "react";

//import Breadcrumbs
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from "reactstrap";
import Widgets from "./Widgets";
import Line from "./linechart";
import LineCharts from "./linechart";

const Dashboard = () => {
  document.title = "Dashboard ";
  const options: Object = {
    chart: {
      height: 50,
      type: "line",
      toolbar: { show: false },
    },
    colors: [""],
    stroke: {
      curve: "smooth",
      width: 0,
    },
    xaxis: {
      labels: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName: any) {
            return "";
          },
        },
      },
      marker: {
        show: false,
      },
    },
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Widgets options={options} />
          </Row>
          <Col xl={12}>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">Analysis Chart</h4>
                </CardHeader>
                <CardBody>
                  <LineCharts />
                </CardBody>
              </Card>
            </Col>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
