import { deepCopy } from 'util/helpers'

// This module will include some sagas and helpers related to employee data.

// Iterates over `employees`.
// TODO: Get rid of the accounts parameter madness. 
// TODO: Should we have employees handled in an entirely different saga?
export const populateSalaries = (employees, range, accounts) => {
  var newEmployees = {}
  for (var employeeKey in employees) {
    const employee = employees[employeeKey]
    const salaries = getEmployeeSalaries(employee, range)
    newEmployees[employeeKey] = { ...employee, ...salaries }

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

// TODO: Reimplement using the actual month / date / year values.

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

  // The classic `while switch`
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
      console.error("ERORR::getLatestSalary => Fall through case in compareDates")
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

    // Copy over the salary, this will then be virtualized or directly applied
    // to salaries dict.
    let salary = { ...salariesArray[salaryIndex] }
    switch (compareDates(date, salary.date)) {
      case 1:
        // This should only every happen once, TODO: Make a better case here.
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
        console.error("ERORR::getEmployeeSalaries => Fall through case in compareDates")
    }
  })

  return salaries
}

