import React from 'react';

import { GridContainer } from 'containers/grid';
import { BaseGrid } from 'components/grid';
//import GridContainer from 'containers/grid/GridContainer';

const Dashboard = () => (
  <div>
    <h1>Dashboard</h1>
    <GridContainer>
      <BaseGrid />
    </GridContainer>
  </div>
);

export default Dashboard;
