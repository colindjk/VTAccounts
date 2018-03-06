import React from 'react';

import { AccountTreeContainer } from 'containers/grid';
import { EmployeeGrid } from 'components/grid';

const Dashboard = () => (
  <div>
    <h1>Dashboard</h1>
    <AccountTreeContainer>
      <EmployeeGrid />
    </AccountTreeContainer>
  </div>
);

export default Dashboard;
