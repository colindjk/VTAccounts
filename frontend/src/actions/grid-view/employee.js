
// This module will include some sagas and helpers related to employee data.

// Iterates over `employees`.
export const populateSalaries = (accounts, employees, range) => {

  for (var employeeKey in employees) {
    const employee = employees[employeeKey]
    if (employee.transactable !== null) {
      const account = accounts[employee.transactable]
      accounts[employee.transactable] = populateEmployeeSalaries(account, employee, range)
    }
  }
}

// Modifies the given account to populate it with the given data.
// Unfortunately matching dates in javascript is a bit janky, so we use the
// date strings when finding an exact date match, and Date objects otherwise.
export const populateEmployeeSalaries = (account, employee, range) => {
  const salariesArray = employee.salaries
  if (salariesArray === undefined) { console.log("ERROR: No salaries found") }

  const name = employee.first_name + " " + employee.last_name
  const code = employee.position_number

  var virtualSalary = { total_ppay: 0, virtual: true, employee: employee.id }
  var salaries = {}, salaryIndex = 0
  range.forEach(date => {
    // Overflow / empty salaries
    if (salariesArray.length === salaryIndex) {
      salaries[date] = { ...virtualSalary }
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
      // TODO: fix this so that it iterates the salaries.
      let { total_ppay } = salary
      salaries[date] = { ...virtualSalary, total_ppay, date: salary.date }
    }
  })

  return { ...account, name, code, salaries, isEmployee: true }
}

