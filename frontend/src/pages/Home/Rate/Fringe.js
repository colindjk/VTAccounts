import React from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col } from 'reactstrap'

import * as actionType from 'actions/types'
import { FringeContainer } from 'containers/grid'

const Fringe = () => (
  <div>
    <Container fluid>
      <Row>
        <h1>Fringe Rates</h1>
      </Row>
      <Row>
        <Col sm="11">
          <FringeContainer/>
        </Col>
      </Row>
    </Container>
  </div>
);

export default Fringe
