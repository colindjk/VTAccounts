import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';
import { createSelector } from 'reselect'

import store from 'store'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'
import { getTimestamp } from 'actions/api/fetch'
import { prevPayPeriod, compareDates, getMaxDate } from 'util/payPeriod'

// This module will include some sagas and helpers related to employee data.

const virtualSalary = { total_ppay: 0, isVirtual: true }

// Refreshes on request when based on a new range.
export default class SalaryCache {
  constructor() {
    this.context = undefined

    this.employeeData = undefined // Stores a range of data.

    this.selectEmployeeSalary = createCachedSelector(
      (state) => state,
      (state, id) => id,
      (state, id, salaries) => salaries,
      (state, id, salaries, date) => date,
      (state, id, salaries, date, startDate) => startDate,

      // FIXME: Use memoization function for updated_on
      (state, id, salaries) => salaries.updated_on,

      (state, id, salaries, date, startDate, _timestamp) => {
        if (salaries[date]) {
          return { ...salaries[date] }
        }

        if (compareDates(startDate, date) === 1) {
          return { ...virtualSalary, date, id }
        } else {
          // FIXME: Why are all salaries the same?
          return { ...virtualSalary, ...this.selectEmployeeSalary(state, id, salaries, prevPayPeriod(date), startDate), id: undefined }
        }
      }
    )(
      (employees, key, _, date) => {
        return `${key}.${date}`
      }
    )
  }

  // Returns salaries populated employees as a whole.
  selectEmployees(state) {
    const { context } = state.ui
    if (!context || context.range === undefined) { return { initialized: false } }

    console.log("employeeSalariesCache context", state.ui.context)

    if (!this.employeeData) {
      this.employeeData = deepCopy(state.records.employees)
    }

    const { range } = context
    const { employees, salaries } = state.records

    for (var id in employees) {
      let employee = this.employeeData[id]
      let employeeSalaries = salaries.data[id] || { data: {}, updated_on: 0 }
      const startDate = Object.keys(employeeSalaries.data).sort(compareDates)[0] || getMaxDate()

      if (employee.updated_on !== employeeSalaries.updated_on) {
        range.forEach(date => {
          employee[date] = this.selectEmployeeSalary(state, id, employeeSalaries.data, date, startDate)
        })
      }
      employee.updated_on = salaries.updated_on
    }
    return { initialized: true, employeeData: this.employeeData }
  }

  // Uses given employee, or retrieves default employee from context.
  selectEmployee(state, employee) {
    const { context } = state.ui
    if (!context || context.fund === undefined) { return { initialized: false } }

    this.selectEmployeeSalary(state)
  }
}

