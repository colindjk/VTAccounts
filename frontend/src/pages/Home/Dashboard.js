import React from 'react';

import { GridContainer } from 'containers/grid';
import { EmployeeGrid } from 'components/grid';
//import GridContainer from 'containers/grid/GridContainer';

const Dashboard = () => (
  <div>
    <h1>Dashboard</h1>
    <GridContainer>
      <EmployeeGrid />
    </GridContainer>
  </div>
);

export default Dashboard;
