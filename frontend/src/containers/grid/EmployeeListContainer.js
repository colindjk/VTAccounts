import React from 'react'
import PropTypes from 'prop-types'
import { editors } from 'react-data-grid'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'

// The container will decide what edit function will be triggered and what
// actions will be called.
class EmployeeListContainer extends React.Component {

  processColumns() {
    var initColumns = [
      {
        key: 'first_name',
        name: 'First',
        locked: true,
        width: 120,
      },
      {
        key: 'last_name',
        name: 'Last',
        locked: true,
        width: 160,
      },
      {
        key: 'position_number',
        name: 'Position',
        locked: true,
        width: 80,
      },
      {
        key: 'pid',
        name: 'PID',
        locked: true,
        width: 100,
      },
      {
        key: 'transactable',
        name: 'Transactable',
        locked: true,
      },
    ]

    //const defaultRangeColumn = true ?
      //defaultSalaryColumn : defaultRangeColumn

    //// Toggle based on salary / loe?
    //return initColumns.concat(this.props.context.range.map(date => ({
      //...defaultRangeColumn,
      //key: date,
      //name: date,
    //})))

    return initColumns
  }

  render() {
    console.log(this.props.employees)
    return <DataGrid
        data={this.props.employees}
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
      employees: state.records.employees,
      accounts: state.records.accounts,
      context: state.accountTreeView.context,
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeListContainer);

