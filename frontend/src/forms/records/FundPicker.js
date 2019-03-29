import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Fuse from "fuse.js";

import * as records from 'selectors/records'
import { intoArray } from 'util/helpers'

import {
  Button,
  Fade,
  InputGroup,
  InputGroupButtonDropdown,
  InputGroupAddon,
  Input,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

const fuseOptions = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "name",
    "code",
  ]
}

const FundPicker = ({
  title,
  name,
  funds,
  submitFund,
  currentFund, // update this by settingsFormSubmit
}) => {
  const [selectedFund, setSelectedFund] = useState(currentFund)
  const [searchFund, setSearchFund] = useState(undefined)
  const [splitButtonOpen, setSplitButtonOpen] = useState(false)

  useEffect(() => setSelectedFund(currentFund), [currentFund])

  // return an array of employees based on 
  let fundsArray = intoArray(funds)
    .sort((a, b) => a.code.localeCompare(b.code))
  if (searchFund) {
    let fuse = new Fuse(fundsArray, fuseOptions)
    fundsArray = fuse.search(searchFund)
  }

  const dropdownModifiers = { offset: { enabled: true, offset: -55 } }

  return (
    <InputGroup>
      <InputGroupButtonDropdown addonType="prepend"
          isOpen={splitButtonOpen}
          toggle={() => {
            setSplitButtonOpen(!splitButtonOpen)
            setSearchFund(undefined)
          }}>
        <DropdownToggle split outline color={"primary"}/>
        <DropdownMenu
            modifiers={dropdownModifiers}
            style={{minWidth: 250, maxHeight: 400, overflowY: "scroll"}}
          >
          {
            fundsArray.map(({ id, code, name }) =>
            (
              <DropdownItem
                  key={id}
                  value={id}
                  onClick={() => setSelectedFund(id)}>
                {code} | {name}
              </DropdownItem>
            ))
          }
        </DropdownMenu>
      </InputGroupButtonDropdown>

      <InputGroupAddon addonType="append">
        <Input
          title={funds[selectedFund] ? funds[selectedFund].code : "All Funds"}
          style={{minWidth: "200px", maxWidth: "300px", borderRadius: 0}}
          type="text"
          className="form-control typeahead border-primary"
          placeholder="Enter fund query..."
          autoComplete="on"
          onClick={e => setSplitButtonOpen(!splitButtonOpen)}
          onSubmit={value => console.log(value)}
          onChange={e => { setSearchFund(e.target.value) }}
          onFocus={() => setSearchFund("")}
          value={(searchFund !== undefined
                    ? searchFund 
                    : (funds[selectedFund] ? funds[selectedFund].name
                                           : ""
                ))}
        />
        <Button style={{minWidth: 100}}
            onClick={() => {
              submitFund(selectedFund)
            }}
            className="record-picker-btn" outline color="primary"
        >
          {selectedFund === currentFund ? "Fund" : "Submit"}
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}

const mapStateToProps = state => ({
  funds: records.getFundData(state)
})

export default connect(mapStateToProps)(FundPicker)
