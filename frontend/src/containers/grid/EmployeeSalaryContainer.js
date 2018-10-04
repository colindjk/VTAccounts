import React from 'react'
import PropTypes from 'prop-types'
import { editors } from 'react-data-grid'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, SalaryEditor } from 'components/grid'
import { deepCopy } from 'util/helpers'

import EmployeeCache from 'selectors/payments/employeeCache'

const defaultSalaryColumn = {
  locked: false,
  isRange: true,
  editable: true,
  editor: SalaryEditor,
  formatter: ({ value }) => (<div>{value.total_ppay}</div>),
  getRowMetaData: row => row,
  width: 100
}

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
    ]

    if (!this.props.context) return initColumns

    // Toggle based on salary / loe?
    return initColumns.concat(this.props.context.range.map(date => ({
      ...defaultSalaryColumn,
      key: date,
      name: date,
    })))
  }

  // Will have an object passed as the lone parameter. 
  tryPutSalary(salary) {
    this.props.putSalary(salary)
  }

  render() {
    console.log(this.props.employees)
    if (!this.props.employeeCache.initialized) {
      return <div>Awaiting context submission...</div>
    }

    return <DataGrid
        data={this.props.employeeCache.employeeData}
        columns={this.processColumns()}
        updateRangeValue={this.tryPutSalary.bind(this)}
      />
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    putSalary: salary => {dispatch({ type: actionType.PUT_SALARY, salary })}
  })
}

function makeMapStateToProps() {
  const employeeCache = new EmployeeCache()

  const mapStateToProps = (state, props) => ({
      employeeCache: employeeCache.selectEmployees(state),
      context: state.ui.context,
    })
  return mapStateToProps
}

export default connect(makeMapStateToProps(), mapDispatchToProps)(EmployeeListContainer);

