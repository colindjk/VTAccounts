import React from 'react';
import { Container } from 'reactstrap';

class GridContainer extends React.Component {

  render() {

    return (
      <div>
        <Container>
          {this.props.children}
        </Container>
      </div>
    )
  }
}

export default GridContainer;

