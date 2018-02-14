import { takeEvery, call, put, all } from 'redux-sagas'

import * as actionType from 'actions/types';

export function* onFetchRecords() {
  yield takeEvery(actionType.FETCH_RECORDS, function* fetchRecords() {
    console.log("go fetch");
    try {
      const response = yield call(fetch, 'http://localhost:8000/api/accounts/')
      const responseBody = response.json();
      responseBody.then((json) => {
        console.log(json)
      })

    } catch (e) {
      console.log(e)
      return;
    }

    //yield put(setRecords(responseBody.records));
  });
}

// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
    //watchIncrementAsync(),
    onFetchRecords(),
  ])
}
