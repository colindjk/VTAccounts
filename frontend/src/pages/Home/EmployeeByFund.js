import React from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col, Form, FormGroup, Input, Label, Button } from 'reactstrap'

import * as actionType from 'actions/types'
import { deepCopy } from 'util/helpers'
import { AccountByFundContainer } from 'containers/grid'
import { submitContextForm } from 'actions/grid-view'

// See "reducers/index.js" for details on context form submission
class EmployeeContextForm extends React.Component {
  constructor(props) {
    /* props: { fundList } */
    super(props);
    if (props.initialState) {
      let { employee, startDate, endDate } = deepCopy(props.initialState)
      startDate = startDate.substring(0, startDate.indexOf('T'))
      endDate = endDate.substring(0, endDate.indexOf('T'))
      this.state = { employee, startDate, endDate }
    } else {
      // FIXME: Find a better way for init via contextForm superclass.
      this.state = {employee: this.props.employeeList[0].id, startDate: '2017-06-01', endDate: '2018-06-01'};
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    switch (event.target.id) {
      case 'employeeField':
        this.setState({employee: event.target.value})
        break
      case 'startDateField':
        this.setState({startDate: event.target.value})
        break
      case 'endDateField':
        this.setState({endDate: event.target.value})
        break
    }
  }

  handleSubmit(event) {
    const employeeKey = this.state.employee
    console.log("EMPLOYEEFORM SUBMIT", employeeKey)
    const contextForm = {
      employee: employeeKey,
      startDate: new Date(this.state.startDate),
      endDate: new Date(this.state.endDate),
    }

    this.props.submitContextForm(contextForm)
    event.preventDefault();
  }

  render() {
    return (
      <Form inline onSubmit={this.handleSubmit}>
        <FormGroup>
          <Label>Employee: </Label>
          <Input id="employeeField" type="select" value={this.state.fund} onChange={this.handleChange}>
            {this.props.employeeList.map(employee =>
              <option key={employee.id} value={employee.id}>{employee.first_name} {employee.last_name}</option>
            )}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>Range: </Label>
          <Input id="startDateField" type="date" value={this.state.startDate} onChange={this.handleChange}/>
        </FormGroup>
        <FormGroup>
          <Label>- to -</Label>
          <Input id="endDateField" type="date" value={this.state.endDate} onChange={this.handleChange}/>
        </FormGroup>
        <input type="submit" value="Submit" />
      </Form>
    );
  }
}

const mapFormDispatchToProps = (dispatch) => ({
  submitContextForm: contextForm => {
    dispatch(submitContextForm(contextForm))
    dispatch({ type: actionType.SET_ACCOUNT_TREE_CONTEXT, contextForm })
  }
})

const mapFormStateToProps = (state) => ({
  initialState: state.ui.contextForm
})

const ContextFormContainer = connect(mapFormStateToProps, mapFormDispatchToProps)(EmployeeContextForm)

const EmployeeByFund = ({ context, employees, fetchEmployees }) => {
  const Header = ({ name }) => <h1>{name}</h1>
  if (!employees) {
    fetchEmployees()
    return <div>Loading page data...</div>
  }

  var employeeName = "Choose an Employee"
  if (context) {
    const employee = employees[context.employee] || { first_name: "None", last_name: "None" }
    employeeName = employee.first_name + " " + employee.last_name
  }

  return (
    <div>
      <Container fluid>
        <Row>
          <Header name={employeeName}/>
        </Row>
        <Row>
          <ContextFormContainer employeeList={Object.keys(employees).map(id => employees[id]).filter(employee => employee.transactable)}/>
        </Row>
        <Row>
          <Col sm="11">
            <AccountByFundContainer/>
          </Col>
        </Row>
      </Container>
    </div>
  )
};

const mapStateToProps = (state) => ({
  employees: state.records.employees,
  context: state.ui.context,
})

const mapDispatchToProps = (dispatch) => ({
  fetchEmployees: () => dispatch({ type: actionType.FETCH_EMPLOYEES })
})

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeByFund)

