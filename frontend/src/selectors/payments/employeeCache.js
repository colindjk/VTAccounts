import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';
import { createSelector } from 'reselect'

import store from 'store'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'
import { getTimestamp } from 'actions/api/fetch'
import { prevPayPeriod } from 'util/payPeriod'

// This module will include some sagas and helpers related to employee data.

// Iterates over `employees`, creating a grid-view version of `employees` and
// their salaries over the given `range`.
// Should always take grid-view `accounts` so they can be modified to have
// the correct visual representation (name, code, etc.)
export const populateSalaries = (employees, range, accounts) => {
  var newEmployees = {}
  for (var employeeKey in employees) {
    const employee = employees[employeeKey]
    const salaries = getEmployeeSalaries(employee, range)
    // FIXME: 
    newEmployees[employeeKey] = { ...employee, ...salaries, salaries }

    if (accounts && newEmployees[employeeKey].transactable) {
      // Create a deep copy for placing values into the thing.
      const newEmployee = deepCopy(newEmployees[employeeKey])
      const { first_name, last_name, position_number, salaries, transactable } = newEmployee
      const name = first_name + " " + last_name
      const code = position_number
      accounts[transactable] = { ...accounts[transactable], name, code, salaries, isEmployee: true }
    }
  }
  return newEmployees
}

// Three cases:
// dateA > dateB => 1
// dateA < dateB => -1
// dateA===dateB => 0
const compareDates = (dateA, dateB) => {
  if (dateA === dateB) return 0

  // Date Format: YYYY-MM-DD
  let valsA = dateA.split('-').map(str => parseInt(str))
  let valsB = dateB.split('-').map(str => parseInt(str))

  // year  => 0
  // month => 1
  // day   => 2
  if (valsA[0] > valsB[0] ||
      valsA[0] === valsB[0] && valsA[1] > valsB[1] ||
      valsA[0] === valsB[0] && valsA[1] === valsB[1] && valsA[2] > valsB[2])
  {
    return 1
  } else {
    return -1
  }
}

// Gets the latest salary that is associated with the given date. Return `index`
const getLatestSalary = (salaries, date) => {
  let salaryIndex = 0

  // "case -1 && salaryIndex !== 0": Return the latest salary since the given
  //                                 range starts after all available salaries.
  while (true) switch(compareDates(date, salaries[salaryIndex])) {
    case 1:
      salaryIndex++
      break;
    case -1:
      if (salaryIndex !== 0) {
        return salaryIndex - 1
      } else {
        return salaryIndex // aka return 0
      }
    case 0:
      return salaryIndex
    default:
      console.error("ERROR::getLatestSalary => Fall through case in compareDates")
  }
}

// Modifies the given account to populate it with the given data.
// Unfortunately matching dates in javascript is a bit janky, so we use the
// date strings when finding an exact date match, and Date objects otherwise.
export const getEmployeeSalaries = (employee, range) => {
  const salariesArray = employee.salaries
  if (salariesArray === undefined) { console.log("ERROR: No salaries found") }

  var virtualSalary = { total_ppay: 0, isVirtual: true, employee: employee.id }
  var salaries = {}
  var salaryIndex = getLatestSalary(salaries, range[0].date)

  range.forEach(date => {
    // Overflow / empty salaries
    if (salariesArray.length === salaryIndex) {
      salaries[date] = { ...virtualSalary, date }
      return // forEach's `continue`
    }

    // TODO: Transform rows AND transform data
    // Copy over the salary, this will then be virtualized or directly applied
    // to salaries dict.
    let salary = { ...salariesArray[salaryIndex] }
    switch (compareDates(date, salary.date)) {
      case 1:
        // This should only every happen once.
        // Note the lack of `break` or `return` is on purpose.
        salary = { ...salary, date, isVirtual: true }
      case 0:
        salaries[date] = salary
        virtualSalary = { ...salary, isVirtual: true }
        salaryIndex++
        return
      case -1:
        salaries[date] = { ...virtualSalary, date } // not there yet
        return
      default:
        console.error("ERROR::getEmployeeSalaries => Fall through case in compareDates")
    }
  })

  return salaries
}

const previousSalarySelector = createCachedSelector(

)

// Used to get the column of values. 
const employeeSalarySelector = createCachedSelector(
  records.getEmployees,
  (state, date) => date,
  (state, date, timestamp) => timestamp,

  (employees, date, _timestamp) => {

    employeeSalarySelector(employees, prevPayPeriod(date), _timestamp)

    //visitAccountPayment("root")

    console.timeEnd("Loading column")
    return {}
  }
)((state, date) => date)

// Each salary attempts to get the one earlier.
const selectEmployeeSalary = (date, employee) => {
  // date
  if (date) /* no previous / current salaries found */ {
    console.log(employee.salaries)
  }
}

// Have each column be a selector, if the main timestamp hasn't been updated,
// there's no need to recalculate any of them. When the first call is found to
// be cache'd, no code will execute, meaning we avoid recalculations. 
export default class EmployeeCache {
  constructor() {
    // Stored by employee.
    this.selectorResults = {}
    this.employeeData = {}
  }
}
