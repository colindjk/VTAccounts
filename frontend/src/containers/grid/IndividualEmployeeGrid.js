import React from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { putPayment } from 'actions/records'
import { connectSettings } from 'actions/settings'
import { DataGrid } from 'components/grid'
import { PaymentEditor } from 'components/grid/editors'
import * as records from 'selectors/records'

import { AccountPaymentSelector } from 'selectors/date-records'
import { employeeSelector, fundSelector } from 'selectors/grid'

import store from 'store'

const nameFormatter = ({
  value,
  dependentValues: { filtered, flattened }
}) => (
  <div style={{ color: filtered || flattened ? 'grey' : 'black' }}>
    {value}
  </div>
)

const codeFormatter = ({
  row,
  value,
  dependentValues: { filtered, flattened }
}) => (
  <div style={{ color: filtered || flattened ? 'grey' : 'black' }}>
    {value}
  </div>
)

const paymentFormatter = ({
  row: { employee },
  value,
  dependentValues: { rangeField }
}) => {
  return rangeField ? (
    <div title={value[rangeField].toFixed(2)}>
      {value[rangeField].toFixed()}
    </div>
  ) : (
    <div title={value.paid.toFixed(2)}>
      {
        employee && employee[value.date].total_ppay
          ? (100 * value.paid / employee[value.date].total_ppay).toFixed(0) + "%"
          : Math.round(value.paid)
      }
    </div>
  )
}

// Columns with an initial width.
const columns = [ 
  {
    key: 'name',
    name: 'Name',
    resizable: true,
    formatter: nameFormatter,
    width: 600,
    locked: true,
  },
  {
    key: 'code',
    name: 'Code',
    width: 120,
    formatter: codeFormatter,
    locked: true,
  },
]

const columnSelector = createSelector(
  range => range,
  range => [
    ...range.map(date => ({
        key: date,
        name: date,
        width: 120,
        formatter: paymentFormatter,
        editor: PaymentEditor,
      })
    ),
  ],
)

const FundSummaryGrid = ({
  name,
  initialized,
  range,
  updateSettings,

  selectEmployee,
  funds,
  employees,
  isFundInitialized,
  isEmployeeInitialized,
  isPaymentInitialized,

  selectTransactableFund,

  putPaymentRecord,
  settings: { employee },
}) => {
  const uninitializedText = employee 
    ? "Loading " + (!(isFundInitialized && isEmployeeInitialized)
      ? "employees, funds" + (!isPaymentInitialized 
        ? " & payments..." 
        : "...") 
      : "payments...")
    : "Choose an employee..."

  const employeeValue = employees.data[employee]

  // Header rows have the shape: 
  //   { metaData, data, fields }
  const headerRows = initialized && employeeValue ? [
    {
      data: selectEmployee(employee),
      fields: {
        name: employeeValue.first_name + " " + employeeValue.last_name,
        code: employeeValue.pid,
      },
      dependentValues: { rangeField: "total_ppay" },
    }
  ] : []

  const updateRangeValues = (fund, updates) =>
    Object.keys(updates).forEach(date =>
      putPaymentRecord({ ...updates[date], date }))

  return (
    <DataGrid 
      name={name}
      data={employee ? funds.data : {}} // Avoid trying to access a salary for `undefined`.
      columns={columns}
      rangeColumns={columnSelector(range)}
      updateRangeValues={updateRangeValues}
      rowSelector={employeeValue && 
        selectTransactableFund(employeeValue.transactable)}
      headerRows={headerRows}
      uninitializedText={uninitializedText}
      // Only works since the initial columns are not labelled as editable.
      isRangeFieldEditable={(row, field) => row[field].transactable }
      editable={true}
    />
  )
}

const mapStateToProps = state => ({
  funds: records.getFunds(state),
  employees: records.getEmployees(state),
  isFundInitialized: records.isFundInitialized(state),
  isEmployeeInitialized: records.isEmployeeInitialized(state),
  isPaymentInitialized: records.isPaymentInitialized(state),
  range: records.getGlobalDateRange(state),
  selectEmployee: employee => employeeSelector(state, employee),
  selectTransactableFund: transactable => fund => fundSelector(state, fund, transactable),
})

const mapDispatchToProps = dispatch => ({
  putPaymentRecord: payment => dispatch(putPayment(payment)),
})

// Note: Always `connectSettings` first if you want to have access to settings
// fields in `mergeProps`.
export default connect(
  mapStateToProps, mapDispatchToProps 
)(
  connectSettings(FundSummaryGrid, {
    dependencies: [ records.isFundInitialized, records.isPaymentInitialized ],
  })
)
