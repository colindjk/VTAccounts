import 'store'

import * as records from 'selectors/records'

import BaseDateSelector from './BaseDateSelector'

// Note: When setting `id` fields for testing, always make sure they're nonzero.
const makeTestRecordData = () => {
  let obj = {}
  for (var i = 1; i <= 10; i++) {
    obj[i] = {
      name: "test: " + i,
      id: i,
    }
  }
  return obj
}

const makeTestDateRecordData = () => {
  let obj = {}
  for (var i = 1; i <= 100; i++) {
    obj[i] = {
      id: i,
      timestamp: i % 47, // divide by prime, quick-n-dirty non-rng irregular pattern
      testValA: (i % 10 * 10) + 1, // `+ 1` -> make it easy to count the # of values found
      testValB: (i % 20 * 20) + 1,
      testValC: (i % 50 * 50) + 1,
      related: (i - 1) % 10 + 1,
    }
  }
  return obj
}

const testRecordData = makeTestRecordData()
const testDateRecordData = makeTestDateRecordData()

// Created to test for memoization. Remember, the inner selector doesn't care about a
// timestamp. Instead, if given entirely new parameters,
const testState = () => ({
  records: {
    test: {
      data: makeTestRecordData(),
      timestamp: 3, valid: true, loading: 0, initialized: true
    },
    testDate: {
      data: makeTestDateRecordData(),
      timestamp: 46, valid: true, loading: 0, initialized: true
    }
  }
})

const getTest = records.getRecordsCreator("test")
const getTestDate = records.getRecordsCreator("testDate")

// The tests will aggregate the `testValue` to verify functionality.
class TestDateSelector extends BaseDateSelector {

  // The core function of the DateSelector subclasses. 
  // It must take the `state, date, id` fields precisely the way the
  // cachedSelector does b/c the function can recurse.
  dateSelector(...args) {
    return this.selectRelatedRecords(...args)
  }

  selectRecordData(state) {
    return getTest(state)
  }

  groupDateRecords(state) {
    return records.groupBy(state, getTestDate, "testValA", "testValB")
  }
}

const expectedResults1 = () => {
  let values = []
  for (var i = 0; i < 100; i += 20) {
    values.push({
      id: 1 + i,
      timestamp: (1 + i) % 47,
      testValA: 11,
      testValB: 21,
      testValC: 51 + ((i%50)*50),
      related: i % 10 + 1,
    })
  }
  return values
}

// Given state and a testDateRecord, return a new state.
const updateTestDateRecord = (state, testDateRecord) => ({
  ...state,
  records: {
    ...state.records,
    testDate: {
      ...getTestDate(state),
      timestamp: Math.max(getTestDate(state).timestamp, testDateRecord.timestamp),
      data: {
        ...getTestDate(state).data,
        [testDateRecord.id]: testDateRecord
      }
    }
  }
})

// Need to run a proper test that checks there is no crash. 
describe('`TestDateSelector` function', () => {
  it('should init data', () => {
    const dateSelector = new TestDateSelector()
    expect(dateSelector).toEqual(dateSelector)
  })

  it('`groupDateRecords` should have proper timestamps', () => {
    const dateSelector = new TestDateSelector()

    const grouped = dateSelector.groupDateRecords(testState())
    expect(grouped.grouped.timestamp).toEqual(46) // Timestamp is maxed at base
  })

  // This makes sure that based on the equation used to generate these values, the correct
  // values are found in slices of the grouped data.
  it('`groupDateRecords` should group correctly', () => {
    const dateSelector = new TestDateSelector()
    expect(dateSelector.selectRelatedRecords(testState(), 11, 21)).toEqual(expectedResults1())
    expect(dateSelector.getTimestamp(testState(), 11, 21)).toEqual(41)
  })

  // This makes sure that based on the equation used to generate these values, the correct
  // values are found in slices of the grouped data.
  it('`groupDateRecords` should group correctly after update', () => {
    const dateSelector = new TestDateSelector()
    expect(dateSelector.selectRelatedRecords(testState(), 11, 21)).toEqual(expectedResults1())
    expect(dateSelector.getTimestamp(testState(), 11, 21)).toEqual(41)
  })

  // A basic test to see that u
  it('`groupDateRecords` should have proper cache granularity', () => {
    const dateSelector = new TestDateSelector()
    const cachedSelector = records.groupBy
    expect(dateSelector.selectDate(testState(), 11, 21))
    expect(cachedSelector.recomputations()).toEqual(1)
    dateSelector.selectDate(testState(), 11, 21)
    expect(cachedSelector.recomputations()).toEqual(1)

    let updatedState = updateTestDateRecord(testState(), {
      id: 1,
      timestamp: 47,
      testValA: 11,
      testValB: 21,
      testValC: 0,
      related: 1,
    })

    dateSelector.selectDate(updatedState, 11, 21)
    expect(cachedSelector.recomputations()).toEqual(2)
    dateSelector.selectDate(updatedState, 11, 21)
    expect(cachedSelector.recomputations()).toEqual(2)
  })

  // A basic test to see that u
  it('`selectDate` should have proper cache granularity', () => {
    const dateSelector = new TestDateSelector()
    const cachedSelector = dateSelector.getCachedDateSelector()
    expect(dateSelector.selectDate(testState(), 11, 21))
    expect(cachedSelector.recomputations()).toEqual(1)
    dateSelector.selectDate(testState(), 11, 21)
    expect(cachedSelector.recomputations()).toEqual(1)

    dateSelector.selectDate(testState(), 11, 22)
    expect(cachedSelector.recomputations()).toEqual(2)
    dateSelector.selectDate(testState(), 11, 21)
    expect(cachedSelector.recomputations()).toEqual(2)
    dateSelector.selectDate(testState(), 12, 21)
    expect(cachedSelector.recomputations()).toEqual(3)
  })

  it('`selectDate` should recompute when data is modified', () => {
    const dateSelector = new TestDateSelector()
    const cachedSelector = dateSelector.getCachedDateSelector()
    expect(dateSelector.selectDate(testState(), 11, 21))
    expect(cachedSelector.recomputations()).toEqual(1)
    dateSelector.selectDate(testState(), 11, 21)
    expect(cachedSelector.recomputations()).toEqual(1)
    dateSelector.selectDate(testState(), 11, 22)
    expect(cachedSelector.recomputations()).toEqual(2)

    let updatedState = updateTestDateRecord(testState(), {
      id: 1,
      timestamp: 47,
      testValA: 11,
      testValB: 21,
      testValC: 0,
      related: 1,
    })

    dateSelector.selectDate(updatedState, 11, 21)
    expect(cachedSelector.recomputations()).toEqual(3)
    dateSelector.selectDate(updatedState, 11, 21)
    expect(cachedSelector.recomputations()).toEqual(3)
  })

})

// Equation for a testDateRecord
// {
//   id: i,
//     timestamp: i % 3,
//     testValA: (i % 10 * 10) + 1,
//     testValB: (i % 20 * 20) + 1,
//     testValC: (i % 50 * 50) + 1,
//     related: (i) % 10,
// }

