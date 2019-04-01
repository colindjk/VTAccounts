import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import ReactDataGrid from 'react-data-grid'
import { Editors } from "react-data-grid-addons"

import { fetchTransactionMetadataFor } from 'actions/records'
import { connectSettings } from 'actions/settings'
import * as records from 'selectors/records'
import { intoArray } from 'util/helpers'

// Unique to the other grids in that there is no range to view

const { DropDownEditor } = Editors

let fundCodeOptions = []

const defaultFormatter = ({ value }) => <div>{value || ""}</div>
const defaultHeaderRenderer = 
  ({column: { key, name }}) => <div title={key}>{name}</div>

// Where `key` is the key for 
const columns = [
  {
    key: "row_idx",
    name: "Row",
    width: 60,
    locked: true,
    resizable: false,
  },
  {
    key: "l7_fund_name",
    name: "Fund Name",
    width: 150,
    formatter: ({ row, value, dependentValues: { fund } }) => (
      row.isMetadata ? (
        <div>{value}</div>
      ) : (
        <div>{fund.name}</div>
      )
    ),
  },
  {
    key: "l7_fund_code",
    name: "Fund Code",
    formatter: ({ row, value, dependentValues: { fund } }) => (
      row.isMetadata ? (
        <div>{value}</div>
      ) : (
        <div>{fund.code}</div>
      )
    ),
    editor: <DropDownEditor options={fundCodeOptions} />
  },
  {
    name: "Date",
    key: "transaction_date",
    formatter: ({ row, value }) => (
      row.isMetadata ? (
        <div>{value}</div>
      ) : (
        <div>{row.date}</div>
      )
    )
  },
  {
    key: "itd_adjusted_budget_amount",
    name: "Budget",
    formatter: ({ row, value }) => (
      row.isMetadata ? (
        <div>{value}</div>
      ) : (
        <div>{row.budget}</div>
      )
    )
  },
  {
    key: "actual_amount",
    name: "Paid",
    formatter: ({ row, value }) => (
      row.isMetadata ? (
        <div>{value}</div>
      ) : (
        <div>{row.paid}</div>
      )
    )
  },
  {
    key: "itd_open_commitments_amount",
    name: "Commitments",
  },
  {
    key: "year",
    name: "Year",
    width: 60,
  },
  {
    key: "month",
    name: "Month",
    width: 70,
  },
  {
    key: "l3_senior_management_name",
    name: "L3 Name",
    width: 150,
  },
  {
    key: "l3_senior_management_code",
    name: "L3 Code",
  },
  {
    key: "l4_management_name",
    name: "L4 Name",
    width: 150,
  },
  {
    key: "l4_management_code",
    name: "L4 Code",
  },
  {
    key: "l5_department_name",
    name: "L5 Name",
    width: 150,
  },
  {
    key: "l5_department_code",
    name: "L5 Code",
  },
  {
    key: "l6_organization_name",
    name: "L6 Name",
    width: 150,
  },
  {
    key: "l6_organization_code",
    name: "L6 Code",
  },
  {
    name: "L7 Code",
    key: "l7_account_code",
  },
  {
    name: "L7 Name",
    key: "l7_account_name",
  },
  {
    key: "account_reporting_category",
    name: "Account Rep. Cat."
  },
  {
    key: "transaction_description",
  },
  {
    key: "transaction_code",
  },
  {
    key: "rule",
  },
  {
    key: "transaction_document",
  },
  {
    key: "transaction_reference_identifier",
  },
  {
    key: "transaction_encumbrance_identifier",
  },
  {
    key: "transaction_data_entry_user",
  },
  {
    key: "transaction_system_activity_date",
  },
  {
    key: "data_mart_finance_last_updated_date",
  },
].map(c => ({ 
  formatter: defaultFormatter, 
  headerRenderer: defaultHeaderRenderer,
  width: 100,
  resizable: true,
  ...c,
}))

