import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDataGrid from 'react-data-grid';

import { editors } from 'react-data-grid'

import { setPaymentValue, getPaymentValue } from 'components/grid/helpers'

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

export default class PaymentEditor extends EditorBase {

  getValue(): any {
    let updated = {};
    const dependentValues = this.props.rowData
    const value = this.props.rowData[this.props.column.key]
    const input = parseFloat(this.getInputNode().value)

    return setPaymentValue({ dependentValues, value }, input)
  }

  render(): ?ReactElement {
    const dependentValues = this.props.rowData
    const value = this.props.rowData[this.props.column.key]
    return (<input
        className="form-control"
        ref={node => this.input = node}
        type="text"
        onBlur={this.props.onBlur}
        defaultValue={getPaymentValue({ value, dependentValues }).result.toFixed(2)}
      />)
  }
}



