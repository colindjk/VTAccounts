import './DataGrid.css'
import './GridContextMenu.css'

import React, { useState, useEffect } from 'react'
import ReactDataGrid from 'react-data-grid'
import { Toolbar, Menu } from 'react-data-grid-addons'
import PropTypes from 'prop-types'

import { connectSettings } from 'actions/settings'
import { HeaderRowRenderer } from 'components/grid'
import { selectRows } from 'selectors/grid'

const { ContextMenuTrigger } = Menu

const initialSettings = {
  grid: {
    columnMetaData: {},
    // Separate subslice so selectors using rowOptions don't recompute rows
    // k/v { [headerRow.id]: { ...headerRowValuesExceptId } } 
    headerRowOptions: {},
    rowOptions: {
      showAllChildren: false,
      expanded: {},
      filtered: {},
      flattened: {},
      rangeFields: {},
      columnMetaData: {}, // Stores metadata by column key.
    },
    showToolbar: false,
  }
}

// Row Rendering
const defaultRowRenderer = props => {
  if (props.row.isHeader) { return <HeaderRowRenderer {...props}/> }

  const { filtered, flattened } = props.subRowDetails
  const color = filtered || flattened ? "grey" : "black";
  return <div style={{ color }}>{props.renderBaseRow(props)}</div>;
}

// B/c ReactDataGrid doesn't replace updated columns...
var rowMetaDataFor = {}
const NULL_ROW_META_DATA = {}

