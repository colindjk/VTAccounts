import React from 'react'
import { connect } from 'react-redux'

import { FETCH_RECORDS } from 'actions/types'

const Button = ({ fetch, data }) => {
  var rows;
  console.log(data)
  if (data) {
    rows = data.map(row => <div key={row.id}>{row.name}</div>)
  }
  else {
    rows = <div>loading...</div>
  }
  return (
    <div>
      <button onClick={fetch}>
        Fetch the data
      </button>
      {rows}
    </div>)
}

const EmployeeSummary = () => (
  <div>
    <h1>Employees</h1>
    <Button />
  </div>
);

function mapDispatchToProps(dispatch) {
  return ({
    fetch: () => {dispatch({ type: FETCH_RECORDS })}
  })
}

function mapStateToProps(state) {
  return ({data: state.records.accounts})
}

const ButtonContainer = connect(
  mapStateToProps, mapDispatchToProps)(Button)

export default ButtonContainer;
