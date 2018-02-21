import GridRecordsSagas from './records'
import GridUISagas from './ui'

// For editable views, the data being viewed will actually be remapped and
// stored in the state. 

export default []
    .concat(GridRecordsSagas)
    .concat(GridUISagas)

