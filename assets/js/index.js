console.log("vt_accounts js bundle is executing...");

import React from 'react'
import ReactDOM from 'react-dom'

import 'create-react-class';

import { App } from './app'

//ReactDOM.render(<App/>, document.getElementById('react-app'))

import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDataGrid from 'react-data-grid';

import BaseGrid from './grid/BaseGrid'

function updateTransactable(transactable) {
  return fetch("http://localhost:8000/api/fund/", {
      method: 'patch',
      body: JSON.stringify(transactable),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    .then((response) => {
        return response.json()
    })

}

export class Grid extends BaseGrid {

  componentDidMount() {
    fetch("http://localhost:8000/api/fund/", {
        method: 'patch',
        body: JSON.stringify({hello: 'hi'}),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      })
      .then((response) => {
        return response.json()
      })
      .then((result) => {
        var data = result.data;
        var columns = result.columns;
        console.log(result);
        this.setState({
          columns: columns,
          rows: result.data,
          _mounted: true,
        })
      })
      .catch((error)=>{
        console.error(error);
      })

  }

  // TODO: Update parents?
  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    let rows = this.state.rows.slice();

    this.setState({ rows });
  }

  render() {
    return (<ReactDataGrid
        enableCellSelect={true}
        columns={this.state.columns}
        rowGetter={this.getRows.bind(this)}
        rowsCount={this.state.rows.length}
        minHeight={500}
        headerRowHeight={50}
        onGridRowsUpdated={this.handleGridRowsUpdated.bind(this)}
      />);
  }
}

ReactDOM.render(<Grid/>, document.getElementById('react-app'));
