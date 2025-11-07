/* eslint-disable react/react-in-jsx-scope */
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css";
import { Button } from "reactstrap";
import './popup.scss'


export const submit = (func:any,text:any,noFunc?:any) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='custom-ui row' style={{zIndex:'100'}}>
            <div className="msgContainer row">
            <p className="col-md-12 message">{text}</p>

            </div>
            <div className="row">
            <Button className="button btn1 col-xl-6" onClick={()=>{
              
                onClose()
                noFunc()
            }}>No</Button>
            <Button className="button btn2 col-xl-6"
              onClick={() => {
                func()
                onClose();
              }}
            >
              Yes
            </Button>
            </div>
          
          </div>
        );
      }
    });
  };