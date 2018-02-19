import React from 'react';
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid';

import BaseGrid from './BaseGrid';
import { param, fetchFromObject, setToObject } from 'util/helpers';

import SubColumnFormatter from './formatters/SubColumnFormatter'
import PaymentColumnFormatter from './formatters/PaymentColumnFormatter'

function getColumns(data) {
  var columns = [
    {
      key: 'employee_transactable.first_name',
      name: 'First',
      formatter: SubColumnFormatter,
      getRowMetaData: (row, column) => {
        return { key: column.key, row }
      },
      locked: true,
    },
    {
      key: 'employee_transactable.last_name',
      name: 'Last',
      formatter: SubColumnFormatter,
      getRowMetaData: (row, column) => {
        return { key: column.key, row }
      },
      locked: true,
    },
  ];

  for (var i = 0; i < data.range.length; i++) {
    columns.push({
      key: 'employee_transactable.salaries.' + data.range[i] + '.salary',
      //key: 'payments.' + data.range[i],
      name: data.range[i],
      formatter: SubColumnFormatter,
      getRowMetaData: (row, column) => {
        return { key: column.key, row }
      },
      editable: true,
      width: 100
    })
  }

  return columns;
}

function requestTransactables(fund, start_date, end_date) {
  return fetch("http://localhost:8000/api/transactables/" +
               param({ fund, start_date, end_date }),
    {
      method: 'get',
      headers: new Headers({
      })
    })
    .then((response) => {
      return response.json()
    })
}

export default class EmployeeGrid extends BaseGrid {

  componentDidMount() {
    requestTransactables(1, "2018-01-01", "2018-12-01")
      .then((data) => {
        this.state.rows = data.transactables
        this.state.columns = getColumns(data);
        this.setState(this.state);
      })
      .catch((error) => { console.log(error) });
  }

  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    let rows = this.state.rows.slice();

    for (let i = fromRow; i <= toRow; i++) {
      var row = rows[i];

      var keys = Object.keys(updated)
      for (var j = 0; j < keys.length; j++) {
        console.log(updated);
        console.log(row);
        var value = updated[keys[j]];
        setToObject(row, keys[j], parseFloat(value));
        console.log(row);
      }
      fetch("http://localhost:8000/api/transactables/" +
        param({ fund: 1, start_date: "2018-01-01", end_date: "2018-12-01" }),
      {
        method: 'PATCH',
        body: JSON.stringify(row),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }).then((response) => {
          return response.json()
      }).then((row) => {
          rows[i] = row;
          console.log(rows[i]);
          this.setState({ rows });
      })
        .catch((error)=> {
          console.error(error);
      })
    }

  }

  render() {
    console.log("RENDERING EMPLOYEE GRID");
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
