import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import ReactDataGrid from 'react-data-grid'

import { editors } from 'react-data-grid'

import { getUpdatedValue, getPaymentValue } from 'components/grid/helpers'

const { EditorBase } = editors // CheckboxEditor, SimpleTextEditor

export default class PaymentEditor extends EditorBase {

  getValue(): any {
    console.log("editor", this)
    let updated = {}
    const dependentValues = this.props.rowData
    const value = this.props.rowData[this.props.column.key]
    const rate = parseFloat(this.getInputNode().value) / 100

    return { [value.date]: { ...value, rate } }
  }

  render(): ?ReactElement {
    const { rate } = this.props.rowData[this.props.column.key]

    return (
      <input
        className="form-control"
        ref={node => this.input = node}
        type="text"
        onBlur={this.props.onBlur}
        defaultValue={(rate * 100) + "%"}
      />
    )
  }
}




