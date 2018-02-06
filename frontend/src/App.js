import 'bootstrap/dist/css/bootstrap.min.css'
import 'App.css';

import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';

import Home from 'pages/Home';
import { Header, Footer } from 'components/ui';

// Create a Header component
// Container, use columns to create the sidebar for navigation.
class App extends Component {
  render() {
    return (
      <div className="fill">
        <Header />
        <Switch>
          <Route exact path="/login" component={() => (<div>hi</div>)}/>
          <Route path="/home" component={Home}/>
        </Switch>
        <Footer />
      </div>
    );
  }
}

export default App;
