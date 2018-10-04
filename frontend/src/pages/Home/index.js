import './index.css';

import React from 'react';
import { connect } from 'react-redux'
import { Route } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';

import { INIT_RECORDS } from 'actions/types'
import { Sidebar } from 'components/ui';
import MultiRouter from 'util/MultiRouter';

import Dashboard from './Dashboard'
import FundSummary from './FundSummary'
import FundByAccount from './FundByAccount'
import EmployeeByFund from './EmployeeByFund'
import EmployeeSummary from './EmployeeSummary'

import TransactionFileImport from './TransactionFileImport.js'
import Debug from './Debug'

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
    title: 'Fund by Accounts',
    path: '/accounts/funds',
    component: FundByAccount,
  },
  {
    title: 'Funds',
    path: '/funds/summary',
    component: FundSummary,
  },
  {
    title: 'Employee by Funds',
    path: '/funds/employee',
    component: EmployeeByFund,
  },
  {
    title: 'Employee Salaries',
    path: '/employees/salaries',
    //component: EmployeeSummary,
    component: () => (<div>This page is currently under construction</div>),
  },
  {
    title: 'Employee Summary',
    path: '/employees/summary',
    //component: EmployeeSummary,
    component: () => (<div>This page is currently under construction</div>),
  },
  {
    title: 'Transaction Import',
    path: '/imports/transactions',
    component: TransactionFileImport,
  },
  {
    title: 'Salary Import',
    path: '/imports/salary',
    component: Debug,
  }
];


  // Soon this will be `initAuth`, and upon successful authentication, core
  // records will be queried from the database.
  //componentDidMount() {
    //this.props.initRecords()
  //}
class Home extends React.Component {
  componentDidMount() {
    this.props.initRecords()
  }

  render() {
    const MainWindow = this.props.initialized ?
        () => (<Col className="offset-sm-2">
          {/* Below is where the different views will go (check email for views)*/}
          <Container id="home-main-container" fluid>
            {MultiRouter(routes, HOME_DIR)}
          <br/>
          </Container>
        </Col>)
          :
        () => (<Col className="loader"/>)

    return (
      <div id="home-container" className="fill content-wrapper">
        <Container fluid className="home-container p-0">
          <Row className="no-gutters">
            <Sidebar rootPath={HOME_DIR} routes={routes} />
            <MainWindow/>
          </Row>
        </Container>
      </div>
    )
  }
};

const mapDispatchToProps = dispatch => ({
  initRecords: () => dispatch({ type: INIT_RECORDS })
})

const mapStateToProps = state => ({
  initialized: state.records.initialized
})

export default connect(mapStateToProps, mapDispatchToProps)(Home);
