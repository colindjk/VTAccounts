import './index.css';

import React from 'react';
import { Route } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';

import { Sidebar } from 'components/ui';
import MultiRouter from 'util/MultiRouter';

const HOME_DIR = '/home';

const routes = [
  {
    path: '/employees',
    component: () => {
      console.log("accessing employees");
      return (<div>HI</div>)
    },
    children: [
      {
        path: '/create'
      },
      {
        path: '/:id'
      },
      {
        path: '/:id/edit'
      },
    ]
  },
  {
    path: '/funds/:id',
  },
  {
    path: '/users/:id/edit',
  }
];

const Home = () => {
  return (
    <div id="home-container" className="fill content-wrapper">
      <Container fluid className="home-container p-0">
        <Row className="no-gutters">
          <Sidebar routes={routes} />
          <Col className="offset-sm-2">
            {/* Below is where the different views will go (check email for views)*/}
            <Container id="home-main-container" fluid>
              {MultiRouter(routes, HOME_DIR)}
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
