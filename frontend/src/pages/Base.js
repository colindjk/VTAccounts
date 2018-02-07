import React from 'react';
import { Container } from 'reactstrap';

import Navigation from 'containers/ui/Navigation';

const Base = () => {
  return (
    <div>
      <Navigation/>
      <div className="content-wrapper">
        <Container fluid>

        </Container>
      </div>
    </div>
  )
};

export default Base;
