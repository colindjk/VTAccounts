import React from 'react';
import { Container, Row, Col } from 'reactstrap';

import { Sidebar } from 'components/ui';

const Home = () => {
  return (
    <div className="content-wrapper">
        <Container fluid className="p-0">
          <Row className="no-gutters">
            <Sidebar />
            <Col>
              <Container fluid>
              {/* This is where the different views will go (check email for views)*/}
              </Container>
            </Col>
            <Col>
            </Col>
          </Row>
        </Container>
    </div>
  )
};

export default Home;
