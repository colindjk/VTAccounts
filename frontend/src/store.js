import { compose, createStore, applyMiddleware } from 'redux';
//import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga'
import { persistStore } from 'redux-persist';
import rootReducer from './reducers';
import rootSaga from 'actions/sagas'

const sagaMiddleware = createSagaMiddleware()

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(
      //createLogger(),
      sagaMiddleware
    ),
    //autoRehydrate()
  )
);

sagaMiddleware.run(rootSaga)

persistStore(store);
export default store;
