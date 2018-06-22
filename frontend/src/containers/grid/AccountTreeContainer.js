import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'
import AccountCache from 'selectors/payments/accountCache'

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
    if (!this.props.context) {
      return <div>Loading AccountTreeContainer...</div>
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
      structure: state.accountTreeView.structure,

      accountData: accountCache.select(state),
    })
  return mapStateToProps
}

export default connect(makeMapStateToProps(), mapDispatchToProps)(AccountTreeContainer);

