import React from 'react';
import './Header.css'

import { Navbar, Nav, NavItem } from 'react-bootstrap'

export default class LocalNavbar extends React.Component {

  render() {
    return (
      <Navbar>
        <Nav navbar right>
          <NavItem>Home</NavItem>
        </Nav>
      </Navbar>
    )
  }
}
