import React, { Component } from 'react'

const AutoClaim=(props)=>{
    
    const ToggleHandler=()=>{
        props.setAutoClaim(!props.autoClaim)
    }

    return (
        <div className='d-flex align-items-center'>
            <div className='me-3' style={{fontSize:'16px'}}>Autoclaim Savings</div>
            <div
                className={`toggle-container ${props.autoClaim ? "" : "off"}`}
                onClick={ToggleHandler}
            >   
                <div className={`dialog-button ${props.autoClaim ? "" : "disabled"}`}>
                  {props.autoClaim ? "" : ""}
                </div>
            </div>
        </div>
    )
}

export default AutoClaim;