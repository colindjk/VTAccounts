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
    "comment",
  ]
}

const TransactionFilePicker = ({
  title,
  name,
  files,
  submitFile,
  currentFile, // update this by settingsFormSubmit
}) => {
  const [selectedFile, setSelectedFile] = useState(currentFile)
  const [searchFile, setSearchFile] = useState(undefined)
  const [splitButtonOpen, setSplitButtonOpen] = useState(false)

  useEffect(() => setSelectedFile(currentFile), [currentFile])

  // return an array of employees based on 
  let filesArray = intoArray(files)
    .sort((a, b) => a.comment.localeCompare(b.comment))
  if (searchFile) {
    let fuse = new Fuse(filesArray, fuseOptions)
    filesArray = fuse.search(searchFile)
  }

  const dropdownModifiers = { offset: { enabled: true, offset: 0 } }

  return (
    <InputGroup>
      <InputGroupButtonDropdown addonType="prepend"
          isOpen={splitButtonOpen}
          toggle={() => {
            setSplitButtonOpen(!splitButtonOpen)
            setSearchFile(undefined)
          }}>
        <DropdownToggle split outline color={"primary"}/>
        <DropdownMenu
            modifiers={dropdownModifiers}
            style={{minWidth: 250, maxHeight: 400, overflowY: "scroll"}}
          >
          {
            filesArray.map(({ id, comment }) =>
            (
              <DropdownItem
                  key={id}
                  value={id}
                  onClick={() => setSelectedFile(id)}>
              {comment}
              </DropdownItem>
            ))
          }
        </DropdownMenu>
      </InputGroupButtonDropdown>

      <InputGroupAddon addonType="append">
        <Input
          title={files[selectedFile] ? files[selectedFile].comment 
            : "Choose a file"}
          style={{minWidth: "200px", maxWidth: "300px", borderRadius: 0}}
          type="text"
          className="form-control typeahead border-primary"
          placeholder="Enter file query..."
          autoComplete="on"
          onClick={e => setSplitButtonOpen(!splitButtonOpen)}
          onSubmit={value => console.log(value)}
          onChange={e => { setSearchFile(e.target.value) }}
          onFocus={() => setSearchFile("")}
          value={(searchFile !== undefined
                    ? searchFile 
                    : (files[selectedFile] ? files[selectedFile].comment
                                           : ""
                ))}
        />
        <Button style={{minWidth: 100}}
            onClick={() => {
              submitFile(selectedFile)
            }}
            className="record-picker-btn" outline color="primary"
        >
          {selectedFile === currentFile ? "File" : "Submit"}
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}

const mapStateToProps = state => ({
  files: records.getTransactionFileData(state)
})

export default connect(mapStateToProps)(TransactionFilePicker)
