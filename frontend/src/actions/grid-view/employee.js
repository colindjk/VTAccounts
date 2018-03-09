import { deepCopy } from 'util/helpers'

// This module will include some sagas and helpers related to employee data.

// Iterates over `employees`.
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

// Modifies the given account to populate it with the given data.
// Unfortunately matching dates in javascript is a bit janky, so we use the
// date strings when finding an exact date match, and Date objects otherwise.
export const getEmployeeSalaries = (employee, range) => {
  const salariesArray = employee.salaries
  if (salariesArray === undefined) { console.log("ERROR: No salaries found") }

  var virtualSalary = { total_ppay: 0, virtual: true, employee: employee.id }
  var salaries = {}, salaryIndex = 0
  range.forEach(date => {
    // Overflow / empty salaries
    if (salariesArray.length === salaryIndex) {
      salaries[date] = { ...virtualSalary, date }
      return
    }

    const salary = salariesArray[salaryIndex]
    let curDate = Date.parse(date)
    let salaryDate = Date.parse(salary.date)

    if (curDate < salaryDate) {
      salaries[date] = { ...virtualSalary, date }
    }
    else if (date === salary.date) {
      salaries[date] = { ...salary }
      let { total_ppay } = salary
      virtualSalary = { ...virtualSalary, total_ppay }
      salaryIndex++
    }
    else if (curDate > salaryDate) {
      // TODO: fix this so that it iterates the salaries until match / less than
      let { total_ppay } = salary
      salaries[date] = { ...virtualSalary, total_ppay, date: salary.date }
    }
  })

  return salaries
}

