import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Fuse from "fuse.js";

import * as records from 'selectors/records'
import { intoArray } from 'util/helpers'

import {
  Button,
  InputGroup,
  InputGroupButtonDropdown,
  InputGroupAddon,
  Input,
  DropdownToggle,
  DropdownMenu,
  DropdownItem } from 'reactstrap'

const fuseOptions = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "first_name",
    "last_name",
    "pid",
  ]
}

const EmployeePicker = ({
  title,
  name,
  employees,
  submitEmployee,
  currentEmployee, // update this by settingsFormSubmit
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(currentEmployee)
  const [searchEmployee, setSearchEmployee] = useState(undefined)
  const [splitButtonOpen, setSplitButtonOpen] = useState(false)

  useEffect(() => setSelectedEmployee(currentEmployee), [currentEmployee])

  // return an array of employees based on 
  let employeesArray = intoArray(employees)
    .sort((a, b) => String(a.pid).localeCompare(b.pid))
  if (searchEmployee) {
    let fuse = new Fuse(employeesArray, fuseOptions)
    employeesArray = fuse.search(searchEmployee)
  }

  const dropdownModifiers = { offset: { enabled: true, offset: -85 } }

  return (
    <InputGroup>
      <InputGroupButtonDropdown addonType="prepend"
          isOpen={splitButtonOpen}
          toggle={() => {
            setSplitButtonOpen(!splitButtonOpen)
            setSearchEmployee(undefined)
          }}>
        <DropdownToggle split outline color={"primary"}/>
        <DropdownMenu
            modifiers={dropdownModifiers}
            style={{minWidth: 250, maxHeight: 400, overflowY: "scroll"}}
          >
          {
            employeesArray.map(({ id, pid, first_name, last_name }) =>
            (
              <DropdownItem
                  key={id}
                  value={id}
                  onClick={() => setSelectedEmployee(id)}>
                {pid} | {first_name} {last_name}
              </DropdownItem>
            ))
          }
        </DropdownMenu>
      </InputGroupButtonDropdown>

      <InputGroupAddon addonType="append">
        <Input
          style={{borderRadius: 0}}
          type="text"
          className="form-control typeahead border-primary"
          placeholder="Enter employee query..."
          autoComplete="on"
          onClick={e => setSplitButtonOpen(!splitButtonOpen)}
          onSubmit={value => console.log(value)}
          onChange={e => { setSearchEmployee(e.target.value) }}
          onFocus={() => setSearchEmployee("")}
          value={(searchEmployee !== undefined
                    ? searchEmployee 
                    : (selectedEmployee
                      ? employees[selectedEmployee].first_name + " " +
                        employees[selectedEmployee].last_name
                      : "")
                )}
        />
        <Button style={{minWidth: 100}}
            onClick={() => {
              submitEmployee(selectedEmployee)
            }}
            className="record-picker-btn" outline color="primary"
        >
          {selectedEmployee === currentEmployee ? "Employee" : "Submit"}
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}

const mapStateToProps = state => ({
  employees: records.getEmployeeTransactables(state).data
})

export default connect(mapStateToProps)(EmployeePicker)
