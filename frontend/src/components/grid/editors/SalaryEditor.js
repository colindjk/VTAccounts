import React from 'react'
import { editors } from 'react-data-grid'

import { setPaymentValue, getPaymentValue } from 'components/grid/helpers'

const { EditorBase } = editors

export default class SalaryEditor extends EditorBase {

  getValue(): any {
    let updated = {};
    updated[this.props.column.key] = { ...this.props.rowData[this.props.column.key],
        total_ppay: parseInt(this.getInputNode().value)}
    return updated
  }

  render(): ?ReactElement {
    console.log('HELLO', this.props.value.total_ppay)
    return (<input
        className="form-control"
        ref={node => this.input = node}
        type="text"
        onBlur={this.props.onBlur}
        defaultValue={this.props.value.total_ppay}
      />)
  }
}



