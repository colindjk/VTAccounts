import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDataGrid from 'react-data-grid';

import { editors } from 'react-data-grid'
const { EditorBase } = editors // CheckboxEditor, SimpleTextEditor

// The PaymentEditor / Formatter is a bit complicated due to the different
// 'pieces' of a payment that can be viewed.
// These include:
// -  paid
// -  budget
// -  commitment
// -  loe
//
// loe is unique in that it is a percentage based on `paid`, and an employee
// salary, and therefore is only displayed when a particular account has an
// employee field that does not resolve to null

class PayPeriodEditor extends EditorBase {

  getValue(): any {
    let updated = {};
    console.log(this.props)
    updated[this.props.column.key] = this.getInputNode().value
    return updated
  }

  render(): ?ReactElement {
    console.log('EDIT', this.props)
    return (<input
        className="form-control"
        ref={(node) => this.input = node}
        type="text"
        onBlur={this.props.onBlur}
        defaultValue={this.props.value.paid}
      />)
  }
}



