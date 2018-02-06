import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';

import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import Base from './pages/Base'

import { Container } from 'reactstrap';

import { Header, Footer } from './components/ui';

// Create a Header component
// Container, use columns to create the sidebar for navigation.
class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <Route path="/foot" component={Footer}/>
      </div>
    );
  }
}

export default App;
