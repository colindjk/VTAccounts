import React from 'react'
import { connect } from 'react-redux'

import { putFringe } from 'actions/records'
import { connectSettings } from 'actions/settings'
import { DataGrid } from 'components/grid'
import { RateEditor } from 'components/grid/editors'
import * as records from 'selectors/records'

import { FringeSelector } from 'selectors/date-records'
import { accountFringeSelector } from 'selectors/grid'

// Columns with an initial width.
const columns = [ 
  {
    key: 'name',
    name: 'Name',
    resizable: true,
    width: 400,
    locked: true,
  },
  {
    key: 'code',
    name: 'Code',
    width: 120,
    locked: true,
  },
]

const FringeGrid = ({
  name,
  initialized,
  range,
  updateSettings,

  selectAccount,
  rows,
  accounts,
  putFringeRecord,
}) => {
  const rangeColumns = range.map(
      date => ({
        key: date,
        name: date,
        width: 120,
        formatter: ({ value }) => (value.rate * 100) + "%",
        editor: RateEditor,
      })
    )

  const isRangeFieldEditable = (row, field) => row.is_fringe
  const updateRangeValues = (account, updates) =>
    Object.keys(updates).forEach(date =>
      putFringeRecord({ ...updates[date], date }))

  return (
    <DataGrid 
      name={name}
      initRows={rows}
      data={accounts}
      childrenField={"fringe_sources"}
      columns={columns}
      rangeColumns={rangeColumns}
      rowSelector={selectAccount}

      isRangeFieldEditable={isRangeFieldEditable}
      updateRangeValues={updateRangeValues}
    />
  )
}

// TODO: Add settings to adjust the viewed fund
const mapStateToProps = state => ({
  rows: records.getFringeDestinations(state),
  accounts: records.getAccountData(state),
  range: records.getGlobalDateRange(state),
  selectAccount: account => accountFringeSelector(state, account)
})

const mapDispatchToProps = dispatch => ({
  putFringeRecord: fringe => dispatch(putFringe(fringe)),
})

// Note: Always `connectSettings` first if you want to have access to settings
// fields in `mergeProps`.
export default connect(
  mapStateToProps, mapDispatchToProps
)(
  connectSettings(FringeGrid, {
    dependencies: [ records.isAccountInitialized, records.isFringeInitialized ],
  })
)
