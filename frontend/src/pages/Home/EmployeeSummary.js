import React from 'react'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'

const Button = ({ fetch, data }) => {
  var rows = [];
  if (data) {
    console.log("data", data)
    for (var id in data) {
      rows.push(data[id])
    }
    rows = Object.keys(rows).map(key => <div key={key}>{key}</div>)
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

const structure = {
  reducer: {
    // accountKey: 
  }
  //defaultState: { rows, expanded }
}

function mapDispatchToProps(dispatch) {
  return ({
    fetch: () => {dispatch({ type: actionType.FETCH_PAYMENTS })}
  })
}

function mapStateToProps(state) {
  return ({
    data: state.records.payments
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Button);
