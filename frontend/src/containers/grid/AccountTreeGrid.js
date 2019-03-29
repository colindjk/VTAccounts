import React from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { putPayment } from 'actions/records'
import { connectSettings } from 'actions/settings'
import { DataGrid } from 'components/grid'
import { PaymentEditor } from 'components/grid/editors'
import { isPaymentEditable } from 'components/grid/helpers'

import { AccountTreeMenu } from 'containers/context-menu'

import { accountSelector, fundSelector } from 'selectors/grid'
import { FundPaymentSelector } from 'selectors/date-records'
import * as records from 'selectors/records'

// BELOW: Formatters
const nameFormatter = ({
  row: { employee },
  value,
  dependentValues: { filtered, flattened }
}) => (
  <div>
    {employee ? employee.first_name + " " + employee.last_name : value}
  </div>
)

const codeFormatter = ({
  row,
  value,
  dependentValues: { filtered, flattened }
}) => (
  <div>
    {row.employee ? row.employee.pid : value}
  </div>
)

const paymentFormatter = ({
  row: { employee, isHeader },
  value,
  dependentValues: { rangeField },
}) => (
  rangeField ? (
    <div title={value[rangeField].toFixed(2)}>
      {value[rangeField].toFixed()}
    </div>
  ) : (
    <div style={{ color: value.count ? "black" : "#4b5358" }} 
         title={value.paid.toFixed(2)}>
      {
        employee && employee[value.date].total_ppay
          ? (100 * value.paid / employee[value.date].total_ppay).toFixed(0) + "%"
          : Math.round(value.paid)
      }
    </div>
  )
)
// ABOVE: formatters

// Row Rendering
const defaultRowRenderer = ({renderBaseRow, ...props}) => {
  const { filtered, flattened } = props.subRowDetails
  const color = filtered || flattened ? "grey" : "black"
  return <div style={{ color }}>{renderBaseRow(props)}</div>
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

// TODO: Implement custom RowRenderer which handles header rows and gives them
// special dependent values.

const AccountTreeGrid = ({
  name,
  initialized,
  range,
  updateSettings,

  transactables,
  selectAccountFund,
  selectFund,
  settings: { fund, accountLevel },
  accounts,
  isAccountInitialized,
  isPaymentInitialized,

  putPaymentRecord,
}) => {
  // Header rows have the shape: 
  //   { metaData, data, fields }
  const headerRows = initialized ? [
    {
      id: "balance_aggregate", data: selectFund(fund),
      fields: { name: (selectFund(fund).name || "All Funds") + ": Balance" },
      dependentValues: { rangeField: "runningBalance" },
    },
    {
      id: "custom_header_row", data: selectFund(fund),
      fields: { name: "Paid" },
      dependentValues: { rangeField: "paid" },
    },
    {
      id: "indirect", data: selectFund(fund),
      fields: { name: "Fringe" },
      dependentValues: { rangeField: "fringe" },
    },
    {
      id: "fringe", data: selectFund(fund),
      fields: { name: "Indirect" },
      dependentValues: { rangeField: "indirect" },
    },
  ] : []

  const selectAccount = selectAccountFund(fund)
  const initRows = isAccountInitialized && isPaymentInitialized 
    ? records.getAccountsByLevel(accounts.data, accountLevel || "account_type")
    : []

  const uninitializedText = "Loading " + (!isAccountInitialized
    ? "accounts" + (!isPaymentInitialized ? " & payments..." : "...") 
    : "payments...")

  // We use 'editable' to avoid trying to update the "all" fund.
  const updateRangeValues = ({account_level, id}, updates) =>
    account_level === "transactable"
      ? Object.keys(updates).forEach(date =>
          putPaymentRecord({ ...updates[date], transactable: id, date }))
      : console.log("Error, tried to update a non-transactable payment")

  // Make sure to not be editable for aggregated data.
  const editable = !!fund && fund !== "all"

  return (
    <DataGrid 
      name={name}
      data={accounts.data}
      columns={columns}
      rangeColumns={columnSelector(range)}
      initRows={initRows}
      headerRows={headerRows}
      rowSelector={selectAccount}
      minHeight={650}
      uninitializedText={uninitializedText}
      updateRangeValues={updateRangeValues}
      editable={editable}
      contextMenu={AccountTreeMenu}
      isRangeFieldEditable={(row, field) => isPaymentEditable(row[field]) }
    />
  )
}

const mapStateToProps = state => ({
  accounts: records.getAccounts(state),
  funds: records.getFunds(state),
  isAccountInitialized: records.isAccountInitialized(state),
  isPaymentInitialized: records.isPaymentInitialized(state),
  range: records.getGlobalDateRange(state),
  selectAccountFund: fund => account => accountSelector(state, account, fund),
  selectFund: fund => fundSelector(state, fund),
})

const mapDispatchToProps = dispatch => ({
  putPaymentRecord: payment => dispatch(putPayment(payment)),
})


// Note: Always `connectSettings` first if you want to have access to settings
// fields in `mergeProps`.
export default connect(
  mapStateToProps, mapDispatchToProps,
)(
  connectSettings(AccountTreeGrid, {
    dependencies: [ records.isAccountInitialized, records.isPaymentInitialized ],
  })
)
