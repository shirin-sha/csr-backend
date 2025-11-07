import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi, axiosDoc } from "src/common/axiosConfig";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  CardTitle,
  Alert,
  Button,
  Input,
  ListGroup,
  ListGroupItem,
} from "reactstrap";


import {submit} from '../../common/confirmPopup'
function Categories() {
  const [category, setCategory] = useState<any>([]);
  const [addCat, setAddCat] = useState<any>([]);
  const [err, setErr] = useState<any>();

  // user effect
  useEffect(() => {
    axiosApi("/admin/get-categories", {}).then((resp: any) => {
      console.log({ resp });
      setCategory(resp.data.categories);
      console.log(resp.data.categories);
      console.log({ category });
    });
  }, []);
  const addCategory = () => {
    const temp = [...category];
    const check = temp.includes({ name: addCat });
    console.log({ check });

    axiosApi("/admin/add-category", { category: addCat })
      .then((resp: any) => {
        console.log({ addCat });
        const arr = [...category];
        arr.push(resp.data.data[0]);
        setCategory(arr);
        console.log({ resp });
        setErr("");
      })
      .catch((err) => {
        console.log({ err });

        setErr("This Category is already have");
      });
  };
 
  const deleteCat = (cat: any, idx: any) => {
    axiosApi("/admin/dlt-category", { id: cat._id }).then((resp: any) => {
      console.log("delete:", resp);
      const arr = [...category];
      arr.splice(idx, 1);
      setCategory(arr);
      console.log({ resp });
    })
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        
        {err && <Alert color="danger">{err}</Alert>}
        <Card>
          <CardHeader>
            <CardTitle>
              <Row>
                <Col
                  sm={12}
                  md={12}
                  style={{
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                  }}
                  xl={2}
                >
                  <h6>Add Category</h6>
                </Col>
                <Col sm={6} md={6} xl={3}>
                  <Input
                    onChange={(e) => {
                      setAddCat(e.target.value);
                    }}
                    defaultValue=""
                    placeholder="Something ...."
                    type="text"
                  >
                    {" "}
                  </Input>
                </Col>
                <Col sm={6} md={6} xl={5}>
                  <Button style={{ width: "90px" }} onClick={addCategory}>
                    Add
                  </Button>
                </Col>
              </Row>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <CardTitle>Categories</CardTitle>
            <ListGroup>
              {category.map(
                (data: any, idx: any) =>
                  !data.deleted && (
                    <ListGroupItem>
                      <Row>
                        <p className="col-11" style={{ margin: "auto" }}>
                          {data.name}
                        </p>{" "}
                        <Button
                          onClick={() => submit(()=> deleteCat(data,idx),'Are You Sure to Delete the Category ?')}
                          className="col-1"
                          color="danger"
                        >
                          Delete
                        </Button>
                      </Row>
                    </ListGroupItem>
                  )
              )}
            </ListGroup>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Categories;
