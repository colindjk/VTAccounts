import React from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { connectSettings } from 'actions/settings'
import { DataGrid } from 'components/grid'
import * as records from 'selectors/records'

import { AccountPaymentSelector } from 'selectors/date-records'
import { fundSelector } from 'selectors/grid'

import store from 'store'

const nameFormatter = ({
  row: { employee },
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
  row,
  value,
}) => (
  <div title={value.runningBalance.toFixed(2)}>
    {value.runningBalance.toFixed(0)}
  </div>
)

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
      })
    ),
  ],
)

const FundSummaryGrid = ({
  name,
  initialized,
  range,
  updateSettings,

  selectFund,
  funds,
  isFundInitialized,
  isPaymentInitialized,
}) => {
  const uninitializedText = "Loading " + (!isFundInitialized
    ? "funds" + (!isPaymentInitialized ? "payments & accounts..." : "...") 
    : "accounts...")

  return (
    <DataGrid 
      name={name}
      data={funds.data}
      columns={columns}
      rangeColumns={columnSelector(range)}
      rowSelector={selectFund}
      uninitializedText={uninitializedText}
      editable={true}
    />
  )
}

const mapStateToProps = state => ({
  funds: records.getFunds(state),
  payments: records.getPayments(state),
  isFundInitialized: records.isFundInitialized(state),
  isPaymentInitialized: records.isPaymentInitialized(state),
  range: records.getGlobalDateRange(state),
  selectFund: fund => fundSelector(state, fund)
})

// Note: Always `connectSettings` first if you want to have access to settings
// fields in `mergeProps`.
export default connect(
  mapStateToProps,
)(
  connectSettings(FundSummaryGrid, {
    dependencies: [ 
      records.isAccountInitialized,
      records.isFundInitialized,
      records.isPaymentInitialized
    ],
  })
)
