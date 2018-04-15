import React from 'react'
import { editors } from 'react-data-grid'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'

const defaultPaymentColumn = {
  locked: false,
  isRange: true,
  editable: false,
  formatter: PaymentFormatter,
  getRowMetaData: row => row,
  width: 100
}

// The container will decide what edit function will be triggered and what
// actions will be called.
class FundListContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {funds: {}};
  }

  // TODO: Keep track of "highlighted" rows, then have a button (toolbar!) which can verify all of them
  // ADD ABILITY TO COMBINE FUNDS / EMPLOYEES / TRANSACTABLES
  processColumns() {
    var initColumns = [
      {
        key: 'verified',
        name: 'Ver?',
        width: 50,
        locked: true,
        // TODO: Why does checkbox editor not work? who cares?
        formatter: ({ value }) => <div>{value ? "Y" : "N"}</div>,
      },
      {
        key: 'name',
        name: 'Name',
        width: 320,
        locked: true,
      },
      {
        key: 'code',
        name: 'Code',
        width: 60,
        locked: true,
      },
    ]

    if (!this.props.context) {
      return initColumns
    }

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

  componentDidMount() {
    var funds = deepCopy(this.props.funds)

    fetch("http://localhost:8000/api/payments/summary/fund/")
      .then(response => response.json())
      .then(summaryPayments => {
        summaryPayments.forEach(payment => {
          funds[payment.fund][payment.date] = payment
        })
        this.setState({ funds })
      })
  }

  applyAggregatePayments() {
    var funds = this.props.funds

    return funds
  }

  render() {
    return <DataGrid
        data={this.state.funds}
        columns={this.processColumns()}
      />
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    /* Verification coming soon */
  })
}

function mapStateToProps(state) {
  return ({
      funds: state.records.funds,
      context: state.accountTreeView.context,
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(FundListContainer);
