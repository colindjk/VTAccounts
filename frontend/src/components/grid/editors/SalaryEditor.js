import React from 'react'
import { editors } from 'react-data-grid'

const { EditorBase } = editors

export default class SalaryEditor extends EditorBase {

  getValue(): any {
    let updated = {};
    updated[this.props.column.key] = { ...this.props.rowData[this.props.column.key],
        total_ppay: parseInt(this.getInputNode().value)}
    return updated
  }

  render(): ?ReactElement {
    return (<input
        className="form-control"
        ref={node => this.input = node}
        type="text"
        onBlur={this.props.onBlur}
        defaultValue={this.props.value.total_ppay}
      />)
  }
}



