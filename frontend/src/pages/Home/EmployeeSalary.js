import React from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col } from 'reactstrap'

import * as actionType from 'actions/types'
import { EmployeeSalaryContainer } from 'containers/grid'

const EmployeeSalary = () => (
  <div>
    <Container fluid>
      <Row>
        <h1>Employees</h1>
      </Row>
      <Row>
        <Col sm="11">
          <EmployeeSalaryContainer/>
        </Col>
      </Row>
    </Container>
  </div>
);

export default EmployeeSalary
