import React from 'react';

import { Navbar, NavbarToggler, NavbarBrand, Collapse } from 'reactstrap';

import Sidebar from './sidebar';
import Header from './header';

const Navigation = ({isOpen, toggleNavbar}) => {
    return (
        <Navbar id="mainNav" className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
            <NavbarBrand className="navbar-brand-title">VT Accounts</NavbarBrand>
            <NavbarToggler onClick={toggleNavbar}/>
            <Collapse navbar isOpen={isOpen}>
                <Sidebar/>
                <Header/>
            </Collapse>
        </Navbar>
    )
};

export default Navigation;
