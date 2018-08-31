import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap'

import { Sidebar } from 'components/ui'
import * as actionType from 'actions/types'

// This component triggers the AUTHENTICATE action.
class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "", password: "" }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    console.log(event.target.value)
    switch (event.target.id) {
      case 'usernameField':
        this.setState({username: event.target.value})
        break
      case 'passwordField':
        this.setState({password: event.target.value})
        break
    }
  }

  handleSubmit(event) {
    let { username, password } = this.state
    this.props.submitForm({ username, password })
    event.preventDefault()
  }

  render() {
    return (
      <div className="row justify-content-center">
        <div className="col-10 col-sm-7 col-md-5 col-lg-4">
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Label for="username">Username</Label>
              <Input
                type="text"
                name="text"
                id="usernameField"
                placeholder="username"
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="userPassword">Password</Label>
              <Input
                type="password"
                name="password"
                id="passwordField"
                placeholder="password"
                onChange={this.handleChange}
              />
            </FormGroup>
            <Button>Log In</Button>
          </Form>
        </div>
      </div>
    );
  }
}

const mapFormDispatchToProps = (dispatch) => ({
  submitForm: form => {
    dispatch({ type: actionType.AUTHENTICATION, form })
  }
})

const mapFormStateToProps = (state) => ({
  isAuthenticated: state.user.isAuthenticated
})

const LoginFormContainer = connect(null, mapFormDispatchToProps)(LoginForm)

export default class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const MainWindow = () => 
      (
        <Col>
          {/* Below is where the different views will go (check email for views)*/}
          <Container id="home-main-container" fluid>
            <LoginFormContainer />
            <br/>
          </Container>
        </Col>
      )

    return (
      <div id="home-container" className="fill content-wrapper">
        <Container fluid className="home-container p-0">
          <Row className="no-gutters">
            <MainWindow/>
          </Row>
        </Container>
      </div>
    );
  }
}

