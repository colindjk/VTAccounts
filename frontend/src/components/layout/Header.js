import React, { useState } from 'react'
import { withRouter } from 'react-router'
import { NavLink } from 'react-router-dom'

import { connectSettings } from 'actions/settings'
import { RecordPicker } from 'forms/records'
import { DateRangePicker } from 'forms/dates'
import { Hoverable } from 'components/style'

import {
  Collapse,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from 'reactstrap'

const headerStyle = {
  borderBottom: "2px solid grey",
}

const dropdownStyle = {

}

const dropdownHoverStyle = {
  marginBottom: "-2px", // Make room for the border
  borderBottom: "2px solid grey",
  borderRadius: "40px",
}

const settingsToggleStyle = {
  cursor: 'pointer',
  paddingLeft: '15px',
}

// Takes HeaderRoutes for most of the lifetime of the application. 
// Note: I took care not to pass a `name` prop to Header, since the HoC
//       `connectSettings` relies on a unique name per settings, so the header
//       settings don't get mixed up with component settings.
const Header = ({
  currentRoute,
  parentRoute,
  rootRoute,
  children,
  location,
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false)

  // Assign it `name` so RecordPicker has access to currentRoute settings.
  const RecordPickers = (currentRoute.formFields || []).map(field => (
    <div key={field}>
      <RecordPicker name={currentRoute.name} recordType={field}/>
    </div>
  ))

  // Children can't have children, it'd be overkill. 
  const NavButtons = rootRoute.children.map(
      ({ name, navTitle, exact, path, children }) =>
    {
      const fullPath = rootRoute.path + path
      const activeStyle = { color: "black" }
      const toggleStyle = fullPath === rootRoute.path + parentRoute.path
        ? { ...activeStyle, ...dropdownStyle } : dropdownStyle
      return children ?
        (
          <UncontrolledDropdown nav inNavbar key={fullPath}>
            <Hoverable style={toggleStyle} onHoverStyle={dropdownHoverStyle}>
              <DropdownToggle nav>{navTitle}</DropdownToggle>
            </Hoverable>
            <DropdownMenu>
                {
                  children.map(child => (
                    <DropdownItem key={fullPath + child.path}>
                      <NavLink activeStyle={activeStyle} className="nav-link"
                          to={fullPath + child.path}
                      >
                        {child.navTitle}
                      </NavLink>
                    </DropdownItem>
                  ))
                }
            </DropdownMenu>
          </UncontrolledDropdown>
        ) :
        (
          <NavItem key={fullPath}>
            <NavLink activeStyle={activeStyle} className="nav-link"
                exact={true} to={fullPath}
            >
              {navTitle}
            </NavLink>
          </NavItem>
        )
    }
  )

  return (
    <Navbar style={headerStyle} className="navbar navbar-expand-lg navbar-light bg-light">
      <NavbarBrand>VT Accounts</NavbarBrand>
      <NavbarToggler onClick={() => setDropdownOpen(!isDropdownOpen)}/>
      <Collapse isOpen={isDropdownOpen} navbar>
        <ul className="navbar-nav mr-auto">
          {NavButtons}
        </ul>

        <div style={{paddingRight: 10, paddingLeft: 10}}>
          {RecordPickers}
        </div>

      </Collapse>
      <DateRangePicker />
      {children}
    </Navbar>
  )
}
export default withRouter(connectSettings(Header, { name: "layout_header" }))
