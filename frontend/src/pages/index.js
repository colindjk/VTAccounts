import React, { useState } from 'react'
import { withRouter } from 'react-router'
import { Container, Row, Col } from 'reactstrap'

import { connectSettings } from 'actions/settings'
import { Header, Sidebar } from 'components/layout'
import HomeRoutes from 'pages/home'
import * as records from 'selectors/records'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faSync } from '@fortawesome/free-solid-svg-icons'

// Temporary usage for initialization
import { connect } from 'react-redux'

const toggleStyle = {
  cursor: 'pointer',
  paddingLeft: '15px',
}

const SidebarToggleComponent = ({ toggleSettings }) => (
  <div id="sidebar-toggle" style={toggleStyle}
    onClick={() => toggleSettings('isOpen')}>
    <FontAwesomeIcon icon={faCog} />
  </div>
)

const SidebarToggle = connectSettings(
  SidebarToggleComponent, { name: "layout_sidebar" }
)

const loadingStyle = {
  "-webkit-animation": "spin 2s linear infinite",
  "animation": "spin 2s linear infinite",
}

// Temporary component used to pull data from server.
const InitApp = connect(
  state => ({ isLoading: records.isRecordLoading(state) }),
  dispatch => ({ init: () => dispatch({type: "INIT_APP"}) })
)(
  ({init, isLoading}) => (
    <div id="initbutton" onClick={() => init()} style={toggleStyle}>
      <FontAwesomeIcon style={isLoading && loadingStyle} icon={faSync} />
    </div>
  )
)

const homeRoute = {
  title: 'Home',
  path: '/home',
  component: withRouter(props => (<HomeTemplate {...props} />)),
  children: HomeRoutes
}

const routes = [
  homeRoute,
]

const mainContainerStyle = {
  height: "100%",
  paddingTop: "0px",
  paddingBottom: "0px",
}

const homeContainerStyle = {
  height: '100%',
  width: '100%',
  paddingTop: "0px",
  paddingRight: "0px",
  paddingLeft: "0px",
  backgroundColor: '#A9A9A9',
}

// Header and footer styles will be determined in their respective source files.

// `name` will be passed in as the lowest current route.
const HomeTemplate = ({children, location }) => {
  let parentRoute = { path: "" }, currentRoute
  // If two urls have the same starting directory they can break this.
  const visitRoute = (r, currentPath=r.path) => {
    if (location.pathname.includes(currentPath)) {
      if (currentRoute) {
        parentRoute = currentRoute
        currentRoute = r
      } else {
        currentRoute = r
      }
    }
    if (r.children) {
      r.children.forEach(child => visitRoute(child, currentPath + child.path))
    }
  }

  visitRoute(homeRoute) // find current and parent routes.

  return (
    <div style={homeContainerStyle} id="base-container">
      <Header currentRoute={currentRoute} parentRoute={parentRoute} rootRoute={homeRoute}>
        <SidebarToggle />
        <InitApp/>
      </Header>
      <Container className={"fill-rows"} fluid style={mainContainerStyle}>

        <Row style={{height: "100%"}}>
          <Col id="home-container">
            {children}
          </Col>
          <Sidebar currentRoute={currentRoute}/>
        </Row>
      </Container>
    </div>
  )
}

export default routes
