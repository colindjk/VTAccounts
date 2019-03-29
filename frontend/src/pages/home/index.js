import React from 'react'

import { Dashboard } from 'containers'
import * as Api from 'actions/types/api'

import {
  TransactionImport,
  SalaryImport,
} from 'containers/imports'

import {
  AccountTreeGrid,
  FundSummaryGrid,
  EmployeeSalaryGrid,
  IndividualEmployeeGrid,
  FringeGrid,
  IndirectGrid,

  TransactionMetadataGrid,
} from 'containers/grid'

const pageStyle = { height: "100%", width: "100%" }

// Naming scheme for routes / `name` field.
// <plural_row_data> + <filters?> + <plural_range_data>

const BasePage = props => (
  <div style={pageStyle} id={props.name} {...props}/>
)

// Has a selector for the underlying data being viewed. 
export default [
  {
    title: 'Dashboard',
    navTitle: 'Home',
    name: 'pages_home_dashboard',
    path: '',
    formFields: [Api.FUND],
    component: Dashboard,
  },
  {
    title: 'Fund',
    navTitle: 'Fund',
    name: 'home_page',
    path: '/fund',
    component: BasePage,
    children: [
      {
        title: 'Fund Summary',
        navTitle: 'Summary',
        name: 'pages_fund_payments_summary',
        path: '/summary',
        component: FundSummaryGrid,
      },
      {
        title: 'Fund by Account Tree',
        navTitle: 'Account Tree',
        name: 'pages_fund_payments',
        path: '/by/accounts',
        formFields: [Api.FUND],
        component: AccountTreeGrid,
      },
    ]
  },
  {
    title: 'Employee',
    navTitle: 'Employee',
    name: 'home_page',
    path: '/employee',
    component: BasePage,
    children: [
      {
        title: 'Employee Summary',
        navTitle: 'Individual',
        name: 'pages_employee_individual_summary',
        path: '/individual',
        formFields: [Api.EMPLOYEE],
        component: IndividualEmployeeGrid,
      },
      {
        title: 'Employee Salaries',
        navTitle: 'Salaries',
        name: 'pages_employee_salaries',
        path: '/salaries',
        component: EmployeeSalaryGrid,
      },
    ]
  },
  {
    title: 'Rates',
    navTitle: 'Rates',
    name: 'home_page',
    path: '/rates',
    component: BasePage,
    children: [
      {
        title: 'Fringe Rates',
        navTitle: 'Fringe',
        name: 'pages_rates_fringe',
        path: '/fringe',
        component: FringeGrid,
      },
      {
        title: 'Indirect Rates',
        navTitle: 'Indirect',
        name: 'pages_rates_indirect',
        path: '/indirect',
        component: IndirectGrid,
      },
    ]
  },
  {
    title: 'Imports',
    navTitle: 'Imports',
    name: 'home_page',
    path: '/imports',
    component: BasePage,
    children: [
      {
        title: 'Transaction File Import',
        navTitle: 'Transaction Import',
        name: 'pages_imports_transaction',
        path: '/transaction',
        component: TransactionImport,
      },
      {
        title: 'Salary File Import',
        navTitle: 'Salary Import',
        name: 'pages_imports_salary',
        path: '/salary',
        component: SalaryImport,
      },

      {
        title: 'Transaction Import Verification',
        navTitle: 'Transaction Verification',
        name: 'pages_imports_transaction_verification',
        path: '/verification/transaction',
        formFields: [Api.TRANSACTION_FILE],
        component: TransactionMetadataGrid,
      },
      {
        title: 'Salary Import Verification',
        navTitle: 'Salary Verification',
        name: 'pages_imports_salary_verification',
        path: '/verification/salary',
        component: () => <div>currently under construction...</div>,
      },
    ]
  },
]



