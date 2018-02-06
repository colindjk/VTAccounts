import './Sidebar.css';

import React from 'react';

import { NavLink  } from 'react-router-dom';
import { Col, Nav, NavItem, } from 'reactstrap';

import SidebarItem from './SidebarItem';

const Sidebar = () => {
  return (
    <Col id="Sidebar" className="bg-dark" sm="2">
      <hr className="hr-top"/>
        <Nav className="navbar-dark sidenav" vertical>
          <NavItem>
            <NavLink exact to="/home" className="nav-link">Link</NavLink>
          </NavItem>
          <NavItem>
            <NavLink exact to="/home" className="nav-link">Link</NavLink>
          </NavItem>
          <NavItem>
            <NavLink exact to="/home" className="nav-link">Link</NavLink>
          </NavItem>
          <NavItem>
            <NavLink exact to="/home" className="nav-link">Link</NavLink>
          </NavItem>
        </Nav>
      <hr className="hr-bottom"/>
    </Col>
  );
};

export default Sidebar;
