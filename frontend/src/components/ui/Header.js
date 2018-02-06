import './Header.css'

import React from 'react';
import { NavLink, } from 'react-router-dom';

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem } from 'reactstrap';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {

    return (
      <div>
        <Navbar className="Header" id="header-base" color="dark" dark expand="md">
          <NavbarBrand to="/home">VT Accounts</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink className="nav-link" to="/home">Tables</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="nav-link" to="/imports">Imports</NavLink>
              </NavItem>

              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Settings
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem>
                    Salary Verification
                  </DropdownItem>
                  <DropdownItem>
                    Salary
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem>
                    Cancel
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>

            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

