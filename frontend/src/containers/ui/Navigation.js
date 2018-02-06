import React, {Component} from 'react';

import { Navbar } from '../../components/ui';

export default class Navigation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
    }

    toggleNavbar() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        return (
            {/*<Navbar isOpen={this.state.isOpen} toggleNavbar={this.toggleNavbar.bind(this)}/>*/}
        )
    }
}
