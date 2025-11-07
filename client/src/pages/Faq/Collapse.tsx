import React, { Component, useState } from 'react';
import { Collapse, Button, CardBody, Card, Row } from 'reactstrap';
import Icon from "@ailibs/feather-react-ts";
import './index.css'
interface FaqDropdownInterface{
  qstn:string,
  ans:string,
  onclick?:any
}
function FaqDropdown ({qstn,ans,onclick}:FaqDropdownInterface) {
 
const [collapse,setCollapse]=useState<any>(false)
  const toggle=()=> {
    setCollapse(!collapse)
  }

 
    return (
      <div>
        <div className='p-3 questionWrapper' onClick={toggle} style={{background: '#9E8959',width:'100%',height:'60px',borderRadius:'6px'}}>
        <h5  className='col-md-11  question'   style={{ marginBottom: '1rem',color:'white'}}>{qstn}</h5>
        <div><Icon  color='white' className='arrow' name='chevron-down'></Icon></div>
        <div onClick={onclick}><Icon strokeWidth={'3px'} color='#ed2d2d' className='arrow' name='x-circle'></Icon></div>

        </div>
        
   
        <Collapse isOpen={collapse}>
          <Card>
            <CardBody>
           {ans}
            </CardBody>
          </Card>
        </Collapse>
      </div>
    );
  
}

export default FaqDropdown;