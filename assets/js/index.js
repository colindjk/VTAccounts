console.log("vt_accounts js bundle is executing...");

import React from 'react'
import ReactDOM from 'react-dom'

export class App extends React.Component {

   render() {
       return <h1>Hello, world.</h1>
   }
}

ReactDOM.render(<App/>, document.getElementById('react-app'))
