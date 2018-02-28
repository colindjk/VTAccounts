import './index.css';

import React from 'react';
import { Route } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';

import { Sidebar } from 'components/ui';
import MultiRouter from 'util/MultiRouter';

import Dashboard from './Dashboard'
import FundSummary from './FundSummary'
import FundByAccount from './FundByAccount'
import EmployeeSummary from './EmployeeSummary'

const HOME_DIR = '/home';

// Each page will be responsible for loading up data needed to simply render
// itself.
// Forms will only be used to set data, and will only retrieve data already
// loaded by the page.
// Grids will be rendered with as little data as possible, and can be modified
// by submitting a form.
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
    title: 'Funds by Account',
    path: '/funds/accounts',
    component: FundByAccount,
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
