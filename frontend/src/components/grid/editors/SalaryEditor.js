import React from 'react'
import { editors } from 'react-data-grid'

const { EditorBase } = editors // CheckboxEditor, SimpleTextEditor

export default class SalaryEditor extends EditorBase {

  getValue() {
    let updated = {}
    const row = this.props.rowData
    const date = this.props.column.key
    const salary = row[date]
    const updateValue = parseFloat(this.getInputNode().value)

    if (isNaN(updateValue)) { return {} }

    // Access employee proxy to see if there's a salary > 0 => handle LOE.

    return { [date]: { ...salary, total_ppay: updateValue } }
  }

  render() {
    const row = this.props.rowData
    const date = this.props.column.key
    const initialUpdateValue = row[date].total_ppay

    return (
      <input
        className="form-control"
        ref={node => this.input = node}
        type="text"
        onBlur={this.props.onBlur}
        defaultValue={initialUpdateValue.toFixed(2)}
      />
    )
  }
}

