import React from 'react'
import { connect } from 'react-redux'

import { FETCH_RECORDS } from 'actions/types'




function mapDispatchToProps(dispatch) {
  return ({
    fetch: () => {dispatch({ type: FETCH_RECORDS })}
  })
}

function mapStateToProps(state) {
  return ({data: state.records.accounts})
}

const AccountTreeGridContainer = connect(
  mapStateToProps, mapDispatchToProps)(AccountTreeGrid)

export default AccountTreeGridContainer;