// 'DataGrid' is mainly used for viewing records over a range of dates, but can
// take any sort of range of keys or none at all.
const DataGrid = ({
  name,

  initialized,
  selectRows,
  initRows,
  headerRows,
  childrenField,
  uninitializedText,
  data,
  columns,
  rangeColumns,
  range, // list of dates in ISO format.
  rowSelector,
  rowRenderer,
  toolbar,
  contextMenu,

  rangeCellFormatter,
  cellFormatter,

  settings: {
    grid: {
      columnMetaData,
      headerRowOptions,
      rowOptions,
      showToolbar,
    },
  },
  applySettings,
  toggleSettings,

  editable,
  isFieldEditable,
  isRangeFieldEditable,
  updateFieldValues,
  updateRangeValues,
}) => {
  const initialRows = initRows ? initRows : Object.keys(data)
  const { rows, rowMetaData } =
    selectRows(initialRows, data, { ...rowOptions, childrenField })

  // Due to the fact that the rowMetaData is supposed to be managed and updated
  // a global var must be maintained for each grid. 
  rowMetaDataFor[name] = rowMetaDataFor[name] || {}
  const headerRowMetaData = headerRows.reduce(
    (meta, { id, dependentValues }) => ({ ...meta, [id]: dependentValues }), {})
  Object.assign(rowMetaDataFor[name], rowMetaData)
  Object.assign(rowMetaDataFor[name], headerRowMetaData)

  // Mark ranged columns & apply rowMetaData.
  const gridColumns = [
    ...columns, ...rangeColumns.map(column => ({ ...column, isRange: true }))
  ].map(column => ({
    ...column, ...(columnMetaData[column.key] || {}),
    getRowMetaData: row => rowMetaDataFor[name][row.id] || NULL_ROW_META_DATA
  }))

  // rowOption helpers that are used in Toolbar & ContextMenu.
  const toggleOption = (...fields) =>
    toggleSettings('grid', 'rowOptions', ...fields)

  // Both toolbar and context menu are given a name for connectSettings.
  const hasContextMenu = !!contextMenu
  const ContextMenuComponent = contextMenu
  const ToolbarComponent = showToolbar && toolbar

  const emptyRowsView = () => (
    <div style={{left: '50%', top: '50%', position: "absolute"}}>
      {
        initialized ? (
          <div>Oops, all the rows are gone!
            Click <u onClick={() => toggleOption('showAll')}>here</u> to show all
          </div>
        ) : <div><div className="grid-loader"/>{uninitializedText}</div>
      }
    </div>
  )

  // Header "rows" follow the format:
  // { id, data: { ...row },  }
  headerRows = headerRows.map(row => ({ ...row, isHeader: true }))

  const selectRow = i => {
    if (i < headerRows.length) {
      return headerRows[i]
    } else {
      let k = i - headerRows.length
      try {
        return rowSelector ? k >= 0 ? rowSelector(rows[k]) : {}
                           : data[rows[k]]
      } catch (e) {
        console.error("Failed to select row for id: " + rows[k])
        return data[rows[k]]
      }
    }
  }

  const onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    const fieldUpdates = {}
    const rangeUpdates = {}
    for (const updateKey in updated) {
      if (gridColumns.find(({key}) => key === updateKey).isRange) {
        rangeUpdates[updateKey] = updated[updateKey]
      } else {
        fieldUpdates[updateKey] = updated[updateKey]
      }
    }
    for (var rowIdx = fromRow; rowIdx <= toRow; rowIdx++) {
      const row = selectRow(rowIdx)
      if (typeof updateFieldValues === "function") 
        updateFieldValues(row, fieldUpdates)
      if (typeof updateRangeValues === "function")
        updateRangeValues(row, rangeUpdates)
    }
  }

  // Below will be state tools used to keep track of various RDG state slices
  const [selectedCell, setSelectedCell] = useState({idx: 0, rowIdx: 0})
  const [minHeight, setMinHeight] = useState(650)
  // See `pages/home/index`
  useEffect(() =>
    setMinHeight(document.getElementById("home-container").clientHeight * .88),
    [])

  return (
    <div style={{ position: "relative", zIndex: 0, paddingTop: "10px" }}>
      <ReactDataGrid
        rowGetter={i => selectRow(i)}
        rowRenderer={rowRenderer}
        
        onGridRowsUpdated={onGridRowsUpdated}
        contextMenu={hasContextMenu ?
          <ContextMenuComponent
            name={name}
            columns={gridColumns}
            selectRow={selectRow}
            rowMetaData={rowMetaData}
          /> : undefined
        }
        toolbar={ToolbarComponent}
        RowsContainer={hasContextMenu ? ContextMenuTrigger : undefined}
        rowsCount={rows.length + headerRows.length}
        columns={gridColumns}
          onGridKeyDown={({key}) => {
            if (key === "Enter") {
              const { idx, rowIdx } = selectedCell
              if (gridColumns[idx].key === "name") {
                toggleOption('expanded', selectRow(rowIdx).id)
              }
            }
          }}
        onCellSelected={(selected) => setSelectedCell(selected)}

        onCheckCellIsEditable={({ column, idx, rowIdx, row }) => {
            // TODO: Allow for editable headers for budget allocation.
            if (row.isHeader) return false
            return gridColumns[idx].isRange
              ? isRangeFieldEditable(row, gridColumns[idx].key)
              : isFieldEditable(row, gridColumns[idx].key)
          }
        }

        onCellExpand={({ rowIdx }) => 
          toggleOption('expanded', selectRow(rowIdx).id)}
        getSubRowDetails={({ id }) => rowMetaDataFor[name][id]}
        onColumnResize={(idx, width) => applySettings(
          { grid: { columnMetaData: { [gridColumns[idx].key]: { width } } } })}
        minHeight={minHeight}

        /* Allow for editable cells */
        enableCellSelect={editable}
        emptyRowsView={emptyRowsView}
      />
    </div>
  )
}

DataGrid.propTypes = {
  // Required
  name: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  data: PropTypes.object.isRequired,

  // Not required.
  initRows: PropTypes.array,
  rangeColumns: PropTypes.array,

  // Array of (usually proxies) elements in the same format as the record data
  // but instead with meta data type information.
  headerRows: PropTypes.array,
  rangeColumn: PropTypes.object,
  rowSelector: PropTypes.func,
  toolbar: PropTypes.func,
  contextMenu: PropTypes.func,

  minHeight: PropTypes.number,

  // (record, updates) => { update server call }
  updateFieldValues: PropTypes.func,
  updateRangeValues: PropTypes.func,

  // Modified version used with relevant ReactDataGrid props.
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,

  isRangeFieldEditable: PropTypes.func, // (row, field) => { isEditable }
  isFieldEditable: PropTypes.func, // (row, field) => { isEditable }
}

DataGrid.defaultProps = {
  title: "Grid",

  editable: true,
  isRangeFieldEditable: () => true,
  isFieldEditable: () => true,
  headerRows: [],

  uninitializedText: "Loading records...",
  selectRows: selectRows,
  rowRenderer: defaultRowRenderer,
  childrenField: "children",
}

export default connectSettings(DataGrid, { initialSettings })

