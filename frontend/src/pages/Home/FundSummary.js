import React from 'react';
import { connect } from 'react-redux'

const FundSummary = () => (
  <div>
    <Container fluid>
      <Row>
        <h1>Fund Summary</h1>
      </Row>
      <Row>
        <Col sm="11">
          <FundListContainer/>
        </Col>
      </Row>
    </Container>
  </div>
);

export default FundSummary;

