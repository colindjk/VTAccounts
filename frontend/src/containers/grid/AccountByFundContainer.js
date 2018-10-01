import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'
import FundCache from 'selectors/payments/fundCache'
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
        width: 350
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

  render() {
    if (!this.props.context) {
      return <div>Awaiting context submission...</div>
    }

    return <DataGrid
        data={this.props.employeeData}
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
  const fundCache = new FundCache()

  const mapStateToProps = (state, props) => ({
      employees: state.employees,
      context: state.ui.context,

      // FIXME: Find a better way to pass in second parameter.
      employeeData: fundCache.selectEmployee(state),
    })
  return mapStateToProps
}

export default connect(makeMapStateToProps(), mapDispatchToProps)(FundByAccountContainer);


