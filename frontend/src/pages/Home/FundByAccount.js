import React from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col, Form, FormGroup, Input, Label, Button } from 'reactstrap'

import * as actionType from 'actions/types'
import GridContainer from 'containers/grid/GridContainer'

// There are two forms for the AccountTree table.
// DataForm     => { fund, startDate, endDate }
// ContextForm  => { reduce: { id: [filter XOR flatten XOR default], ... }, defaultState }
//
// Then the table itself will have a state
// tableState   => { rows, expanded: {}, }
class AccountTreeContextForm extends React.Component {
  constructor(props) {
    /* props: { fundList } */
    super(props);
    this.state = {fund: 1, startDate: '2017-06-06', endDate: '2018-01-01'};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    switch (event.target.id) {
      case 'fundField':
        this.setState({fund: event.target.value})
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
    const contextForm = {
      fund: parseInt(this.state.fund),
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
          <Label>Fund: </Label>
          <Input id="fundField" type="select" value={this.state.fund} onChange={this.handleChange}>
            {this.props.fundList.map(fund => <option key={fund.id} value={fund.id}>{fund.name}</option>)}
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
    dispatch({ type: actionType.SET_ACCOUNT_TREE_CONTEXT, contextForm })
  }
})

const ContextFormContainer = connect(null, mapFormDispatchToProps)(AccountTreeContextForm)

const FundByAccount = ({ funds, fetchFunds }) => {
  if (!funds) {
    fetchFunds()
    return <div>Loading page data...</div>
  }
  return (
    <div>
      <Container fluid>
        <Row>
          <Col sm="4">
          <h1>Fund by Account</h1>
          </Col>
          <Col sm="8">
            {/* TODO: Put this into it's own component. */}
            <ContextFormContainer fundList={Object.keys(funds).map(id => funds[id])}/>
            {/* End form */}
          </Col>
        </Row>
        <Row>
          <Col sm="11">
            <GridContainer/>
          </Col>
        </Row>
      </Container>
    </div>
  )
};

const mapStateToProps = (state) => ({
  funds: state.records.funds
})

const mapDispatchToProps = (dispatch) => ({
  fetchFunds: () => dispatch({ type: actionType.FETCH_FUNDS })
})

export default connect(mapStateToProps, mapDispatchToProps)(FundByAccount)

