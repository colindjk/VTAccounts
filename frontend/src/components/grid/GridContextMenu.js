import React from 'react'
import './GridContextMenu.css'
import { Menu } from 'react-data-grid-addons'

import { connectSettings } from 'actions/settings'

const { ContextMenu, MenuItem, /*SubMenu,*/ } = Menu

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
  row,  // Row related vars (rowOptions)
  rowMetaData,

  settings,

  onRowFilter,
  onRowFlatten,
  onShowAll,
}) => {

  return (
    <ContextMenu style={{ backgroundColor: "white" }} id={id}>
      <MenuItem data={{ rowIdx, idx }} onClick={onRowFilter}>
        Filter Row
      </MenuItem>
      <MenuItem data={{ rowIdx, idx }} onClick={onRowFlatten}>
        Flatten Row
      </MenuItem>
      <MenuItem data={{ rowIdx, idx }} onClick={onShowAll}>
        Show All
      </MenuItem>
    </ContextMenu>
  );
}
      //rowToggles.map(({name, toggle, value}) => (
        //<MenuItem data={{ rowIdx, idx }} onClick={toggle} />
        //{name} {value ? "x" : "o"}
        //<MenuItem/>
      //)
      //gridToggles.length && rowToggles.length && <hr/>

export default connectSettings(GridContextMenu)

