import React from 'react'
import { Menu } from 'react-data-grid-addons'

import { connectSettings } from 'actions/settings'

const { ContextMenu, MenuItem, /*SubMenu,*/ } = Menu

//const initialSettings = {
  //grid: {
    //columnMetaData: {},
    //// Separate subslice so selectors using rowOptions don't recompute rows
    //rowOptions: {
      //showAllChildren: false,
      //expanded: {},
      //filtered: {},
      //flattened: {},
      //rangeFields: {},
      //columnMetaData: {}, // Stores metadata by column key.
    //},
    //showToolbar: false,
  //}
//}

// TODO: Modified contextMenu for range values.
//
// TODO: Have checkbox that's checked / unchecked for toggles.
const GridContextMenu = ({
  name,
  idx,
  id,
  rowIdx,

  // Each `toggle` is of the format: {toggle, value}, where `toggle` is a
  // callable to toggle the option, and value is the value being toggled.
  columns,
  selectRow,
  rowMetaData,

  settings: {
    grid: {
      columnMetaData,
      headerRowOptions,
      rowOptions, // flattened, filtered, expanded, etc.
      showToolbar,
    },
  },

  toggleSettings,

}) => {
  const row = selectRow(rowIdx)
  // This is necessary b/c RDG tries to open a context menu at (-1, -1). Why.
  if (!row) return (<div/>) 

  const toggleOption = (...f) => toggleSettings('grid', 'rowOptions', ...f)
  const onRowFilter = () => toggleOption("filtered", row.id)
  const onRowFlatten = () => toggleOption("flattened", row.id)
  const onShowAll = () => toggleOption("showAll")
  const onShowToolbar = () => toggleSettings("grid", "showToolbar")

  const isFiltered = rowOptions.filtered[row.id]
  const isFlattened = rowOptions.flattened[row.id]
  const isExpanded = rowOptions.expanded[row.id]

  return (
    <ContextMenu style={{ backgroundColor: "white" }} id={id}>
      <MenuItem data={{ rowIdx, idx }} onClick={onRowFilter}>
        {isFiltered ? "Unfilter" : "Filter"} Row
      </MenuItem>
      <MenuItem data={{ rowIdx, idx }} onClick={onRowFlatten}>
        {isFlattened ? "Unflatten" : "Flatten"} Row
      </MenuItem>
      <hr/>
      <MenuItem data={{ rowIdx, idx }} onClick={onShowAll}>
        {rowOptions.showAll ? "Hide Filtered" : "Show All"}
      </MenuItem>
      <MenuItem data={{ rowIdx, idx }} onClick={onShowToolbar}>
        {showToolbar ? "Hide Toolbar" : "Show Toolbar"}
      </MenuItem>
    </ContextMenu>
  );
}

export default connectSettings(GridContextMenu)
