import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDataGrid from 'react-data-grid';

class PaymentFormatter extends React.Component { 
  shouldComponentUpdate(nextProps: any) {
    return this.props === nextProps
  }

  render() {
    return <div title={this.props.value.paid}>{this.props.value.paid}</div>
  }
}

