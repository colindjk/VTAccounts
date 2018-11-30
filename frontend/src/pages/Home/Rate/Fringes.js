import React from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col } from 'reactstrap'

import * as actionType from 'actions/types'
import { FringesContainer } from 'containers/grid'

const Fringes = () => (
  <div>
    <Container fluid>
      <Row>
        <h1>Fringe Rates</h1>
      </Row>
      <Row>
        <Col sm="11">
          <FringesContainer/>
        </Col>
      </Row>
    </Container>
  </div>
);

export default Fringes
