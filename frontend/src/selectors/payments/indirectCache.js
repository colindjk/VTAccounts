import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';
import { createSelector } from 'reselect'

import store from 'store'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'
import { getTimestamp } from 'actions/api/fetch'
import { prevPayPeriod, compareDates, getMaxDate } from 'util/payPeriod'

// This module will include some sagas and helpers related to employee data.

// Refreshes on request when based on a new range.
export default class IndirectCache {
  constructor() {
    this.context = undefined

    this.indirectData = undefined // Stores a range of data.

    this.selectFundIndirects = createCachedSelector(
      (state) => state,
      (state, id) => id,
      (state, id, salaries) => salaries,
      (state, id, salaries, date) => date,
      (state, id, salaries, date, startDate) => startDate,

      (state, id, salaries) => salaries.updated_on,

      (state, id, salaries, date, startDate, _timestamp) => {
        const virtualSalary = { id: undefined, date, employee: id, isVirtual: true }
        if (salaries[date]) {
          return { ...salaries[date] }
        }

        if (compareDates(startDate, date) === 1) {
          return { total_ppay: 0, ...virtualSalary }
        } else {
          return {
            total_ppay: 0,
            ...this.selectEmployeeSalary(state, id, salaries, prevPayPeriod(date), startDate),
            ...virtualSalary
          }
        }
      }
    )(
      (_, key, __, date) => {
        return `${key}.${date}`
      }
    )
  }

  // Where indirects is the 
  selectIndirects(state) {
    const { context } = state.ui
    if (!context || context.range === undefined) { return { initialized: false } }

    if (!this.indirectData) {
      this.indirectData = deepCopy(indirects.data)
    }

    const { range } = context
    const { employees, salaries } = state.records

    for (var id in employees) {
      let employee = this.indirectData[id]
      let employeeSalaries = salaries.data[id] || { data: {}, updated_on: 0 }
      const startDate = Object.keys(employeeSalaries.data).sort(compareDates)[0] || getMaxDate()

      if (employee.updated_on !== employeeSalaries.updated_on) {
        range.forEach(date => {
          employee[date] = this.selectEmployeeSalary(state, id, employeeSalaries.data, date, startDate)
        })
      }
      employee.updated_on = salaries.updated_on
    }
    return { initialized: true, indirectData: this.indirectData }
  }

}

