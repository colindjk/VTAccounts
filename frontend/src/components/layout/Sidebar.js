import './Sidebar.css'

import React from 'react' 
import {
  Collapse,
  Fade,
} from 'reactstrap'

import { connectSettings } from 'actions/settings'
import { Settings } from 'forms/settings'

const sidebarStyle = {
  position: "absolute",
  backgroundColor: "white",
  borderLeft: "2px solid grey",
  zIndex: 0,
  width: "300px",
  height: "100%",
  transition: ".5s",
}

const sidebarHeaderStyle = {
  textAlign: "center",
  paddingTop: "10px",
  color: "transparent",
  textShadow: "0 0 0px #763128",
}

// Side navigation menu that interacts with settings. 
const Sidebar = ({ currentRoute, settings: { isOpen } }) => (
  <div id="sidebar" style={{ ...sidebarStyle, right: isOpen ? 0 : -300 }}
    className={"navbar-light bg-light" + (isOpen ? "show" : "")}>
    <Fade in={isOpen}>
      <h3 className={"navbar_header"} style={sidebarHeaderStyle}>
        {currentRoute.title}
        <br/>
      </h3>
      <Settings name={currentRoute.name} />
    </Fade>
  </div>
)

export default connectSettings(Sidebar, { name: "layout_sidebar" })
