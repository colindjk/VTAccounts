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
    ]

    return initColumns
  }

  // Will have an object passed as the lone parameter. 
  tryPutPayment(payment) {
    this.props.putPayment(payment)
  }

  render() {
    console.log("FUNDLISTCONTAINER")

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
