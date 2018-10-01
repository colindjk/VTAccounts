import 'bootstrap/dist/css/bootstrap.min.css'
import 'App.css';

import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Container } from 'reactstrap';

import { Header, Footer } from 'components/ui';
import { Home, Login } from 'pages';
import store from 'store'

const isAuthenticated = () => {
  return store.getState().user.isAuthenticated
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    isAuthenticated() === true
      ? <Component {...props} />
      : <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }} />
  )} />
)

// Create a Header component
// Container, use columns to create the sidebar for navigation.
class App extends Component {
  render() {
    return (
      <div id="root-container">
        <Header />
        <Switch>
          <Route exact path="/login" component={Login} />
          <PrivateRoute path="/home" component={Home} />
          <Route path="" component={() => (
            <Redirect to={{ pathname: '/home' }} />
          )} />
        </Switch>
      </div>
    );
  }
}

export default App;
