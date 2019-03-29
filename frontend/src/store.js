import { compose, createStore, applyMiddleware } from 'redux'
// TODO: Get this to work properly
//import { persistStore } from 'redux-persist'
import createSagaMiddleware from 'redux-saga'

import rootReducer from 'reducers'
import rootSaga from 'sagas'

const sagaMiddleware = createSagaMiddleware()

// Modifies the action and appends a timestamp to the data.
// By relying on client-side timestamps, we avoid the "silent delete" problem
// that occurs when a deleted record isn't in the database. 
const timestampMiddleware = store => next => action => {
  const timestamp = Date.now()
  action = { ...action, timestamp }
  next(action)
}

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(
      sagaMiddleware,
      timestampMiddleware
    )
  )
)

sagaMiddleware.run(rootSaga)

// Should be noted that the store is accessed directly in `util/timestamp.js` to
// reduce code complexity. 

export default store;
