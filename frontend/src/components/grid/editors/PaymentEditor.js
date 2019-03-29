import React from 'react'
import { editors } from 'react-data-grid'

const { EditorBase } = editors // CheckboxEditor, SimpleTextEditor

const isLoe = (row, date) => row.employee && row.employee[date].total_ppay

export default class PaymentEditor extends EditorBase {

  getValue() {
    let updated = {}
    const row = this.props.rowData
    const date = this.props.column.key
    const payment = row[date]
    const updateValue = parseFloat(this.getInputNode().value)

    if (isNaN(updateValue)) { return {} }

    // Access employee proxy to see if there's a salary > 0 => handle LOE.
    const amount = isLoe(row, date) 
      ? ((updateValue / 100) * row.employee[date].total_ppay).toFixed(2)
      : updateValue.toFixed(2)

    if (amount === parseFloat(payment.paid).toFixed(2)) return {}

    return { [date]: { ...payment, paid: amount } }
  }

  render() {
    const row = this.props.rowData
    const date = this.props.column.key
    const isValueLoe = isLoe(row, date)
    const initialUpdateValue = isValueLoe
      ? (row[date].paid * 100) / row.employee[date].total_ppay
      : row[date].paid

    return (
      <input
        className="form-control"
        ref={node => this.input = node}
        type="text"
        onBlur={this.props.onBlur}
        defaultValue={initialUpdateValue.toFixed(2) + (isValueLoe ? "%" : "")}
      />
    )
  }
}

