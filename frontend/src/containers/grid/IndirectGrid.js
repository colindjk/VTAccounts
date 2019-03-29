import React from 'react'
import { connect } from 'react-redux'

import { putIndirect } from 'actions/records'
import { connectSettings } from 'actions/settings'
import { DataGrid } from 'components/grid'
import { RateEditor } from 'components/grid/editors'
import * as records from 'selectors/records'

import { IndirectSelector } from 'selectors/date-records'
import { fundIndirectSelector } from 'selectors/grid'

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

const IndirectGrid = ({
  name,
  initialized,
  range,

  selectFund,
  funds,

  putIndirectRecord,
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

  const updateRangeValues = (account, updates) =>
    Object.keys(updates).forEach(date =>
      putIndirectRecord({ ...updates[date], date }))

  return (
    <DataGrid 
      name={name}
      data={funds}
      columns={columns}
      rangeColumns={rangeColumns}
      rowSelector={selectFund}
      updateRangeValues={updateRangeValues}
    />
  )
}

// TODO: Add settings to adjust the viewed fund
const mapStateToProps = state => ({
  funds: records.getFundData(state),
  range: records.getGlobalDateRange(state),
  selectFund: fund => fundIndirectSelector(state, fund)
})

const mapDispatchToProps = dispatch => ({
  putIndirectRecord: indirect => dispatch(putIndirect(indirect)),
})

// Note: Always `connectSettings` first if you want to have access to settings
// fields in `mergeProps`.
export default connect(
  mapStateToProps, mapDispatchToProps
)(
  connectSettings(IndirectGrid, {
    dependencies: [ records.isFundInitialized, records.isIndirectInitialized ],
  })
)
