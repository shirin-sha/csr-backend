import React, { useEffect, useState } from "react";
import { EditorState ,ContentState, convertToRaw,convertFromRaw } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import { convertToHTML } from 'draft-convert' ;
import PropTypes from "prop-types";
import './index.css'
import DOMPurify from 'dompurify';
import htmlToDraft from 'html-to-draftjs';
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { axiosApi } from "src/common/axiosConfig";
import dayjs from 'dayjs'
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardImg,
  CardImgOverlay,
  CardSubtitle,
  CardText,
  CardTitle,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
// import { useHistory } from "react-router";
import { Link, useHistory } from "react-router-dom";
import Table from "src/components/Table";
import { useFormik } from "formik";
import axios from "axios";
import { submit } from "src/common/confirmPopup";
import fd from "form-data";
import { resetCalendar } from "src/store/actions";

function Blogs() {
  const history = useHistory();
  document.title = "Blogs ";
  const [data, setData] = useState([]);
  const [openMOdal, setOpenModal] = useState(false);
  const [alert, setAlert] = useState<any>();
  const [file, setFile] = useState<any>();
  const [formData, setFormData] = useState<any>({});
  const [editImage, setEditImage] = useState<any>();
  const [EditableData, setEditableData] = useState<any>({});
  const [openEditMode, setOpenEditMode] = useState(false);
  const [contentState, setContentState] = useState(''); 

  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );
   console.log("editorState",editorState)

