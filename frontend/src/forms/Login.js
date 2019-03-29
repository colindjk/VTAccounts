import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'

import { login } from 'actions/records'
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

const loginStyle = {
  margin: "0 auto",
  marginTop: 50,
  width: 500,
  height: 500,
  backgroundColor: "white",
  padding: 10,
  borderRadius: 10,
  border: "2px solid grey",

}

const Login = ({
  isLoading,
  login,
}) => {
  // A file is not serializable & could therefore break redux-store.
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [isSubmitting, setSubmitting] = useState(false)
  const [isError, setError] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setSubmitting(true)
    } else if (isSubmitting) {
      // Must have errored since login didn't trigger redirect
      setError(true)
      setPassword("")
    }
  }, [isLoading])

  const canSubmit = username && password && !isLoading
  const handleSubmit = () => { login({username, password}) }

  return (
    <Form id={"login"} style={loginStyle} onSubmit={e => e.preventDefault()}>
      <h3>Login</h3>
      <hr/>
      <FormGroup>
        <Label for={"username"}>Username</Label>
        <Input id={"username"} disabled={isLoading}
               onChange={e => setUsername(e.target.value)}
               value={username}
        />
        <br/>
        <Label for={"password"}>Password</Label>
        <Input id={"password"} disabled={isLoading}
               onChange={e => setPassword(e.target.value)}
               value={password}
        />
      </FormGroup>
      <Button disabled={!canSubmit}
              onClick={handleSubmit}>
        Login
      </Button>
      <div style={{float: "right"}}>{isLoading ? "loading..." : ""}</div>
      <br/>
      {isError ? "Error: Failed to login due to invalid credentials or server timeout..." : ""}
    </Form>
  )
}

const mapStateToProps = state => ({
  isLoading: state.user.loading,
})

const mapDispatchToProps = dispatch => ({
  login: data => dispatch(login(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)

