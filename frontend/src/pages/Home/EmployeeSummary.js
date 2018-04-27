import React from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col } from 'reactstrap'

import * as actionType from 'actions/types'
import { EmployeeTransactableContainer } from 'containers/grid'

const EmployeeSummary = () => (
  <div>
    <Container fluid>
      <Row>
        <h1>Employees</h1>
      </Row>
      <Row>
        <Col sm="11">
          <EmployeeTransactableContainer/>
        </Col>
      </Row>
    </Container>
  </div>
);

export default EmployeeSummary
