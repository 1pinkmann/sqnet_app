import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';

export default class Toast extends Component {
  render () {
    return (
      <ToastContainer
        autoClose={5000}
        position='bottom-left'
        newestOnTop={true}
        pauseOnFocusLoss={false}></ToastContainer>
    );
  }
}
