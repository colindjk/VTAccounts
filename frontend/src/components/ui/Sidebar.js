import './Sidebar.css';

import PropTypes from 'prop-types';
import React from 'react';
import { NavLink, BrowserRouter } from 'react-router-dom';
import { Col, Nav, NavItem, } from 'reactstrap';

import SidebarItem from './SidebarItem';

const populateNavItems = (routes, root) => {
  const navItems = [];
  routes.forEach(route => {
    const fullPath = root + route.path;
    navItems.push(
      <NavItem key={fullPath}>
        <NavLink className="nav-link" exact={route.exact || true} to={fullPath}>
          {route.title}
        </NavLink>
      </NavItem>
    )
    // TODO: Recurse - add children dropdown
  })
  return navItems;
};

const Sidebar = ({routes, rootPath}) => {

  const navItems = populateNavItems(routes, rootPath);
  return (
    <Col id="Sidebar" className="bg-dark" sm="2">
      <hr className="hr-top"/>
        <Nav className="navbar-dark sidenav" vertical>
          {navItems}
        </Nav>
      <hr className="hr-bottom"/>
    </Col>
  );
};

Sidebar.propTypes = {
  rootPath: PropTypes.string,
  routes: PropTypes.array,
}

export default Sidebar;
