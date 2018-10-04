import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'
import AccountCache from 'selectors/payments/accountCache'
import EmployeeCache from 'selectors/payments/employeeCache'

const defaultPaymentColumn = {
  locked: false,
  isRange: true,
  editable: true,
  editor: PaymentEditor,
  formatter: PaymentFormatter,
  getRowMetaData: row => row,
  width: 100
}

// The container will decide what edit function will be triggered and what
// actions will be called.
// Typically will contain a tree-like structure but could just as easily
// store flat data, depending on the values of "expanded" & "initRows".
class FundByAccountContainer extends React.Component {

  processColumns() {
    var initColumns = [
      {
        key: 'name',
        name: 'Name',
        locked: true,
        width: 250
      },
      {
        key: 'code',
        name: 'Code',
        locked: true,
      },
    ];

    return initColumns.concat(this.props.context.range.map(date => ({
      ...defaultPaymentColumn,
      key: date,
      name: date,
    })))
  }

  // Will have an object passed as the lone parameter. 
  tryPutPayment(payment) {
    this.props.putPayment(payment)
  }

  getRows() {
    const { employees } = this.props
    const rows = Object.keys(employees).filter(id => employees[id].transactable)
                                       .map(id => employees[id].transactable)
    console.log(rows)
    return [ ...Object.keys(this.getHeaderRowData()), ...rows ]
  }

  getHeaderRowData() {
    const { root } = this.props.accountData.accounts
    const budget = {
      ...root,
      id: 'budget',
      paymentType: 'budget',
      name: 'Total Budget',
      children: []
    }
    const paid = {
      ...root,
      id: 'paid',
      paymentType: 'paid',
      name: 'Total Paid',
      children: []
    }

    return { budget, paid }
  }

  getRowData() {
    return { ...this.getHeaderRowData(), ...this.props.accountData.accounts }
  }

  render() {
    console.log("RENDERING THE DATA GRID")
    if (!this.props.accountData.initialized) {
      return <div>Awaiting context submission...</div>
    }
    console.log("Rendering again")
    let data = { ...this.getHeaderRowData(), ...this.props.accountData.accounts } 

    return <DataGrid
        rows={this.getRows()}
        data={data}
        expanded={{}}
        columns={this.processColumns()}
        updateRangeValue={this.tryPutPayment.bind(this)}
        cellSelect={true}
      />
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    putPayment: payment => {dispatch({ type: actionType.PUT_PAYMENT, payment })}
  })
}

function makeMapStateToProps() {
  const accountCache = new AccountCache()

  const mapStateToProps = (state, props) => ({
      context: state.ui.context,
      employees: state.records.employees,
      accountData: accountCache.select(state),
    })
  return mapStateToProps
}

export default connect(makeMapStateToProps(), mapDispatchToProps)(FundByAccountContainer);

