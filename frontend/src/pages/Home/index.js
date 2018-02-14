import './index.css';

import React from 'react';
import { Route } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';

import { Sidebar } from 'components/ui';
import MultiRouter from 'util/MultiRouter';

import Dashboard from './Dashboard'

import EmployeeSummary from './EmployeeSummary'
import FundByAccount from './FundByAccount'
import FundSummary from './FundSummary'

const HOME_DIR = '/home';

const routes = [
  {
    title: 'Dashboard',
    path: '',
    component: Dashboard,
  },
  {
    title: 'Funds',
    path: '/funds',
    component: FundSummary,
  },
  {
    title: 'Employees',
    path: '/employees',
    component: EmployeeSummary,
  }
];

const Home = () => {
  return (
    <div id="home-container" className="fill content-wrapper">
      <Container fluid className="home-container p-0">
        <Row className="no-gutters">
          <Sidebar rootPath={HOME_DIR} routes={routes} />
          <Col className="offset-sm-2">
            {/* Below is where the different views will go (check email for views)*/}
            <Container id="home-main-container" fluid>
              {MultiRouter(routes, HOME_DIR)}
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  )
};

export default Home;
