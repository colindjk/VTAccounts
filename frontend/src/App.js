import 'bootstrap/dist/css/bootstrap.min.css'
import 'App.css';

import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';

import { Header, Footer } from 'components/ui';
import Home from 'pages/Home';

// Create a Header component
// Container, use columns to create the sidebar for navigation.
class App extends Component {
  render() {
    return (
      <div id="root-container">
        <Header />
        <Switch>
          <Route exact path="/login" component={() => (<div>hi</div>)}/>
          <Route path="/home" component={Home}/>
        </Switch>
      </div>
    );
  }
}

export default App;
