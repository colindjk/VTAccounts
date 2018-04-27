import React from 'react'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import * as Api from 'config/Api'

import Dropzone from 'react-dropzone'

function uploadFile(file) {

  var data = new FormData()
  data.append('file', file)

  fetch(Api.IMPORT_TRANSACTIONS, {
      method: 'POST',
      body: data,
    }
  ).then(response => response.json()
  ).then(json => console.log(json))

}

class FileUploader extends React.Component {
  constructor() {
    super()
    this.state = { files: [] }
  }

  onDrop(files) {
    this.setState({
      files
    });
  }

  render() {
    return (
      <section>
        <div className="dropzone">
          <Dropzone onDrop={this.onDrop.bind(this)}>
            <p>Click or drop a transaction file here...</p>
          </Dropzone>
        </div>
        <aside>
          <h2>Staged Files</h2>
          <ul>
            {
              this.state.files.map(f =>
                <li key={f.name}>
                  <button onClick={() => uploadFile(f)}>+</button> {f.name} - {f.size} bytes
                </li>
              )
            }
          </ul>
        </aside>
        
      </section>
    );
  }
}

const structure = {
  reducer: {
    // accountKey: 
  }
  //defaultState: { rows, expanded }
}

function mapDispatchToProps(dispatch) {
  return ({

  })
}

function mapStateToProps(state) {
  return ({

  })
}

export default connect(mapStateToProps, mapDispatchToProps)(FileUploader);

