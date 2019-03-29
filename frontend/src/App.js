import 'App.css'

import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Route, BrowserRouter, Switch, Redirect } from 'react-router-dom'

import Login from 'forms/Login'
import MultiRouter from 'util/MultiRouter'
import pageRoutes from 'pages'

const rootStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  backgroundColor: '#A9A9A9',
}

const App = ({
  isAuthenticated,
  init,
}) => {
  useEffect(() => { if (isAuthenticated) init() }, [isAuthenticated])

  return (
    <BrowserRouter>
      <div style={rootStyle} className="App">
        <BrowserRouter>
          {
            isAuthenticated
              ? (
                <Switch>
                  {MultiRouter(pageRoutes)}
                  <Route render={() => <Redirect to="/home" />} />
                </Switch>
              ) : (
                <Switch>
                  <Route exact path="/login" component={Login} />
                  <Route render={() => <Redirect to="/login" />} />
                </Switch>
              )
          }
        </BrowserRouter>
      </div>
    </BrowserRouter>
  );
}

const mapStateToProps = state => ({
  isAuthenticated: state.user.isAuthenticated
})

const mapDispatchToProps = dispatch => ({
  init: () => dispatch({type: "INIT_APP"})
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
