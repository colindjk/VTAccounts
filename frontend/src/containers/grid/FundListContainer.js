import React from 'react'
import { editors } from 'react-data-grid'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'

import FundSummaryCache from 'selectors/payments/fundSummaryCache'

// TODO: Add functionality to display balance / paid / budget. 
const defaultPaymentSummaryColumn = {
  locked: false,
  isRange: true,
  editable: false,
  formatter: ({ value }) => (<div>{value.balance.toFixed(2)}</div>),
  getRowMetaData: row => row,
  width: 100
}

// The container will decide what edit function will be triggered and what
// actions will be called.
class FundListContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  // TODO: Keep track of "highlighted" rows, then have a button (toolbar!) which can verify all of them
  // ADD ABILITY TO COMBINE FUNDS / EMPLOYEES / TRANSACTABLES
  processColumns() {
    var initColumns = [
      //{
        //key: 'verified',
        //name: 'Ver?',
        //width: 50,
        //locked: true,
        //// TODO: Why does checkbox editor not work? who cares?
        //formatter: ({ value }) => <div>{value ? "Y" : "N"}</div>,
      //},
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
      ...defaultPaymentSummaryColumn,
      key: date,
      name: date,
    })))
  }

  // Will have an object passed as the lone parameter. 
  tryPutPayment(payment) {
    this.props.putPayment(payment)
  }

  render() {
    if (!this.props.fundSummary.initialized) {
      return (<div>Awaiting form submission...</div>)
    }

    console.log(this.props.fundSummary.fundData)
    return <DataGrid
        data={this.props.fundSummary.fundData}
        columns={this.processColumns()}
      />
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    /* Verification coming soon */
  })
}

function makeMapStateToProps() {
  const fundSummaryCache = new FundSummaryCache()

  const mapStateToProps = (state, props) => ({
      context: state.ui.context,
      fundSummary: fundSummaryCache.selectFunds(state),
    })
  return mapStateToProps
}

export default connect(makeMapStateToProps(), mapDispatchToProps)(FundListContainer);
