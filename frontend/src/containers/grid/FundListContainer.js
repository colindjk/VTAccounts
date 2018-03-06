import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'

// The container will decide what edit function will be triggered and what
// actions will be called.
class FundListContainer extends React.Component {

  processColumns() {
    var initColumns = [
      {
        key: 'name',
        name: 'Name',
        locked: true,
        width: 300
      },
      {
        key: 'code',
        name: 'Code',
        locked: true,
      },
    ];
  }

  // Will have an object passed as the lone parameter. 
  tryPutPayment(payment) {
    this.props.putPayment(payment)
  }

  render() {
    if (!this.props.context) {
      return <div>Loading FundListContainer...</div>
    }

    return <DataGrid
        rows={this.props.structure.rows}
        data={this.props.accounts}
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

function mapStateToProps(state) {
  return ({
      accounts: state.accountTreeView.accounts,
      context: state.accountTreeView.context,
      structure: state.accountTreeView.structure,
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(FundListContainer);
