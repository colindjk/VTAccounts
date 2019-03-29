import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'

import { putTransactionFile } from 'actions/records'
import { connectSettings } from 'actions/settings'
import * as records from 'selectors/records'

import { importFormStyle } from './index'

import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
} from 'reactstrap'

const transactionImportFormStyle = {
  backgroundColor: "white",
  padding: 10,
  borderRadius: 10,
  border: "2px solid grey",
}

const initialSettings = {
  isSubmitting: false,
  filename: "",
  comment: "",
}

const TransactionImportForm = ({
  name,
  isLoading,
  postFile,

  settings: { isSubmitting, filename, comment },
  updateSettings,
  resetSettings,
}) => {
  // A file is not serializable & could therefore break redux-store.
  const [file, setFile] = useState(null)

  // Only listen to isLoading since that's set after isSubmitting.
  useEffect(() => { 
    if (isSubmitting && !isLoading) { resetSettings() }
  }, [isLoading])
  useEffect(() => {
    if (!isSubmitting && file === null) updateSettings({filename: ""})
  }, [isSubmitting])

  const canSubmit = filename && comment && !isSubmitting
  const handleSubmit = () => {
    postFile({file, comment})
    updateSettings({ isSubmitting: true })
  }

  return (
    <Form id={name} style={importFormStyle} onSubmit={e => e.preventDefault()}>

      <FormGroup>
        <Label for={name + "_comment"}>Comment:</Label>
        <br/>
        <Input id={name + "_comment"}
               disabled={isSubmitting}
               onChange={e => updateSettings({ comment: e.target.value })}
               value={comment}
        />
        <FormText>
          Provide a unique identifier to search for this file by.
        </FormText>
      </FormGroup>
      <FormGroup>
        <Label for={name + "_file"}>File: <i>{filename}</i></Label>
        <br/>
        <Input id={name + "_file"} type="file" name="file"
              disabled={isSubmitting}
                onChange={e => {
                  updateSettings({ filename: e.target.value.split('\\').pop() })
                  setFile(e.target.files[0])
                }
              }
        />
        <FormText>
          Choose a file with "*.xlsx" format
        </FormText>
      </FormGroup>
      <Button disabled={!canSubmit}
              onClick={handleSubmit}>
        Submit
      </Button>
      <div style={{float: "right"}}>{isSubmitting ? "loading..." : ""}</div>
    </Form>
  )
}

const mapStateToProps = state => ({
  isLoading: records.isTransactionFileLoading(state),
})

const mapDispatchToProps = dispatch => ({
  postFile: data => dispatch(putTransactionFile(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(
  connectSettings(
    TransactionImportForm, 
    { initialSettings, name: "forms_imports_transaction" }
  )
)
