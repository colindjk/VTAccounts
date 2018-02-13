import store from 'store'
import React from 'react';

const Counter = ({ fetch }) =>
  <div>
    <button onClick={() => store.dispatch({type: 'FETCH_RECORDS'})}>
      Fetch Data
    </button>
  </div>

const EmployeeSummary = () => (
  <div>
    <h1>Employees</h1>
    <Counter />
  </div>
);

export default EmployeeSummary;
