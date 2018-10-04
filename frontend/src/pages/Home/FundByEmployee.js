import React from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col, Form, FormGroup, Input, Label, Button } from 'reactstrap'

import * as actionType from 'actions/types'
import { deepCopy } from 'util/helpers'
import { FundByEmployeeContainer } from 'containers/grid'

import { FundContextFormContainer } from './FundByAccount'

const FundByEmployee = ({ context, funds, fetchFunds }) => {
  const Header = ({ name }) => <h1>{name}</h1>
  if (!funds) {
    fetchFunds()
    return <div>Loading page data...</div>
  }

  var fundName = "Choose a Fund"
  if (context) {
    const fund = funds[context.fund] || { name: "All" }
    fundName = funds[context.fund] ? funds[context.fund].name : 'All Fund'
  }

  return (
    <div>
      <Container fluid>
        <Row>
          <Header name={fundName}/>
        </Row>
        <Row>
          <FundContextFormContainer fundList={Object.keys(funds).map(id => funds[id])}/>
        </Row>
        <Row>
          <Col sm="11">
            <FundByEmployeeContainer/>
          </Col>
        </Row>
      </Container>
    </div>
  )
};

const mapStateToProps = (state) => ({
  funds: state.records.funds,
  context: state.ui.context,
})

const mapDispatchToProps = (dispatch) => ({
  fetchFunds: () => dispatch({ type: actionType.FETCH_FUNDS })
})

export default connect(mapStateToProps, mapDispatchToProps)(FundByEmployee)

