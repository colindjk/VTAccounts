import React from 'react'
import { editors } from 'react-data-grid'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'

// The container will decide what edit function will be triggered and what
// actions will be called.
class FundListContainer extends React.Component {

  // TODO: Keep track of "highlighted" rows, then have a button (toolbar!) which can verify all of them
  // ADD ABILITY TO COMBINE FUNDS / EMPLOYEES / TRANSACTABLES
  processColumns() {
    var initColumns = [
      {
        key: 'verified',
        name: 'Verified?',
        locked: true,
        // TODO: Why does checkbox editor not work? who cares?
        formatter: ({ value }) => <div>{value ? "Verified" : "Not Verified"}</div>,
      },
      {
        key: 'name',
        name: 'Name',
        locked: true,
      },
      {
        key: 'code',
        name: 'Code',
        locked: true,
      },
    ]

    return initColumns
  }

  // Will have an object passed as the lone parameter. 
  tryPutPayment(payment) {
    this.props.putPayment(payment)
  }

  render() {
    return <DataGrid
        data={this.props.funds}
        columns={this.processColumns()}
      />
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    verifyFund: payment => {dispatch({ type: actionType.PUT_PAYMENT, payment })}
  })
}

function mapStateToProps(state) {
  return ({
      funds: state.records.funds,
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(FundListContainer);
