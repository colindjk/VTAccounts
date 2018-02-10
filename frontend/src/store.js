import { compose, createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistStore, autoRehydrate } from 'redux-persist';
import rootReducer from './reducers';

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(
      createLogger(),
    ),
    autoRehydrate()
  )
);

/* State Structure:
 *
 *  store: {
 *    token,
 *    appData: {
 *      funds,
 *      accounts,
 *      employees,
 *      rangeData: {
 *        transactions: {
 *          ...,
 *          fundId: {
 *            range: [startDate, endDate],
 *            payments: {
 *              ...,
 *              date: { 
 *                
 *              }
 *              ...
 *            }
 *          },
 *          ...
 *        },
 *        salaries: {
 *          
 *        }
 *      }
 *    }
 *  }
 */

persistStore(store);
export default store;
