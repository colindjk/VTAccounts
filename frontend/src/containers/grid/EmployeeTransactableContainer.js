import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import accountTreeCache from 'selectors/payments/accountCache'
import { deepCopy } from 'util/helpers'

// Caching Strategy:
//  We will cache the calculated values using re-reselect
//  The AccountTreeContainer will then have local state relating to accounts
//  aggregate values.
//  This is so the container will only update values that have actually been
//  updated. It'll just do tihs by column, it could be more efficient to hand
//  pick cell values, but that would involve too much work for a Container to
//  do.
// WE'LL CACHE BY PAY_PERIOD FOR NOW: later on we could cache by cell value and
// simply add another "layer of cache".

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

// The container will decide what edit function will be triggered and what
// actions will be called.
class AccountTreeContainer extends React.Component {

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

  // TODO: Rely on internal state for structure
  // TODO: Component Cache
  render() {
    if (!this.props.context) {
      return <div>Waiting on form submission...</div>
    }

    var rows = []
    const employees = this.props.employees
    for (var key in this.props.employees) {
      if (employees[key].transactable) {
        rows.push(employees[key].transactable)
      }
    }

    // FIXME: data={this.props.testData} => once account cache is up and running
    return <DataGrid
        rows={rows}
        data={this.props.accounts}
        expanded={this.props.structure.expanded}
        columns={this.processColumns()}
        updateRangeValue={this.tryPutPayment.bind(this)}

        testData={this.props.testData}
      />
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    putPayment: payment => {dispatch({ type: actionType.PUT_PAYMENT, payment })}
  })
}

function mapStateToProps(state) {
  return ({
      accounts: state.accountTreeView.accounts,
      headerRows: state.accountTreeView.headerRows,
      context: state.accountTreeView.context,
      structure: state.accountTreeView.structure,

      employees: state.records.employees,
      testData: accountTreeCache.select(state),
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountTreeContainer);

