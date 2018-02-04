import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';

import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import { Header, Footer, Navbar } from './containers/ui'

class App extends Component {
  render() {
    return (
      <div>
        <Route path="" component={Footer}/>
        <Route path="/home" component={Header}/>
      </div>
    );
  }
}

export default App;
