import React, { useState, useEffect } from 'react'
import { SingleDatePicker } from 'react-dates'
import { connect } from 'react-redux'

import moment from 'moment'

import { putSalaryFile } from 'actions/records'
import { connectSettings } from 'actions/settings'
import * as records from 'selectors/records'
import { payPeriodStart, prevPayPeriodDate } from 'util/date'

import { importFormStyle } from './index'

import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
} from 'reactstrap'

const initialSettings = {
  isSubmitting: false,
  comment: "",
  date: payPeriodStart(moment()).format("YYYY-MM-DD"),
  filename: "",
}

const SalaryImportForm = ({
  name,
  isLoading,
  postFile,

  settings: { isSubmitting, date, filename, comment },
  updateSettings,
  resetSettings,
}) => {
  // Form Fields
  const [file, setFile] = useState(null)

  // ui 
  const [isFocused, setFocused] = useState(false)

  useEffect(() => { 
    if (isSubmitting && !isLoading) { resetSettings() }
  }, [isLoading])
  useEffect(() => {
    if (!isSubmitting && file === null) updateSettings({filename: ""})
  }, [isSubmitting])

  // Assumes 
  const canSubmit = file && date && comment && !isSubmitting
  const handleSubmit = () => {
    postFile({file, date, comment})
    updateSettings({ isSubmitting: true })
  }

  return (
    <Form id={name} style={importFormStyle} onSubmit={e => e.preventDefault()}>
      <FormGroup>
        <Label for={name + "_datepicker"}>Date</Label>
        <br/>
        <SingleDatePicker
          id={name + "_datepicker"}
          date={moment(date, "YYYY-MM-DD")}
          numberOfMonths={4}
          onDateChange={date =>
            updateSettings({ date: payPeriodStart(date).format("YYYY-MM-DD") })
          }
          focused={isFocused}
          isOutsideRange={() => false}
          onFocusChange={({ focused }) => setFocused(focused)}
          displayFormat={() => 'YYYY-MM-DD'}
        />
      </FormGroup>
      <FormGroup>
        <Label for={name + "_comment"}>Comment</Label>
        <br/>
        <Input id={name + "_comment"}
               onChange={e => updateSettings({ comment: e.target.value })}
               value={comment}
        />
        <FormText>
          Provide a unique identifier to search for this file by.
        </FormText>
      </FormGroup>
      <FormGroup>
        <Label for={name + "_file"}>File: {filename}</Label>
        <br/>
        <Input id={name + "_file"} type="file" name="file"
               onChange={e => {
                 updateSettings({ filename: e.target.value.split('\\').pop() })
                 setFile(e.target.files[0])
               }}/>
        <FormText>
          Choose a file with "*.xlsx" format
        </FormText>
      </FormGroup>
      <Button disabled={!canSubmit} onClick={handleSubmit}>Submit</Button>
      <div style={{float: "right"}}>{isSubmitting ? "loading..." : ""}</div>
    </Form>
  )
}

const mapStateToProps = state => ({
  isLoading: records.isSalaryFileLoading(state),
})

const mapDispatchToProps = dispatch => ({
  postFile: data => dispatch(putSalaryFile(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(
  connectSettings(
    SalaryImportForm, 
    { initialSettings, name: "forms_imports_salary" }
  )
)
