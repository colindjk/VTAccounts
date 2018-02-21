import React from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col, Form, FormGroup, Input, Label, Button } from 'reactstrap'

import * as actionType from 'actions/types'
import AccountTreeGrid from 'containers/grid/AccountTreeGrid'

class ContextForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: 1};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('Submitting context for fund: ' + this.state.value);
    const context = {
      fund: parseInt(this.state.value),
      startDate: new Date('2017-6-6'),
      endDate: new Date('2018-1-1'),
    }
    this.props.setContext(context)
    event.preventDefault();
  }

  render() {
    let funds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    return (
      <Form onSubmit={this.handleSubmit}>
        <label>
          Fund: <a>   </a>
          <select value={this.state.value} onChange={this.handleChange}>
            {funds.map(id => <option key={id} value={id}>{id}</option>)}
          </select>
        </label>
        <a>   </a>
        <input type="submit" value="Submit" />
      </Form>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    setContext: (context) => {dispatch({ type: actionType.SET_FUND_CONTEXT, context })}
  })
}

const ContextFormContainer = connect(null, mapDispatchToProps)(ContextForm);

const FundByAccount = ({ funds }) => (
  <div>
    <Container fluid>
      <Row>
        <Col sm="4">
        <h1>Fund by Account</h1>
        </Col>
        <Col sm="8">
          {/* TODO: Put this into it's own component. */}
          <ContextFormContainer/>
          {/* End form */}
        </Col>
      </Row>
      <Row>
        <Col sm="11">
          <AccountTreeGrid/>
        </Col>
      </Row>
    </Container>
  </div>
);

export default FundByAccount;

