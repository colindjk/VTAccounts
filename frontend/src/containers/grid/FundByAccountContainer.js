import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'
import AccountCache from 'selectors/payments/accountCache'
import EmployeeCache from 'selectors/payments/employeeCache'

// This component will handle the special 'context', and convert the context
// into the correct proptypes which are passed into the Grid component.
// For now we'll provide a static object as a context, and worry about the
// user handled configuration later.

const defaultPaymentColumn = {
  locked: false,
  isRange: true,
  editable: true,
  editor: PaymentEditor,
  formatter: PaymentFormatter,
  getRowMetaData: row => row,
  width: 100
}

// TODO: Add context menu with payment viewing options.
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
        width: 500
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
    return [ ...Object.keys(this.getHeaderRowData()), ...this.props.accountData.root.children ]
  }

  getHeaderRowData() {
    const { root } = this.props.accountData
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
    return { ...this.getHeaderRowData(), ...this.props.accountData }
  }

  // TODO: Rely on internal state for structure
  render() {
    // FIXME: ADD A WAY TO UPDATE GLOBAL SETTING'S FROM HERE!!!!!!!
    if (!this.props.context) {
      return <div>Awaiting context submission...</div>
    }

    let rows = []
    if (Object.keys(this.props.headerRows).length !== 0) {
      rows = [ ...Object.keys(this.props.headerRows), ...this.props.structure.rows ]
    }

    let data = { ...this.getHeaderRowData(), ...this.props.accountData } 

    return <DataGrid
        rows={this.getRows()}
        data={data}
        expanded={this.props.structure.expanded}
        columns={this.processColumns()}
        updateRangeValue={this.tryPutPayment.bind(this)}
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
      accounts: state.accountTreeView.accounts,
      headerRows: state.accountTreeView.headerRows,
      
      context: state.accountTreeView.context,
      // FIXME This will instead be "settings", including info on currently
      // expanded rows, the filter/flatten objects, etc.
      structure: state.accountTreeView.structure,

      accountData: accountCache.select(state),
    })
  return mapStateToProps
}

export default connect(makeMapStateToProps(), mapDispatchToProps)(FundByAccountContainer);

