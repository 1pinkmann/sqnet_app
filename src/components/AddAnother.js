import React from "react";
import { BsPlusLg } from 'react-icons/bs'

const AddAnother=(props)=>{
  
  return (
    <div className="add-wrap mt-3 mt-md-1">
      <div className="d-flex add-another-wrp">
        <div onClick={props.addToken} className='plus-icon-wrapper'><BsPlusLg/></div>
        <div>Add another token</div>
      </div>
    </div>
  );
}

export default AddAnother;