// Setup a one level deep tree grid.
const selectRows = (transactionMetadata, payments, funds, rowMetaData={}) => {
  let rows = []
  if (!payments.initialized || !funds.initialized) return { rows, rowMetaData }

  const array = intoArray(transactionMetadata.data)
    .map(({ id, row_idx, data, associated_transactions }) => ({
        id: "meta_" + id, // Avoid payment id conflicts
        row_idx,
        associated_transactions,
        isMetadata: true,
        ...data,
      })
    )

  for (const row of array) {
    const hasChildren = row.associated_transactions > 0
    rowMetaData[row.id] = {
      group: hasChildren,
      expanded: hasChildren,
      //field: "row_idx", // purposefully left out since we keep children shown
      children: row.associated_transactions,
      treeDepth: 0,
      siblingIndex: rows.length,
    }

    rows.push(row)

    // TODO: Add related accounts / funds to metadata
    for (const paymentKey of row.associated_transactions) {
      const payment = payments.data[paymentKey]
      rowMetaData[payment.id] = {
        group: false,
        treeDepth: 1,
        siblingIndex: rows.length,

        fund: funds.data[payment.fund],
      }

      rows.push({ row_idx: row.row_idx, ...payment })
    }
  }

  return { rows, rowMetaData }
}

const RowRenderer = props => {
  const className = props.row.row_idx % 2 ? "odd" : "even"

  return (
    <div className={"transaction-metadata-grid--" + className}>
      {props.renderBaseRow(props)}
    </div>
  )
}

let rowMetaData = {}

const onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
  for (var rowIdx = fromRow; rowIdx <= toRow; rowIdx++) {

  }
}

// Grid view which reflects the data backing payments after being imported. 
const TransactionMetadataGrid = ({
  initialized,
  settings: { file },
  transactionMetadata,
  payments,
  funds,

  getMetadataFor,
  fetchMetadataFor,
}) => {
  // Only the first fetch for a file queries the server.
  useEffect(() => { if (file) { fetchMetadataFor(file) } }, [file])

  // If file is undefined, data === {}, and no rows are produced.
  const { rows } = selectRows(getMetadataFor(file), payments, funds, rowMetaData)

  const gridColumns = columns.map(c =>
    ({ ...c, getRowMetaData: row => rowMetaData[row.id] }))

  if (funds.initialized && !fundCodeOptions.length) {
    intoArray(funds.data).map(({ code }) => ({ id: code, value: code }))
                         .forEach(option => fundCodeOptions.push(option))
  }

  const emptyRowsView = () => (
    <div style={{left: '50%', top: '50%', position: "absolute"}}>
      {
        file ? <div>Loading transaction metadata...</div>
             : <div>Choose a file to load.</div>
      }
    </div>
  )

  return (
    <div style={{ position: "relative", zIndex: 0, paddingTop: "10px" }}>
      <ReactDataGrid
        rowGetter={i => rows[i]}
        rowsCount={initialized ? rows.length : 0}
        columns={gridColumns}

        minHeight={650}

        rowRenderer={RowRenderer}
        onCheckCellIsEditable={({ row }) => !row.isMetadata}
        getSubRowDetails={({ id }) => rowMetaData[id]}

        /* Allow for editable cells */
        enableCellSelect={true}
        emptyRowsView={emptyRowsView}
      />
    </div>
  )
}

const mapStateToProps = state => ({
  funds: records.getFunds(state),
  payments: records.getPayments(state),
  transactionMetadata: records.getTransactionMetadata(state),

  getMetadataFor: file => records.getTransactionMetadataFor(state, file),
})

const mapDispatchToProps = dispatch => ({
  fetchMetadataFor: file => dispatch(fetchTransactionMetadataFor(file))
})

export default connectSettings(
  connect(mapStateToProps, mapDispatchToProps)(TransactionMetadataGrid),
  {
    dependencies: [ records.isPaymentInitialized ]
  }
)