const  [convertedContent, setConvertedContent] = useState('');


  console.log("convertedContent",convertedContent)

  // convert to html
  const handleEditorChange = (state:any) => {
    setEditorState(state);
    convertContentToHTML();
    console.log("currentcontent",editorState.getCurrentContent())
  
  }

  console.log("EditableData",EditableData)
  const convertContentToHTML = () => {
    const currentContentAsHTML:any = convertToHTML(editorState.getCurrentContent());
    setConvertedContent(currentContentAsHTML);
    const obj = { ...formData};
    console.log('object',obj);
    
    obj.content = currentContentAsHTML
    console.log({ obj });

    setFormData({ ...obj });
const obj1={...EditableData}
console.log('object',obj);
obj1.content={convertedContent}
setEditableData({ ...obj1 });
  }
  const [currentPage, setCurrentPage] = useState<any>(1)
  const [postsPerPage] = useState(6)
   // get current posts
  
   const indexOfLastPost = currentPage * postsPerPage;
   const indexOfFirstPost = indexOfLastPost - postsPerPage;
   const currentPosts = data.slice(indexOfFirstPost, indexOfLastPost);
   console.log("currentPosts", currentPosts)
   console.log("currentPage",currentPage);
 
  const sttr= convertedContent.toString();
  console.log("string",sttr);
  
      
  const createMarkup = (html:any) => {
    return  {
      __html: DOMPurify.sanitize(html)
    }
  }
  useEffect(() => {
    axiosApi("/admin/get-blogs", {})
      .then((response: any) => {
        console.log("data : ", response.data);
        setData(response.data.blogs);
      })
      .catch((err) => {
        console.log({ err });
      });
  }, [formData, EditableData]);
  const onclick = (id: any) => {
    console.log("clicked");
    console.log("id from list :", id);

    setOpenModal(!openMOdal);
  };
  const onclickHandler = () => {
    const newFormData = new FormData();
    console.log("form datas", formData);
    if (
      formData.heading === undefined ||
      formData.description === undefined ||
      formData.image === undefined ||
      formData.location === undefined
     
    ) {
      setAlert("All fields are required");
    } else {
     console.log("stringed data first",formData.content);
      
      newFormData.append("heading", formData.heading);
      newFormData.append("description", formData.description);
      newFormData.append("image", formData.image);
      newFormData.append("location", formData.location);
      newFormData.append("submission_date", Date.now().toLocaleString());
      newFormData.append("content",formData.content)
      console.log("formdata: ", { ...newFormData });
      console.log("stringed data",formData.content);
      

      axios
        .post("admin/post-blogs", newFormData)
        .then((resp: any) => {
          console.log({ file });

          console.log("added", formData);
          console.log({ resp });

          if (resp.data.success === false) {
            setAlert(resp.data.message);
            console.log({ alert });
          } else if (resp.data.success === true) {
            const arr: any = [...data];
            arr.push(formData);

            setOpenModal(!openMOdal);
            setAlert("");
            setFormData({});
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const cancelFunc = () => {
    setOpenModal(!openMOdal);

    setFormData(null);
  };
  const editButtonHandler = (data: any) => {
    setConvertedContent('')
    setEditableData(data);
    const blocksFromHtml = htmlToDraft(data.content);
    const { contentBlocks, entityMap } = blocksFromHtml;
    console.log("contentBlocks",{contentBlocks});
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
const editorState = EditorState.createWithContent(contentState);
    console.log("contentStatecontentState",contentState);
    
//     const _contentState = ContentState.createFromText(data.content)
//     const raw = convertToRaw(_contentState);  // RawDraftContentState JSON
//  console.log("contentState",_contentState);
//  setContentState(convertContentToHTML(raw))


    setOpenEditMode(!openEditMode);
    setEditImage(data.img);
    console.table({ openEditMode, openMOdal });
  };
  const updateHandler = () => {
    const newFormData = new FormData();
    if (
      EditableData.heading === undefined ||
      EditableData.description === undefined ||
      EditableData.location === undefined ||
      EditableData.content===undefined
    ) {
      setAlert("All fields are required");
    } else {
      newFormData.append("heading", EditableData.heading || "");
      newFormData.append("description", EditableData.description || "");
      newFormData.append("image", EditableData.image || "");
      newFormData.append("_id", EditableData._id);
      newFormData.append("prevImg", editImage);
      newFormData.append("location", EditableData.location || "");
      newFormData.append("content",EditableData.content || "");

      console.log("Editbleformdata: ", EditableData);

      axios
        .post("admin/edit-blogs", newFormData)
        .then((resp: any) => {
          console.log({ file });

          console.log({ resp });

          if (resp.data.success === false) {
            setAlert(resp.data.message);
            console.log({ alert });
          } else if (resp.data.success === true) {
            const arr: any = [...data];
            setOpenEditMode(!openEditMode);
            setAlert("");
            setEditableData({});
            

          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
// pagination
// pagination

 
 //
 // pagination

 const pageNumbers = [];
 for (let i = 1; i <= Math.ceil((data.length) / postsPerPage); i++) {
   pageNumbers.push(i);
 }

 const paginate = (pageNumber :any) => setCurrentPage(pageNumber)
 // 
 const [next,setNext]=useState(currentPage)
 const nextpage=()=>{setCurrentPage(currentPage+1)}

 const deleteButtonHandler=(id:any)=>{
  console.log("delete clicked");
  console.log("dd",id);
  axiosApi("/admin/blog-delete", { id}).then((resp: any) => {
    console.log('resp',{resp});
    console.log("sucess",resp.data.success);
    if(resp.data.success==true){
      data.splice(data.findIndex(({_id})=>_id==id),1)
      console.log("dataslice",data);
      window.location.reload();
  }
  else{
    console.log("not true");
    
  }
 })

 }



  return (
    <div className="page-content">
      <div className="container-fluid">
        <CardHeader>
          <Row>
            <CardTitle className="col-xl-10 mt-2">
              <h5>Latest News and Blogs</h5>
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
        <div className="container-fluid">
          <Row>
            {currentPosts &&
              currentPosts.map((d: any, idx: any) => (
                <Card
                  key={d._id}
                  className="col-md-4 col-sm-2 m-2"
                  style={{ width: "300px" }}
                >
                 
                 
                    <CardImg
                    top
                    //  className="img-fluid"
                      width="100%"
                      height={'200px'}
                      src={`/admin/get-blogs/${d.img}`}
                      alt='' 
                    />
                   <div className="location-container">{dayjs(d.submission_date).format('DD/MM')}</div>
                  
                  <CardBody>
                    <CardTitle style={{ fontWeight: "bold" }}>
                      {d.heading}
                    </CardTitle>
                    <CardText
                      style={{ maxHeight: "100px", overflow: "hidden" }}
                    >
                      {d.description}
                    </CardText>
                    <div style={{display:"flex",gap:'15px'}}>
                    <Button onClick={() => editButtonHandler(d)}>Edit</Button>
                  <div>  <Button onClick={()=> submit(()=> deleteButtonHandler(d._id),'Are You Sure to Delete the Blog ?')}>Delete</Button></div></div>

                  </CardBody>
                </Card>
              ))}
          </Row>
        </div>
      </div>
      {/* pagination */}
      <div className="pagination">
            {pageNumbers.map(number => (<span key={number}>
              
              
              <a className={(currentPage ==number )? 'active' :'' } onClick={() =>{ console.log("onclick",number);
              {paginate(number)} }}>{number}</a></span>))}
              {currentPosts.length ==6 && (<a onClick={nextpage}>&raquo;</a>)}
          </div>
      <Modal
        // style={{maxWidth:'1500px !important', width: "1035px !important", height: "676px" }}
        isOpen={openMOdal}
        backdrop={"static"}
        size="lg" style={{maxWidth: '1200px', width: '100%'}}
        
      >
        <ModalHeader className="m-auto">Latest News and Blogs</ModalHeader>

        <ModalBody className=" p-4">
          {alert && <Alert color="danger">{alert}</Alert>}
          <Row className="pb-2">
            <Col md={6} >
              <Input
                type="file"
                accept=".png, .jpg, .jpeg"
                onInput={(e) => {
                  console.log("file inputed");
                  
                  const file: any = (e as any).currentTarget.files[0];

                  const obj = { ...formData };
                  obj.image = file;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
                name="image"
                placeholder="Upload Image"
              />
            </Col>
            <Col md={6} >
              <Input
                value={formData.location}
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...formData };
                  obj.location = value;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
                name="location"
                placeholder="Location"
              />
            </Col>
          </Row>
        
          <Row className="pb-2">
            <Col md={6} >
              <Input
                value={formData.heading}
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...formData };
                  obj.heading = value;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
                name="heading"
                placeholder="Heading"
              />
            </Col>
            {/* <Col md={6} >
              <Input
                value={formData.description}
                name="description"
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...formData };
                  obj.description = value;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
                placeholder="Description"
                type="textarea"
              />
            </Col> */}
          </Row>
          <Row className="pb-2">
            <Col md={10} style={{width:'100%'}}>
              <Input
                value={formData.description}
                name="description"
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...formData };
                  obj.description = value;
                  console.log({ obj });

                  setFormData({ ...obj });
                }}
                placeholder="Description"
                type="textarea"
              />
            </Col>
          </Row>
          <Row><p className="pl-5"style={{color:"gray"}}>Content</p></Row>
          <Row className="pb-2">
            <Col md={10} style={{width:'100%'}}>
            <Editor  editorState={editorState} 
      onEditorStateChange={handleEditorChange}
      wrapperClassName="wrapper-class"
      editorClassName="editor-class"
      toolbarClassName="toolbar-class"
      
      name="content" />
            </Col>
          </Row>
          <Row>
          <Row>
          {/* <div className="preview" dangerouslySetInnerHTML={createMarkup(convertedContent)}></div> */}
    
          </Row>
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
          <Button onClick={onclickHandler}>Add</Button>
        </ModalFooter>
      </Modal>

      {/* edit button */}

      <Modal
        // style={{ width: "602px !important", height: "676px" }}
        size="lg" style={{maxWidth: '1200px', width: '100%'}}
        isOpen={openEditMode}
        backdrop={"static"}
      >
        <ModalHeader className="m-auto">Edit Project</ModalHeader>

        <ModalBody className=" p-4">
          {alert && <Alert color="danger">{alert}</Alert>}
          <Row className="pb-2">
            <Col md={10} style={{width:'100%'}}>
              {/* <img  height={'100px'} src={`/admin/get-ourProject/${editImage}`} alt="" /> */}
              <Input
                type="file"
                accept=".png, .jpg, .jpeg"

                width={"200px"}
                height={"300px"}
                onInput={(e) => {
                  console.log("file Inputted");

                  const file: any = (e as any).currentTarget.files[0];
                  const obj = { ...EditableData };
                  obj.image = file;
                  console.log({ obj });

                  setEditableData({ ...obj });
                }}
                name="image"
                placeholder="Upload Image"
              />
            </Col>
          </Row>
          <Row className="pb-2">
            <Col md={10} style={{width:'100%'}}>
              <Input
                defaultValue={EditableData.location}
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...EditableData };
                  obj.location = value;
                  console.log({ obj });

                  setEditableData({ ...obj });
                }}
                name="location"
                placeholder="Location"
              />
            </Col>
          </Row>
          <Row className="pb-2">
            <Col md={10} style={{width:'100%'}}>
              <Input
                defaultValue={EditableData.heading}
                onChange={(e) => {
                  const value = e.target.value;
                  const obj = { ...EditableData };
                  obj.heading = value;
                  console.log({ obj });

                  setEditableData({ ...obj });
                }}
                name="heading"
                placeholder="Heading"
              />
            </Col>
          </Row>
          <Row className="pb-2">
<Col md={10} style={{width:'100%'}}>
<Editor 
 editorState={editorState} 
defaultContentState={contentState}
// onContentStateChange={setContentState}
onEditorStateChange={handleEditorChange}
//  initialEditorState={editorState}
// editorState={editorState} 
//       onEditorStateChange={handleEditorChange}
      wrapperClassName="wrapper-class"
      editorClassName="editor-class"
      toolbarClassName="toolbar-class"
      // defaultEditorState={EditableData.content}
      defaultValue={EditableData.content}
      name="editcontent" />
</Col>
          </Row>
         
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              setOpenEditMode(!openEditMode);
              // setAlert(false);
              setFormData({});
              console.table({ openEditMode, openMOdal });
            }}
            color="danger"
          >
            Cancel
          </Button>
          <Button onClick={updateHandler}>Add</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
Blogs.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default Blogs;
