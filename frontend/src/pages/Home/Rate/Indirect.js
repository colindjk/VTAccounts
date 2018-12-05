import React from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col } from 'reactstrap'

import * as actionType from 'actions/types'
import { IndirectContainer } from 'containers/grid'

const Indirect = () => (
  <div>
    <Container fluid>
      <Row>
        <h1>Indirect Rates</h1>
      </Row>
      <Row>
        <Col sm="11">
          <IndirectContainer/>
        </Col>
      </Row>
    </Container>
  </div>
);

export default Indirect
