import React from 'react'
import { connect } from 'react-redux'

import { putSalary } from 'actions/records'
import { connectSettings } from 'actions/settings'
import { DataGrid } from 'components/grid'
import { SalaryEditor } from 'components/grid/editors'
import * as records from 'selectors/records'

import { SalarySelector } from 'selectors/date-records'
import { employeeSelector } from 'selectors/grid'

// Columns with an initial width.
const columns = [ 
  {
    key: 'name',
    name: 'Name',
    resizable: true,
    formatter: ({ row, value, dependentValues: { filtered, flattened } }) => (
      <div style={{ color: filtered || flattened ? 'grey' : 'black' }}>
        {row.first_name + " " + row.last_name}
      </div>
    ),
    width: 400,
    locked: true,
  },
  {
    key: 'pid',
    name: 'PID',
    width: 120,
    locked: true,
  },
]

const EmployeeSalaryGrid = ({
  name,
  initialized,
  range,
  updateSettings,

  selectEmployee,
  settings: { fund, accountLevel },
  employees,

  putSalaryRecord,
}) => {
  const rangeColumns = range.map(
      date => ({
        key: date,
        name: date,
        width: 120,
        formatter: ({ value: { total_ppay, isVirtual } }) => 
          <div style={{color: isVirtual ? "grey" : "black"}}>{total_ppay}</div>,
        editor: SalaryEditor,
      })
    )

  const updateRangeValues = (employee, updates) =>
    Object.keys(updates).forEach(date =>
      putSalaryRecord({ ...updates[date], date }))

  return (
    <DataGrid 
      name={name}
      data={employees}
      columns={columns}
      rangeColumns={rangeColumns}
      rowSelector={selectEmployee}

      updateRangeValues={updateRangeValues}
    />
  )
}

// TODO: Add settings to adjust the viewed fund
const mapStateToProps = state => ({
  employees: records.getEmployeeData(state),
  range: records.getGlobalDateRange(state),
  selectEmployee: employee => employeeSelector(state, employee),
})

const mapDispatchToProps = dispatch => ({
  putSalaryRecord: salary => dispatch(putSalary(salary)),
})

// Note: Always `connectSettings` first if you want to have access to settings
// fields in `mergeProps`.
export default connect(
  mapStateToProps, mapDispatchToProps
)(
  connectSettings(EmployeeSalaryGrid, {
    dependencies: [ records.isEmployeeInitialized, records.isSalaryInitialized ],
  })
)
